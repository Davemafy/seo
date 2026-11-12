import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, ArrowUpRight, BookOpenText, Check, ChevronRight, FileText,
  FlaskConical, ListTodo, Mail, Menu, MessageSquare, Search, X
} from "lucide-react";
import "./sloppertizer-pilot.css";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WorkFlow AI Pro — Make space for the work that matters" },
      {
        name: "description",
        content: "WorkFlow AI Pro brings email drafting, meeting notes, tasks, research and more into one workspace."
      },
      { property: "og:title", content: "WorkFlow AI Pro" },
      { property: "og:description", content: "Make space for the work that matters." }
    ]
  }),
  component: Landing
});

const modules = [
  { number: "01", icon: Mail, title: "Write the email, not the whole afternoon", type: "Writing", desc: "Set the recipient, audience, purpose and tone. Build a thoughtful draft from a clear brief." },
  { number: "02", icon: FileText, title: "Find the signal in your meeting notes", type: "Meetings", desc: "Bring transcripts and notes together for structured summaries, decisions and follow-ups." },
  { number: "03", icon: ListTodo, title: "Give the day some structure", type: "Planning", desc: "Create tasks, organize priorities and see work across to-do, in-progress and done." },
  { number: "04", icon: FlaskConical, title: "Get oriented before you go deeper", type: "Research", desc: "Explore reports and articles with a structured place for findings and recommendations." },
  { number: "05", icon: MessageSquare, title: "A place to think things through", type: "AI assistant", desc: "Work through questions in an ongoing workplace conversation." },
  { number: "06", icon: BookOpenText, title: "Start with a better prompt", type: "Templates", desc: "Find and save role-specific prompt templates for recurring work." }
];

const samples = [
  {
    id: "email", label: "Write an email", icon: Mail,
    kicker: "01 / COMMUNICATION", title: "Start with the intention.",
    description: "Give your message a clear audience and purpose before drafting.",
    fields: [["RECIPIENT", "A colleague or collaborator"], ["PURPOSE", "Follow up on a project review"], ["TONE", "Professional"]],
    outcome: "Draft workspace", outline: ["Subject", "Main message", "Alternative version", "Follow-up"]
  },
  {
    id: "meeting", label: "Meeting notes", icon: FileText,
    kicker: "02 / MEETINGS", title: "Make the notes useful.",
    description: "Give an unstructured conversation a place to become a clearer record.",
    fields: [["SOURCE", "Meeting transcript or notes"], ["FOCUS", "Decisions and action items"], ["OUTPUT", "Structured summary"]],
    outcome: "Summary structure", outline: ["Executive summary", "Key decisions", "Follow-up actions", "Open questions"]
  },
  {
    id: "tasks", label: "Plan the day", icon: ListTodo,
    kicker: "03 / PLANNING", title: "See what comes next.",
    description: "Move from a loose task list to a view of what needs attention.",
    fields: [["WORKSPACE", "Personal task board"], ["ORGANIZE BY", "Task status"], ["PRIORITY", "Your choice"]],
    outcome: "Task board", outline: ["To do", "In progress", "Done", "Plan my day"]
  }
] as const;

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className={"wf-mark-lockup"+(compact?" wf-mark-lockup--small":"")}>
      <span className="wf-brand-symbol" aria-hidden="true">
        <i/><i/><i/><i/>
      </span>
      <span className="wf-wordmark">workflow<span className="wf-wordmark-sub"> / ai pro</span></span>
    </span>
  );
}

function WorkspacePreview() {
  const [active,setActive] = useState(0);
  const entry = samples[active];
  return (
    <div className="wf-stage" aria-label="Illustrative product workspace">
      <div className="wf-stage-cap">
        <div className="wf-stage-cap-left"><span className="wf-small-dot"/> PRODUCT EXPLORATION</div>
        <span>ILLUSTRATIVE PREVIEW <span aria-hidden="true">↗</span></span>
      </div>
      <div className="wf-window">
        <div className="wf-window-sidebar">
          <div className="wf-app-brand"><span className="wf-app-glyph">w<span className="wf-app-glyph-period">.</span></span><span>Workspace</span></div>
          <div className="wf-window-sidebar-label">YOUR TOOLS</div>
          <div className="wf-sidebar-item wf-sidebar-item--active"><Mail size={16} strokeWidth={1.8}/> Create</div>
          <div className="wf-sidebar-item"><ListTodo size={16} strokeWidth={1.8}/> Tasks</div>
          <div className="wf-sidebar-item"><Search size={16} strokeWidth={1.8}/> Research</div>
          <div className="wf-sidebar-item"><BookOpenText size={16} strokeWidth={1.8}/> Prompts</div>
          <div className="wf-sidebar-spacer"/>
          <div className="wf-sidebar-foot"><span className="wf-avatar">W</span> A quieter way to work</div>
        </div>
        <div className="wf-window-main">
          <div className="wf-window-topbar">
            <span><span className="wf-crumb">Workspace</span> <ChevronRight size={12}/> Explore a workflow</span>
            <span className="wf-topbar-context">Concept preview</span>
          </div>
          <div className="wf-demo-tabs" role="tablist" aria-label="Choose an illustrative workflow">
            {samples.map((item,i)=>(
              <button key={item.id} role="tab" id={"wf-tab-"+item.id}
                aria-controls="wf-demo-panel" aria-selected={active===i}
                tabIndex={active===i?0:-1}
                className={"wf-demo-tab"+(active===i?" wf-demo-tab--active":"")}
                onClick={()=>setActive(i)}
                onKeyDown={e=>{
                  if(e.key==="ArrowRight"||e.key==="ArrowLeft"||e.key==="Home"||e.key==="End"){
                    e.preventDefault();
                    const n=e.key==="Home"?0:e.key==="End"?samples.length-1:
                      (i+(e.key==="ArrowRight"?1:-1)+samples.length)%samples.length;
                    setActive(n);
                    const next=document.getElementById("wf-tab-"+samples[n].id);
                    next?.focus();
                  }
                }}
              ><item.icon size={14} strokeWidth={1.8}/><span>{item.label}</span></button>
            ))}
          </div>
          <div className="wf-demo-body" role="tabpanel" id="wf-demo-panel" aria-labelledby={"wf-tab-"+entry.id}>
            <div className="wf-demo-kicker">{entry.kicker}</div>
            <h2>{entry.title}</h2>
            <p className="wf-demo-description">{entry.description}</p>
            <div className="wf-demo-fields">
              {entry.fields.map(([label,value])=><div className="wf-demo-field" key={label}>
                <div className="wf-demo-field-label">{label}</div><div>{value}</div>
              </div>)}
            </div>
            <div className="wf-demo-output">
              <div className="wf-demo-output-top">
                <span><span className="wf-mini-cross">✳</span> {entry.outcome}</span>
                <span>Example layout</span>
              </div>
              <div className="wf-demo-outline">
                {entry.outline.map((v,i)=><div className="wf-outline-row" key={v}>
                  <span className="wf-outline-index">{String(i+1).padStart(2,"0")}</span>
                  <span>{v}</span>
                  <span className="wf-outline-line"/>
                </div>)}
              </div>
            </div>
          </div>
          <div className="wf-window-bottom"><span className="wf-demo-foot-dot"/> An interactive concept, not an application screenshot.</div>
        </div>
      </div>
      <div className="wf-stage-bottom">
        <span>THREE WAYS INTO THE WORK</span>
        <span>Explore the controls above <ArrowUpRight size={13}/></span>
      </div>
    </div>
  );
}

function Landing() {
  const [menu,setMenu] = useState(false);
  const [expanded,setExpanded] = useState<number|null>(null);
  const faq = [
    { q:"What can I use WorkFlow AI Pro for?", a:"The current app includes email drafting, meeting-note tools, task planning, research, workplace chat and a prompt library. Capabilities vary by tool." },
    { q:"How do I access the actual workspace?", a:"Use Get started or Sign in to open the app's existing authentication flow. The product exploration on this page is an illustrative concept." },
    { q:"Where can I learn about responsible AI?", a:"Open the Responsible AI page to review the application's published guidance. Always review generated work before relying on it." }
  ];
  return (
    <div className="wf-pilot">
      <header className="wf-header">
        <div className="wf-wrap wf-nav">
          <Link to="/" className="wf-brand-link" aria-label="WorkFlow AI Pro home"><Brand/></Link>
          <nav className="wf-nav-links" aria-label="Primary navigation">
            <a href="#product">The product</a>
            <a href="#features">Capabilities</a>
            <a href="#approach">Our approach</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="wf-nav-actions">
            <Link to="/auth" className="wf-nav-signin">Sign in</Link>
            <Link to="/auth" className="wf-nav-cta">Open workspace <ArrowUpRight size={15}/></Link>
          </div>
          <button className="wf-mobile-menu" type="button" aria-label={menu?"Close menu":"Open menu"}
            aria-expanded={menu} onClick={()=>setMenu(v=>!v)}>{menu?<X size={22}/>:<Menu size={22}/>}</button>
        </div>
        {menu&&<nav className="wf-mobile-nav" aria-label="Mobile navigation">
          {[["#product","The product"],["#features","Capabilities"],["#approach","Our approach"],["#faq","FAQ"]].map(([href,label])=><a key={href} href={href} onClick={()=>setMenu(false)}>{label}<ArrowUpRight size={15}/></a>)}
          <Link to="/auth" onClick={()=>setMenu(false)}>Sign in <ArrowUpRight size={15}/></Link>
        </nav>}
      </header>

      <main>
        <section className="wf-hero wf-wrap" id="product">
          <div className="wf-hero-copy">
            <div className="wf-section-label"><span className="wf-square"/> YOUR WORK. A LITTLE LIGHTER.</div>
            <h1>Make space for <em>the work</em> that matters.</h1>
            <p className="wf-hero-lead">Email drafts, meeting notes, task planning, research. One place to make sense of the work in between.</p>
            <div className="wf-hero-ctas">
              <Link to="/auth" className="wf-button wf-button-primary">Explore the workspace <ArrowUpRight size={19}/></Link>
              <a href="#features" className="wf-button wf-button-text">See what it does <ArrowRight size={18}/></a>
            </div>
            <div className="wf-hero-proof"><span className="wf-proof-line"/><span>LESS TIME REORIENTING. MORE TIME MAKING PROGRESS.</span></div>
          </div>
          <WorkspacePreview/>
        </section>

        <div className="wf-ticker">
          <div className="wf-wrap wf-ticker-inner">
            <span>ONE PLACE FOR THE WORK BETWEEN EVERYTHING ELSE</span>
            <div className="wf-ticker-tags"><span>WRITE</span><i/><span>PLAN</span><i/><span>RESEARCH</span><i/><span>THINK</span></div>
          </div>
        </div>

        <section className="wf-features wf-wrap" id="features">
          <div className="wf-section-topline"><span>01 / WHAT'S INSIDE</span><span>CAPABILITIES, NOT CLAIMS <ArrowUpRight size={15}/></span></div>
          <div className="wf-features-head">
            <h2>Different jobs.<br/><em>One place to begin.</em></h2>
            <p>WorkFlow AI Pro brings six tools into the same workspace. Choose the task in front of you, and keep moving.</p>
          </div>
          <div className="wf-feature-list">
            {modules.map((module,i)=><div className={"wf-feature-row"+(i===0?" wf-feature-row-first":"")} key={module.number}>
              <span className="wf-feature-index">{module.number} <span className="wf-feature-rule"/></span>
              <span className="wf-feature-icon"><module.icon size={22} strokeWidth={1.6}/></span>
              <div className="wf-feature-content"><span className="wf-feature-type">{module.type}</span><h3>{module.title}</h3><p>{module.desc}</p></div>
              <ArrowUpRight className="wf-feature-arrow" size={21} strokeWidth={1.4} aria-hidden="true"/>
            </div>)}
          </div>
        </section>

        <section className="wf-approach" id="approach">
          <div className="wf-wrap wf-approach-grid">
            <div className="wf-approach-left"><span className="wf-section-label wf-section-label-light"><span className="wf-square"/> 02 / A DIFFERENT KIND OF TOOL</span>
              <h2>Good work needs <em>room to think.</em></h2></div>
            <div className="wf-approach-right">
              <p>Start with a brief. Organize the moving pieces. Keep the final judgment where it belongs: with you.</p>
              <div className="wf-approach-stages">
                <div><span>01</span><strong>Bring the context</strong><p>Start from an email brief, notes, a task or a piece of research.</p></div>
                <div><span>02</span><strong>Shape the output</strong><p>Use the appropriate tool to structure a draft or a next step.</p></div>
                <div><span>03</span><strong>Make it yours</strong><p>Review, refine and decide what moves forward.</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="wf-faq wf-wrap" id="faq">
          <div className="wf-faq-intro"><span className="wf-section-label"><span className="wf-square"/> 03 / GOOD TO KNOW</span><h2>A few things<br/><em>worth knowing.</em></h2></div>
          <div className="wf-faq-list">
            {faq.map((f,i)=><div className={"wf-faq-item"+(expanded===i?" wf-faq-item-open":"")} key={f.q}>
              <button type="button" aria-expanded={expanded===i} aria-controls={"wf-faq-panel-"+i}
                onClick={()=>setExpanded(expanded===i?null:i)}>
                <span>{f.q}</span><span className="wf-faq-indicator">{expanded===i?"−":"+"}</span>
              </button>
              {expanded===i&&<p id={"wf-faq-panel-"+i}>{f.a}{i===2&&<> <Link to="/responsible-ai">Read the Responsible AI page <ArrowUpRight size={13}/></Link></>}</p>}
            </div>)}
          </div>
        </section>

        <section className="wf-final">
          <div className="wf-wrap wf-final-inner">
            <div><span>READY WHEN YOU ARE</span><h2>Bring a little more<br/><em>clarity to your day.</em></h2></div>
            <Link to="/auth" className="wf-final-cta">Open the workspace <ArrowUpRight size={22}/></Link>
          </div>
        </section>
      </main>
      <footer className="wf-footer">
        <div className="wf-wrap wf-footer-inner">
          <Link to="/" aria-label="WorkFlow AI Pro home"><Brand compact/></Link>
          <span>WorkFlow AI Pro · A more thoughtful workday.</span>
          <div><Link to="/responsible-ai">Responsible AI</Link><a href="#features">Capabilities</a><Link to="/auth">Sign in</Link></div>
        </div>
        <div className="wf-wrap wf-footer-note">This page is a design exploration. The interactive workspace illustration is not a live product screenshot.</div>
      </footer>
    </div>
  );
}
