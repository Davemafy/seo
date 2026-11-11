#!/usr/bin/env python3
"""Build a separate static, client-only visual preview from verified Stage-led source.
No backend credentials, database, inference, or authenticated routes are packaged.
"""
import json
import pathlib
import shutil
import sys

if len(sys.argv) != 3:
    raise SystemExit("Usage: python3 src/package_preview.py candidate_dir preview_dir")
source = pathlib.Path(sys.argv[1]).resolve()
output = pathlib.Path(sys.argv[2]).resolve()
if not source.is_dir() or output.exists() or source in output.parents or output in source.parents:
    raise SystemExit("Expected existing source directory and fresh, separate output directory")

FILES = [
    "src/styles.css",
    "src/sloppertizer-landing.css",
    "src/sloppertizer-composition.css",
    "src/sloppertizer-demo.css",
    "src/sloppertizer-polish.css",
    "src/components/ui/button.tsx",
    "src/components/ui/accordion.tsx",
    "src/lib/utils.ts",
    "LICENSE",
]
def safe_read(path):
    target = (source / path)
    if not target.is_file() or target.is_symlink() or source not in target.resolve().parents:
        raise RuntimeError("Unsafe/missing source: " + path)
    return target.read_text(encoding="utf-8")
def write(path, text):
    file = output / path
    file.parent.mkdir(parents=True, exist_ok=True)
    file.write_text(text, encoding="utf-8")

tsx = safe_read("src/routes/index.tsx")
router_import = 'import { createFileRoute, Link } from "@tanstack/react-router";'
start_marker = 'export const Route = createFileRoute("/")({'
end_marker = 'type Capability = {'
if not all([router_import in tsx, 'data-composition="stage-led"' in tsx,
            'className="slp-demo slp-demo--refined"' in tsx, 'function Landing()' in tsx]):
    raise RuntimeError("Not the verified Stage-led candidate")
a, b = tsx.index(start_marker), tsx.index(end_marker)
if b <= a or tsx.find(start_marker, a + 1) != -1:
    raise RuntimeError("Route declaration not unambiguous")
tsx = tsx.replace(router_import, 'import type { AnchorHTMLAttributes } from "react";')
a, b = tsx.index(start_marker), tsx.index(end_marker)
tsx = tsx[:a] + tsx[b:]
tsx += """
// This is a visual preview; auth and policy open the source author's website.
function Link({ to, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) {
  const href = to === "/" ? import.meta.env.BASE_URL : "https://workflowai-pro.lovable.app" + to;
  return <a href={href} {...props}/>;
}
export default Landing;
"""
if 'createFileRoute' in tsx or "export default Landing" not in tsx:
    raise RuntimeError("Failed to transform SSR route safely")

for path in FILES:
    write(path, safe_read(path))
write("src/routes/index.tsx", tsx)
deps = {
    "react": "^19.2.0", "react-dom": "^19.2.0",
    "lucide-react": "^0.575.0",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-accordion": "^1.2.12",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1", "tailwind-merge": "^3.5.0"
}
devdeps = {
    "vite": "^8.0.16", "@vitejs/plugin-react": "^5.2.0",
    "@tailwindcss/vite": "^4.2.1", "tailwindcss": "^4.2.1", "tw-animate-css":"^1.3.4",
    "typescript": "^5.8.3", "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0"
}
write("package.json", json.dumps({
    "name": "sloppertizer-visual-preview", "private": True, "type": "module",
    "scripts": {"build": "vite build", "dev": "vite --host 127.0.0.1"},
    "dependencies": deps, "devDependencies": devdeps
}, indent=2) + "\n")
write("vite.config.ts", """
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
  base: "/seo/",
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src/", import.meta.url)) } },
  build: { outDir: "public-preview", emptyOutDir: true }
});
""")
write("index.html", """<!doctype html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<meta name="robots" content="noindex,nofollow"/>
<title>Sloppertizer × WorkFlow AI Pro | Unofficial design experiment</title>
<meta name="description" content="A standalone, unofficial landing-page redesign experiment."/>
</head>
<body><div id="root"></div><script type="module" src="/src/preview-entry.tsx"></script></body>
</html>
""")
write("src/preview-entry.tsx", """
import React from "react";
import { createRoot } from "react-dom/client";
import Landing from "./routes/index";
import "./styles.css";
import "./preview-banner.css";

function Preview() {
  return <>
    <aside className="slop-preview-notice" role="note">
      <span><strong>SLOPPERTIZER EXPERIMENT</strong> — Unofficial redesign of the MIT-licensed WorkFlow AI Pro landing page.</span>
      <span>Sign-in and policy links open the <a href="https://workflowai-pro.lovable.app/" target="_blank" rel="noopener noreferrer">original site</a>.</span>
    </aside>
    <Landing />
  </>;
}
const root = document.getElementById("root");
if (!root) throw new Error("Missing root");
createRoot(root).render(<Preview />);
""")
write("src/preview-banner.css", """
html {scroll-behavior:smooth}
body {margin:0}
.slop-preview-notice {padding:10px 20px;display:flex;align-items:center;justify-content:center;gap:6px 24px;flex-wrap:wrap;background:#142b24;color:#eff9ef;font:500 12px/1.45 system-ui,sans-serif;text-align:center}
.slop-preview-notice strong {letter-spacing:.075em;font-size:10px}
.slop-preview-notice a {color:#e3efb7;text-decoration:underline;text-underline-offset:2px}
.slop-preview-notice a:hover {color:#fff}
@media(max-width:600px){.slop-preview-notice{padding:11px 14px;text-align:left;justify-content:flex-start;font-size:11px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
""")
write("README.md", """# Sloppertizer × WorkFlow AI Pro

Unofficial visual redesign preview. WorkFlow AI Pro source: https://github.com/TinyikoMamban/workflowai-pro (MIT). This preview includes only client-rendered landing-page code. Tabs and FAQ work locally. Login and policy links go to the original site.

No Supabase keys, account access, inference requests or server APIs are included.

Build: npm install && npm run build. The output directory is public-preview/ and the URL base is /seo/.
""")
print(json.dumps({"preview_dir": str(output), "source_files": len(FILES)+1,
                  "auth_is_external": True, "static_only": True}))
