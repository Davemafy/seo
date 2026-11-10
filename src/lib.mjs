import { createHash } from "node:crypto";
export const landingPath = "src/routes/index.tsx";
export const scopedCssPath = "src/sloppertizer-landing.css";
export const sourceCssPath = "src/styles.css";

const count = (t,r) => (t.match(r) || []).length;
export function audit(tsx, css) {
  return {
    gradients: count(tsx + css, /\b(?:bg-gradient|text-gradient|linear-gradient|radial-gradient)\b/g),
    glass: count(tsx + css, /\b(?:glass|backdrop-blur)\b/g),
    cards: count(tsx, /<Card\b/g),
    centeredBlocks: count(tsx, /\btext-center\b/g),
    hardcodedStats: count(tsx, /\bvalue:\s*["'][\d]/g),
    hardcodedTestimonials: count(tsx, /\bquote:\s*["']/g),
    sourceBytes: Buffer.byteLength(tsx),
    anchors: [...new Set([...tsx.matchAll(/\bhref=["'](#[^"']+)/g)].map(x=>x[1]))]
  };
}
export const sha256 = text => createHash("sha256").update(text).digest("hex");

export function parseJsonReply(raw) {
  if (typeof raw !== "string") throw new Error("Model returned no text");
  const text = raw.trim().replace(/^\x60{3}(?:json)?\s*/i,"").replace(/\s*\x60{3}$/,"");
  const start = text.indexOf("{"), end = text.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("Model returned no JSON");
  return JSON.parse(text.slice(start,end+1));
}

export function validate(proposal, original) {
  const edits = proposal?.files;
  if (!edits || typeof edits !== "object" || Array.isArray(edits)) throw new Error("Missing files object");
  const paths = Object.keys(edits).sort();
  if (paths.join("|") !== [landingPath, scopedCssPath].sort().join("|")) throw new Error("Attempted edit outside landing scope");
  const jsx = edits[landingPath], css = edits[scopedCssPath];
  if (typeof jsx !== "string" || jsx.length < 1500) throw new Error("Invalid replacement page");
  if (typeof css !== "string" || css.length < 200) throw new Error("Missing scoped stylesheet");
  if (!jsx.includes('createFileRoute("/")') || !jsx.includes("export const Route")) throw new Error("Root route removed");
  if (!jsx.includes("../sloppertizer-landing.css")) throw new Error("Scoped CSS not imported");
  if (!jsx.includes('to="/auth"')) throw new Error("Auth route removed");
  if (!jsx.includes('to="/responsible-ai"')) throw new Error("Responsible AI route removed");
  if (!jsx.includes('id="features"')) throw new Error("Feature anchor removed");
  if (jsx === original) throw new Error("Not a redesign");
  if (/\b(?:eval\s*\(|document\.write\s*\(|new\s+Function\s*\()/i.test(jsx)) throw new Error("Unsafe runtime pattern");
  if (/@import\b|url\s*\(\s*["']?https?:/i.test(css)) throw new Error("Remote CSS loading blocked");
  if (/^\s*(?:body|html|:root|\*)\s*\{/m.test(css)) throw new Error("Global CSS selectors blocked");
  if (!/\.slp-/.test(css)) throw new Error("CSS lacks scoped classes");
  return { paths, direction: String(proposal.direction || "").slice(0, 1200) };
}

export async function vultr(messages, model = "glm-5.2", maxTokens = 22000) {
  const key = process.env.VULTR_INFERENCE_API_KEY;
  if (!key) throw new Error("VULTR_INFERENCE_API_KEY missing");
  const parts = [];
  let actualModel = model;
  let usage = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 240000);
    try {
      const continuation = parts.length ? [...messages, { role: "assistant", content: parts.join("") }] : messages;
      const response = await fetch("https://api.vultrinference.com/v1/chat/completions", {
        method: "POST",
        headers: { authorization: "Bearer " + key, "content-type": "application/json" },
        body: JSON.stringify({
          model, messages: continuation, temperature: 0.3,
          max_completion_tokens: maxTokens,
          reasoning: { max_tokens: 1800 }
        }),
        signal: controller.signal
      });
      if (!response.ok) throw new Error("Vultr inference HTTP " + response.status);
      const result = await response.json();
      actualModel = result.model || actualModel;
      const content = result.choices?.[0]?.message?.content;
      if (typeof content !== "string" || !content) throw new Error("Empty model output");
      parts.push(content);
      usage = result.usage || usage;
      if (result.choices?.[0]?.finish_reason !== "length") {
        return { content: parts.join(""), model: actualModel, usage };
      }
    } finally { clearTimeout(timer); }
  }
  throw new Error("Model output exceeded three continuations; rejected without modifying code");
}
