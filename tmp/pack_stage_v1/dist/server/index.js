const PAGE = "<!doctype html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>Parent Decision Brief Demo</title>\n  <style>\n    :root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif;color:#142635;background:#f5f7f5}\n    *{box-sizing:border-box} body{margin:0} a{color:#135f68} button,input,select,textarea{font:inherit}\n    button{cursor:pointer;border:0;border-radius:10px;padding:12px 17px;font-weight:700;background:#0e5961;color:white}\n    button:disabled{opacity:.55;cursor:not-allowed}.secondary{background:#e3edeb;color:#16484f}.ghost{background:white;color:#19545a;border:1px solid #c9d7d5}\n    header{background:#102c37;color:white;padding:19px 24px;border-bottom:5px solid #69b59e}\n    header .bar{max-width:1100px;margin:auto;display:flex;align-items:center;justify-content:space-between;gap:15px}\n    .brand{font-weight:800;letter-spacing:.02em}.brand span{color:#91dec6}\n    .tag{font-size:12px;padding:6px 10px;background:#244a53;border-radius:999px;color:#d9f1e9}\n    main{max-width:1100px;margin:36px auto;padding:0 22px 60px}\n    h1{font-size:clamp(30px,4vw,47px);line-height:1.08;margin:0 0 13px;letter-spacing:-.04em}\n    h2{font-size:21px;margin:0 0 12px;letter-spacing:-.02em} h3{font-size:15px;margin:0 0 8px}\n    p{line-height:1.55;margin:0 0 14px;color:#49616a}.eyebrow{text-transform:uppercase;letter-spacing:.13em;font-size:11px;font-weight:800;color:#317b7c;margin-bottom:10px}\n    .intro{max-width:760px;margin-bottom:25px}.layout{display:grid;grid-template-columns:1.42fr .85fr;gap:20px}\n    .card{background:white;border:1px solid #dfe8e5;border-radius:16px;padding:25px;box-shadow:0 12px 32px #132a3010;margin-bottom:20px}\n    .panel{background:#eaf3ef;border-radius:13px;padding:18px;margin:18px 0}.panel p:last-child{margin-bottom:0}\n    .grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}\n    label{display:block;font-size:12px;color:#46616a;font-weight:750;margin-bottom:6px}\n    input,select,textarea{width:100%;padding:11px 12px;border:1px solid #cbd9d5;border-radius:9px;background:#fff;color:#19343d;outline:none}\n    input:focus,select:focus,textarea:focus{border-color:#2e8f8b;box-shadow:0 0 0 3px #48a69c24}\n    textarea{min-height:82px;resize:vertical}.field{margin-bottom:14px}.actions{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:18px}\n    .small{font-size:12px;color:#647b82}.warn{background:#fff4df;border:1px solid #e9d6a6;color:#705418;padding:12px;border-radius:9px;margin:10px 0}\n    .ok{background:#e5f4e8;color:#1d6841;padding:12px;border-radius:9px;margin:10px 0}\n    .error{background:#fde9e7;color:#963d31;padding:12px;border-radius:9px;margin:10px 0}\n    .pill{display:inline-block;background:#e3edeb;color:#28606a;padding:6px 10px;border-radius:999px;font-size:11px;font-weight:800;text-transform:uppercase}\n    .row{display:flex;justify-content:space-between;gap:16px;padding:11px 0;border-bottom:1px solid #e7eeec}\n    .row:last-child{border:0}.row b{max-width:58%;text-align:right}.source{font-size:12px;padding:9px 0;border-bottom:1px solid #e7eeec}\n    .timeline{border-left:2px solid #9dcfc0;padding-left:15px}.timeline div{margin:0 0 12px;font-size:13px}\n    .question{padding:13px;background:#f4f8f6;border-radius:10px;margin:9px 0}.question small{display:block;color:#668083;margin-top:6px}\n    .copy{word-break:break-all;background:#f4f8f6;padding:12px;border-radius:8px;font-size:12px}\n    .muted{color:#60747a}.hidden{display:none}.spinner{display:inline-block;width:15px;height:15px;border:2px solid #cce5de;border-top-color:#14616a;border-radius:50%;animation:spin .8s linear infinite}\n    @keyframes spin{to{transform:rotate(360deg)}}@media(max-width:760px){.layout,.grid{grid-template-columns:1fr}.card{padding:19px}main{margin-top:25px}}\n  </style>\n</head>\n<body>\n<header><div class=\"bar\"><div class=\"brand\">DECISION<span> / </span>BRIEF</div><div class=\"tag\">Assignment prototype · Not affiliated with NIAT</div></div></header>\n<main id=\"app\"></main>\n<script>\nconst app=document.getElementById(\"app\");\nconst esc=s=>String(s??\"\").replace(/[&<>\"']/g,c=>({\"&\":\"&amp;\",\"<\":\"&lt;\",\">\":\"&gt;\",'\"':\"&quot;\",\"'\":\"&#39;\"}[c]));\nconst link=(url,label)=>'<a href=\"'+esc(url)+'\" target=\"_blank\" rel=\"noopener\">'+esc(label)+'</a>';\nconst status=(msg,type=\"warn\")=>'<div class=\"'+type+'\">'+esc(msg)+'</div>';\nconst qs=new URLSearchParams(location.search),parts=location.pathname.split(\"/\").filter(Boolean);\nconst id=parts[1],role=parts[0]===\"case\"?\"reviewer\":parts[0]===\"family\"?\"family\":\"home\";\nconst credential=role===\"reviewer\"?qs.get(\"key\"):qs.get(\"token\");\nconst api=(action=\"\")=>\"/api/cases/\"+id+(action?\"/\"+action:\"\")+\"?\"+(role===\"reviewer\"?\"key=\":\"token=\")+encodeURIComponent(credential||\"\");\nasync function request(url,method=\"GET\",body) {\n  const r=await fetch(url,{method,headers:body?{\"content-type\":\"application/json\"}:{},body:body?JSON.stringify(body):undefined});\n  const x=await r.json().catch(()=>({error:\"Invalid server response\"}));\n  if(!r.ok) throw new Error(x.error||\"Request failed\");\n  return x;\n}\nconst money=s=>s?esc(s):\"<em>Not supplied</em>\";\nfunction home() {\n  app.innerHTML='<div class=\"eyebrow\">Layer 3 · Lead to sale</div><h1>Help a family make one clear decision.</h1>'+\n  '<p class=\"intro\">Create a fictional post-counselling case. The system checks official NIAT facts, drafts a parent brief with AI, routes it through review, then collects family questions and a demo call request.</p>'+\n  '<div class=\"layout\"><section class=\"card\"><h2>Create a fictional case</h2><p>Use sample information only. Do not enter real student names, phone numbers, or actual fee quotes.</p>'+\n  '<form id=\"caseForm\"><div class=\"grid\"><div class=\"field\"><label>Suggested university *</label><input name=\"university\" required placeholder=\"Example Partner University\"></div><div class=\"field\"><label>City</label><input name=\"city\" placeholder=\"Hyderabad\"></div>'+\n  '<div class=\"field\"><label>University degree fee</label><input name=\"universityFee\" placeholder=\"Illustrative: ₹7,00,000 total\"></div><div class=\"field\"><label>Separate NIAT upskilling fee</label><input name=\"niatFee\" placeholder=\"Illustrative: ₹3,00,000 total\"></div>'+\n  '<div class=\"field\"><label>Scholarship terms</label><input name=\"scholarship\" placeholder=\"Illustrative: pending confirmation\"></div><div class=\"field\"><label>Hostel cost</label><input name=\"hostel\" placeholder=\"Illustrative: ₹90,000 per year\"></div></div>'+\n  '<div class=\"grid\"><div class=\"field\"><label>Student concern</label><textarea name=\"studentConcern\" placeholder=\"I want more hands-on AI projects.\"></textarea></div><div class=\"field\"><label>Parent concern</label><textarea name=\"parentConcern\" placeholder=\"Who awards the degree, and what is the full cost?\"></textarea></div></div>'+\n  '<div class=\"actions\"><button type=\"submit\">Create case</button><button type=\"button\" class=\"secondary\" id=\"sample\">Load sample</button><span id=\"homeMsg\"></span></div></form></section>'+\n  '<aside><div class=\"card\"><div class=\"eyebrow\">Connected workflow</div><div class=\"timeline\"><div><b>01 · Record</b><br>D1 saves the fictional offer.</div><div><b>02 · Research and draft</b><br>AI calls a source tool for NIAT facts.</div><div><b>03 · Review</b><br>Flagged facts block family sharing.</div><div><b>04 · Decide together</b><br>Parent and student ask questions; AI triages them.</div><div><b>05 · Meet</b><br>A demo slot and calendar file close the loop.</div></div></div>'+\n  '<div class=\"card\"><h3>Important distinction</h3><p>NIAT provides separate upskilling. A collaborating university decides admission and awards the degree. All case-level prices in this demo are illustrative.</p>'+\n  link(\"https://apply.niatindia.com/login-gnc/\",\"Official NIAT admissions FAQ\")+'</div></aside></div>';\n  document.getElementById(\"sample\").onclick=()=>{\n    const f=document.getElementById(\"caseForm\");\n    Object.entries({university:\"Example Partner University\",city:\"Hyderabad\",universityFee:\"Illustrative ₹7,00,000 total\",\n      niatFee:\"Illustrative ₹3,00,000 total\",scholarship:\"Illustrative ₹50,000, subject to verification\",\n      hostel:\"Illustrative ₹90,000 per year\",studentConcern:\"Will I build AI projects in the first year?\",\n      parentConcern:\"Who awards the degree and what exactly is included in each fee?\"}).forEach(([k,v])=>f.elements[k].value=v);\n  };\n  document.getElementById(\"caseForm\").onsubmit=async e=>{\n    e.preventDefault();const f=e.currentTarget,m=document.getElementById(\"homeMsg\");\n    m.innerHTML='<span class=\"spinner\"></span>';\n    try{const x=await request(\"/api/cases\",\"POST\",Object.fromEntries(new FormData(f)));location.href=x.reviewUrl;}\n    catch(err){m.innerHTML=status(err.message,\"error\");}\n  };\n}\nlet current=null;\nasync function load() {\n  app.innerHTML='<div class=\"spinner\"></div> Loading case';\n  try {current=await request(api());role===\"reviewer\"?reviewer():family();}\n  catch(e){app.innerHTML='<div class=\"card\">'+status(e.message,\"error\")+'<a href=\"/\">Start a new demo</a></div>';}\n}\nfunction offer(c) {\n  const x=c.input;return '<div class=\"row\"><span>Suggested university</span><b>'+esc(x.university)+(x.city?', '+esc(x.city):'')+'</b></div>'+\n  '<div class=\"row\"><span>University degree fee</span><b>'+money(x.universityFee)+'</b></div>'+\n  '<div class=\"row\"><span>Separate NIAT upskilling fee</span><b>'+money(x.niatFee)+'</b></div>'+\n  '<div class=\"row\"><span>Scholarship</span><b>'+money(x.scholarship)+'</b></div>'+\n  '<div class=\"row\"><span>Hostel</span><b>'+money(x.hostel)+'</b></div>';\n}\nfunction draft(d) {\n  return '<div class=\"panel\"><h3>AI prepared explanation</h3><p>'+esc(d.summary)+'</p><p>'+esc(d.whyItMatters)+'</p></div>'+\n    '<h3>Degree and responsibility</h3><p>'+esc(d.degree)+'</p><h3>Questions for the joint call</h3>'+\n    d.questions.map(q=>'<div class=\"question\">'+esc(q)+'</div>').join(\"\")+\n    '<h3>Source check</h3>'+d.sources.map(s=>'<div class=\"source\">'+link(s.url,new URL(s.url).host)+\n      ' · <b>'+esc(s.status)+'</b> · '+esc(new Date(s.checkedAt).toLocaleString())+'</div>').join(\"\");\n}\nfunction reviewer() {\n  const c=current,d=c.draft;\n  app.innerHTML='<div class=\"eyebrow\">Reviewer workspace · fictional scenario</div><h1>Review the family brief.</h1>'+\n    '<p class=\"intro\">AI prepares the explanation and questions. Case-level numbers remain exactly as entered. A reviewer must confirm all details before sharing.</p>'+\n    '<div class=\"layout\"><section><div class=\"card\"><div class=\"pill\">'+esc(c.status)+'</div><h2 style=\"margin-top:14px\">Case offer</h2>'+offer(c)+\n    '<p class=\"small\">These figures are illustrative, not NIAT quotes.</p></div>'+\n    (d?'<div class=\"card\"><h2>Draft brief</h2>'+draft(d)+(d.flags.length?d.flags.map(f=>status(f)).join(\"\"):status(\"No blocking flags from the automated check. Verify the supplied offer before approval.\",\"ok\"))+\n    (d.reviewNotes?.length?'<p class=\"small\">AI review notes: '+d.reviewNotes.map(esc).join(\" · \")+'</p>':'')+\n    '<div class=\"actions\"><button id=\"approve\" '+(c.status===\"approved\"||d.flags.length?\"disabled\":\"\")+'>Approve for family</button><span id=\"reviewMsg\"></span></div></div>':'<div class=\"card\"><h2>Generate with AI</h2><p>The model will request current public NIAT sources, then prepare a draft. Missing fees or unavailable evidence are flagged.</p><div class=\"actions\"><button id=\"generate\">Research and draft</button><span id=\"reviewMsg\"></span></div></div>')+\n    (c.status===\"approved\"?'<div class=\"card\"><h2>Family link</h2><p>Share this demonstration link with a reviewer.</p><div class=\"copy\" id=\"familyLink\">'+esc(location.origin+c.familyUrl)+'</div><div class=\"actions\"><button class=\"secondary\" id=\"copyLink\">Copy link</button><a class=\"ghost\" style=\"padding:11px 15px;border-radius:10px;text-decoration:none\" href=\"'+esc(c.familyUrl)+'\" target=\"_blank\">Open family view</a></div></div>':'')+\n    '<div class=\"card\"><h2>Family activity</h2>'+(c.responses.length?c.responses.map(r=>'<div class=\"question\"><b>'+esc(r.actor)+' · '+esc(r.category)+'</b><p>'+esc(r.question)+'</p><small>'+esc(r.englishSummary)+'<br>Next action: '+esc(r.suggestedCounsellorAction)+'</small></div>').join(\"\"):'<p>No family questions yet.</p>')+\n    (c.slotId?status('Demo call reserved: '+new Date(c.slotId).toLocaleString(\"en-IN\"),\"ok\"):'<p>No call slot reserved yet.</p>')+\n    '<button class=\"secondary\" id=\"refresh\">Refresh activity</button></div></section>'+\n    '<aside><div class=\"card\"><h2>Activity log</h2>'+(c.sourceLog.length?'<div class=\"timeline\">'+c.sourceLog.map(x=>'<div><b>'+esc(x.tool)+'</b><br>'+esc(x.result)+(x.url?' · '+link(x.url,\"source\"):'')+'</div>').join(\"\")+'</div>':'<p>Generate a brief to see the data and AI steps.</p>')+'</div>'+\n    '<div class=\"card\"><h3>What approval means here</h3><p>This is a candidate-operated prototype. Approval demonstrates a counsellor review gate; it is not a real NIAT verification.</p></div></aside></div>';\n  const g=document.getElementById(\"generate\"),a=document.getElementById(\"approve\"),m=document.getElementById(\"reviewMsg\");\n  if(g)g.onclick=async()=>{g.disabled=true;m.innerHTML='<span class=\"spinner\"></span> Checking sources and drafting';\n    try{await request(api(\"generate\"),\"POST\",{});await load();}catch(e){g.disabled=false;m.innerHTML=status(e.message,\"error\");}};\n  if(a)a.onclick=async()=>{a.disabled=true;m.innerHTML='<span class=\"spinner\"></span>';\n    try{await request(api(\"approve\"),\"POST\",{});await load();}catch(e){a.disabled=false;m.innerHTML=status(e.message,\"error\");}};\n  const cp=document.getElementById(\"copyLink\");if(cp)cp.onclick=()=>{navigator.clipboard.writeText(location.origin+c.familyUrl);cp.textContent=\"Copied\";};\n  document.getElementById(\"refresh\").onclick=load;\n}\nasync function family() {\n  const c=current,d=c.draft;\n  app.innerHTML='<div class=\"eyebrow\">Family decision room · fictional scenario</div><h1>One place to decide together.</h1>'+\n    '<p class=\"intro\">Review the suggested option, raise the questions that matter to each of you, and reserve a demonstration call. This is not a real NIAT offer or appointment.</p>'+\n    '<div class=\"layout\"><section><div class=\"card\"><div class=\"pill\">Reviewer approved demo</div><h2 style=\"margin-top:14px\">'+esc(d.university)+'</h2>'+offer(c)+\n    '<p class=\"small\">Illustrative scenario figures only. Confirm actual fees and admission with NIAT and the university.</p></div>'+\n    '<div class=\"card\"><div style=\"display:flex;justify-content:space-between;gap:15px;align-items:center\"><h2>What this means</h2><select id=\"language\" style=\"max-width:160px\"><option>English</option><option>Hindi</option><option>Telugu</option><option>Tamil</option><option>Kannada</option><option>Malayalam</option></select></div>'+\n    '<div id=\"translated\">'+draft(d)+'</div><div id=\"translateMsg\"></div></div>'+\n    '<div class=\"card\"><h2>What still needs an answer?</h2><p>Parent and student can ask separately. AI groups the questions for a counsellor rather than making up an answer.</p>'+\n    '<form id=\"questionForm\"><div class=\"grid\"><div class=\"field\"><label>I am the</label><select name=\"actor\"><option>Parent</option><option>Student</option></select></div><div class=\"field\"><label>Question language</label><select name=\"language\"><option>English</option><option>Hindi</option><option>Telugu</option><option>Tamil</option><option>Kannada</option><option>Malayalam</option></select></div></div>'+\n    '<div class=\"field\"><label>My question</label><textarea name=\"question\" required placeholder=\"What does the separate upskilling fee cover?\"></textarea></div><div class=\"actions\"><button>Send question</button><span id=\"questionMsg\"></span></div></form>'+\n    '<div id=\"responseList\">'+(c.responses.length?c.responses.map(r=>'<div class=\"question\"><b>'+esc(r.actor)+' · '+esc(r.category)+'</b><p>'+esc(r.question)+'</p><small>'+esc(r.englishSummary)+'</small></div>').join(\"\"):'')+'</div></div></section>'+\n    '<aside><div class=\"card\"><h2>Talk it through</h2><p>Reserve one 15-minute demo slot. The calendar file marks a fictional appointment only.</p>'+\n    (c.slotId?status('Reserved: '+new Date(c.slotId).toLocaleString(\"en-IN\"),\"ok\")+'<a href=\"'+esc(api(\"ics\"))+'\">Download calendar file</a>':\n    '<div id=\"slots\"><span class=\"spinner\"></span></div><div class=\"actions\"><button id=\"book\">Reserve demo slot</button></div><div id=\"bookMsg\"></div>')+'</div>'+\n    '<div class=\"card\"><h3>Source boundaries</h3><p>General NIAT facts are linked to official pages. This demonstration does not determine university admission or a real fee.</p>'+\n    d.sources.map(s=>'<div class=\"source\">'+link(s.url,new URL(s.url).host)+'</div>').join(\"\")+'</div></aside></div>';\n  const lang=document.getElementById(\"language\");\n  lang.onchange=async()=>{const box=document.getElementById(\"translated\"),m=document.getElementById(\"translateMsg\");\n    if(lang.value===\"English\"){box.innerHTML=draft(d);m.innerHTML=\"\";return;}\n    m.innerHTML='<span class=\"spinner\"></span> Translating';\n    try{const x=await request(api(\"translate\"),\"POST\",{language:lang.value});\n      box.innerHTML='<div class=\"panel\"><p>'+esc(x.translation.summary)+'</p><p>'+esc(x.translation.whyItMatters)+'</p></div>'+\n        '<h3>Costs and degree facts remain as shown above</h3>'+d.sources.map(s=>'<div class=\"source\">'+link(s.url,new URL(s.url).host)+'</div>').join(\"\");\n      m.innerHTML=\"\";}catch(e){m.innerHTML=status(e.message,\"error\");}};\n  document.getElementById(\"questionForm\").onsubmit=async e=>{e.preventDefault();const f=e.currentTarget,m=document.getElementById(\"questionMsg\");\n    m.innerHTML='<span class=\"spinner\"></span> Organizing';try{await request(api(\"respond\"),\"POST\",Object.fromEntries(new FormData(f)));await load();}\n    catch(err){m.innerHTML=status(err.message,\"error\");}};\n  if(!c.slotId) {\n    try{const x=await request(api(\"slots\"));document.getElementById(\"slots\").innerHTML='<div class=\"field\"><label>Available demo times (India time)</label><select id=\"slotSelect\">'+\n      x.slots.map(s=>'<option value=\"'+esc(s.id)+'\" '+(s.available?'':'disabled')+'>'+esc(new Date(s.id).toLocaleString(\"en-IN\"))+(s.available?'':' · taken')+'</option>').join(\"\")+'</select></div>';}\n    catch(e){document.getElementById(\"slots\").innerHTML=status(e.message,\"error\");}\n    document.getElementById(\"book\").onclick=async()=>{const m=document.getElementById(\"bookMsg\");m.innerHTML='<span class=\"spinner\"></span>';\n      try{await request(api(\"book\"),\"POST\",{slot:document.getElementById(\"slotSelect\").value});await load();}\n      catch(e){m.innerHTML=status(e.message,\"error\");}};\n  }\n}\nrole===\"home\"?home():load();\n</script>\n</body></html>\n";
const MODEL = "openai/gpt-4.1-mini";
const SOURCES = ["https://apply.niatindia.com/login-gnc/", "https://www.niatindia.com/llm-info"];
const j = (x, status = 200) => new Response(JSON.stringify(x), {status, headers: {"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});
const error = (message, status = 400) => j({error: message}, status);
const trim = (x, n = 500) => typeof x === "string" ? x.trim().slice(0,n) : "";
const random = () => Array.from(crypto.getRandomValues(new Uint8Array(24)), x => x.toString(16).padStart(2,"0")).join("");
const now = () => new Date().toISOString();
const fields = x => ({
  university:trim(x.university,100), city:trim(x.city,70),
  universityFee:trim(x.universityFee,50), niatFee:trim(x.niatFee,50),
  scholarship:trim(x.scholarship,80), hostel:trim(x.hostel,80),
  studentConcern:trim(x.studentConcern,300), parentConcern:trim(x.parentConcern,300)
});
async function callAI(env, messages, more = {}) {
  if (!env.OPENROUTER_API_KEY) throw new Error("AI secret is not configured");
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method:"POST", signal:AbortSignal.timeout(25000),
    headers:{"authorization":`Bearer ${env.OPENROUTER_API_KEY}`,"content-type":"application/json",
      "HTTP-Referer":"https://parent-decision-brief-demo-2026.kerala-ayurv-7936.chatgpt.site",
      "X-Title":"Parent Decision Brief Demo"},
    body:JSON.stringify({model:MODEL,temperature:0.2,max_tokens:650,messages,...more})
  });
  const body = await res.json().catch(()=>({}));
  if (!res.ok) throw new Error(body.error?.message || `AI service returned ${res.status}`);
  return body.choices?.[0]?.message || {};
}
async function officialFacts() {
  return Promise.all(SOURCES.map(async (url) => {
    try {
      const res = await fetch(url,{signal:AbortSignal.timeout(7000)});
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      const clean = html.replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ")
        .replace(/<[^>]+>/g," ").replace(/&nbsp;|&#160;/g," ").replace(/\s+/g," ");
      const terms = url.includes("apply.") ? ["For exact fee details","admission is solely","non-credit in nature"] :
        ["The collaborating university is responsible","NIAT charges separately","university-specific fees"];
      const snippets = terms.map(term => {
        const at = clean.toLowerCase().indexOf(term.toLowerCase());
        return at < 0 ? "" : clean.slice(Math.max(0,at-90),at+540);
      }).filter(Boolean);
      if (!snippets.length) throw new Error("Relevant source text unavailable");
      return {url,status:"live",checkedAt:now(),excerpt:snippets.join("\n").slice(0,2600)};
    } catch(e) { return {url,status:"unavailable",checkedAt:now(),excerpt:""}; }
  }));
}
async function makeDraft(env, input) {
  const log = [{tool:"D1 case record",result:"Read fictional offer",at:now()}];
  const first = await callAI(env,[
    {role:"system",content:"You are a source-checking agent. Call read_official_niat_sources before writing. Do not infer admission or costs."},
    {role:"user",content:JSON.stringify(input)}
  ],{tools:[{type:"function",function:{name:"read_official_niat_sources",description:"Fetch allowlisted official NIAT admissions and program pages",parameters:{type:"object",properties:{},required:[]}}}],
    tool_choice:{type:"function",function:{name:"read_official_niat_sources"}}});
  if (!first.tool_calls?.some(c=>c.function?.name==="read_official_niat_sources")) throw new Error("AI did not request its source tool");
  const facts = await officialFacts();
  log.push(...facts.map(f=>({tool:"Official NIAT page",result:f.status,url:f.url,at:f.checkedAt})));
  const reply = await callAI(env,[
    {role:"system",content:"Write a neutral, useful parent decision summary for a FICTIONAL case. Use only supplied source excerpts for NIAT facts. Never invent fees, scholarship, placements or admission decisions. Return JSON only: summary string, whyItMatters string, questions array of 3 strings, flags array of strings."},
    {role:"user",content:JSON.stringify({input,facts})}
  ],{response_format:{type:"json_object"}});
  let ai; try { ai=JSON.parse(reply.content || "{}"); } catch { throw new Error("AI returned invalid JSON"); }
  log.push({tool:"OpenRouter "+MODEL,result:"Drafted summary and questions",at:now()});
  const reviewNotes = Array.isArray(ai.flags) ? ai.flags.map(x=>trim(x,150)).filter(Boolean).slice(0,4) : [];
  const flags = [];
  if (!input.universityFee) flags.unshift("University fee is missing.");
  if (!input.niatFee) flags.unshift("NIAT upskilling fee is missing.");
  if (facts.some(f=>f.status!=="live")) flags.unshift("An official source could not be checked live.");
  return {draft:{
    university:input.university,city:input.city,universityFee:input.universityFee||"Not supplied",
    niatFee:input.niatFee||"Not supplied",scholarship:input.scholarship||"Not supplied",
    hostel:input.hostel||"Not supplied",
    degree:"The collaborating university controls admission and awards the degree. NIAT supplies separate, non-credit upskilling.",
    summary:trim(ai.summary,650),whyItMatters:trim(ai.whyItMatters,650),
    questions:Array.isArray(ai.questions)?ai.questions.map(x=>trim(x,180)).filter(Boolean).slice(0,3):[],
    flags,reviewNotes,sources:facts.map(({url,status,checkedAt})=>({url,status,checkedAt}))
  },log};
}
async function classify(env, question, actor, language) {
  const msg=await callAI(env,[
    {role:"system",content:"Classify this fictional family's admissions question. Do not answer it. Return JSON only: category (Fees, Degree, Campus, Career, Other), englishSummary (one sentence), suggestedCounsellorAction (one sentence)."},
    {role:"user",content:JSON.stringify({question,actor,language})}
  ],{response_format:{type:"json_object"},max_tokens:220});
  const x=JSON.parse(msg.content||"{}");
  return {category:["Fees","Degree","Campus","Career","Other"].includes(x.category)?x.category:"Other",
    englishSummary:trim(x.englishSummary,220),suggestedCounsellorAction:trim(x.suggestedCounsellorAction,220)};
}
async function translate(env, draft, language) {
  const msg=await callAI(env,[
    {role:"system",content:`Translate the provided explanation into ${language}. Preserve all numbers and qualifications. Add no facts. Return JSON only with summary and whyItMatters.`},
    {role:"user",content:JSON.stringify({summary:draft.summary,whyItMatters:draft.whyItMatters})}
  ],{response_format:{type:"json_object"},max_tokens:450});
  const x=JSON.parse(msg.content||"{}");
  return {summary:trim(x.summary,800),whyItMatters:trim(x.whyItMatters,800)};
}
function availableSlots() {
  const out=[];
  for(let d=1;d<=3;d++) {
    const date=new Date(Date.now()+d*86400000).toISOString().slice(0,10);
    for(const time of ["10:00","16:00"]) out.push(`${date}T${time}:00+05:30`);
  }
  return out;
}
function ics(slot,id) {
  const start=new Date(slot),end=new Date(start.getTime()+900000);
  const f=d=>d.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,"");
  return `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Parent Decision Brief Demo//EN\r\nBEGIN:VEVENT\r\nUID:${id}@parent-decision-demo\r\nDTSTAMP:${f(new Date())}\r\nDTSTART:${f(start)}\r\nDTEND:${f(end)}\r\nSUMMARY:Demo parent decision call\r\nDESCRIPTION:Fictional prototype only. No NIAT appointment is created.\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n`;
}
async function getRow(db,id,credential,role) {
  const row=await db.prepare("SELECT * FROM cases WHERE id = ?").bind(id).first();
  if (!row || (role==="reviewer" && credential!==row.review_key) ||
      (role==="family" && (credential!==row.family_key || row.status!=="approved"))) return null;
  return row;
}
function present(row,role) {
  const data={id:row.id,input:JSON.parse(row.input_json),draft:row.draft_json?JSON.parse(row.draft_json):null,
    sourceLog:row.source_log?JSON.parse(row.source_log):[],status:row.status,
    responses:JSON.parse(row.responses_json||"[]"),slotId:row.slot_id,createdAt:row.created_at};
  if(role==="reviewer") data.familyUrl=`/family/${row.id}?token=${row.family_key}`;
  return data;
}
export default {async fetch(request,env) {
  const url=new URL(request.url),path=url.pathname;
  if(request.method==="GET" && !path.startsWith("/api/"))
    return new Response(PAGE,{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store"}});
  if(!env.DB) return error("D1 binding is unavailable",503);
  try {
    if(path==="/api/health" && request.method==="GET") {
      const row=await env.DB.prepare("SELECT count(*) AS n FROM cases").first();
      return j({ok:true,db:true,aiConfigured:!!env.OPENROUTER_API_KEY,cases:row.n});
    }
    if(path==="/api/cases" && request.method==="POST") {
      const input=fields(await request.json());
      if(!input.university) return error("Enter a fictional university");
      const id=crypto.randomUUID(),reviewKey=random(),familyKey=random();
      await env.DB.prepare("INSERT INTO cases (id,review_key,family_key,input_json,created_at) VALUES (?,?,?,?,?)")
        .bind(id,reviewKey,familyKey,JSON.stringify(input),now()).run();
      return j({id,reviewUrl:`/case/${id}?key=${reviewKey}`},201);
    }
    const m=path.match(/^\/api\/cases\/([^/]+)(?:\/([^/]+))?$/);
    if(!m) return error("Not found",404);
    const [,id,action]=m,reviewer=url.searchParams.get("key"),family=url.searchParams.get("token"),
      role=reviewer?"reviewer":"family";
    const row=await getRow(env.DB,id,reviewer||family,role);
    if(!row) return error("Invalid or inaccessible case link",404);
    if(!action && request.method==="GET") return j(present(row,role));
    if(action==="generate" && request.method==="POST" && role==="reviewer") {
      const {draft,log}=await makeDraft(env,JSON.parse(row.input_json));
      await env.DB.prepare("UPDATE cases SET draft_json=?,source_log=?,status='draft' WHERE id=?")
        .bind(JSON.stringify(draft),JSON.stringify(log),id).run();
      return j({draft,sourceLog:log});
    }
    if(action==="approve" && request.method==="POST" && role==="reviewer") {
      if(!row.draft_json) return error("Generate the brief first");
      const draft=JSON.parse(row.draft_json);
      if(draft.flags.length) return error("Flagged facts must be resolved before approval");
      await env.DB.prepare("UPDATE cases SET status='approved',approved_at=? WHERE id=?").bind(now(),id).run();
      return j({familyUrl:`/family/${id}?token=${row.family_key}`});
    }
    if(action==="respond" && request.method==="POST" && role==="family") {
      const x=await request.json(),actor=trim(x.actor,20),question=trim(x.question,400),language=trim(x.language,30);
      if(!["Parent","Student"].includes(actor)||!question) return error("Select a role and enter a question");
      const insight=await classify(env,question,actor,language);
      const item={id:crypto.randomUUID(),actor,question,language,...insight,at:now()};
      const responses=JSON.parse(row.responses_json||"[]"); responses.push(item);
      await env.DB.prepare("UPDATE cases SET responses_json=? WHERE id=?").bind(JSON.stringify(responses),id).run();
      return j({response:item});
    }
    if(action==="translate" && request.method==="POST" && role==="family") {
      const lang=trim((await request.json()).language,30);
      if(!["Hindi","Telugu","Tamil","Kannada","Malayalam"].includes(lang)) return error("Unsupported language");
      const cache=JSON.parse(row.translations_json||"{}");
      if(!cache[lang]) {
        cache[lang]=await translate(env,JSON.parse(row.draft_json),lang);
        await env.DB.prepare("UPDATE cases SET translations_json=? WHERE id=?").bind(JSON.stringify(cache),id).run();
      }
      return j({translation:cache[lang]});
    }
    if(action==="slots" && request.method==="GET") {
      const taken=await env.DB.prepare("SELECT slot_id FROM slots").all();
      const occupied=new Set(taken.results.map(x=>x.slot_id));
      return j({slots:availableSlots().map(id=>({id,available:!occupied.has(id)}))});
    }
    if(action==="book" && request.method==="POST" && role==="family") {
      const slot=trim((await request.json()).slot,40);
      if(!availableSlots().includes(slot)) return error("Choose a demo slot");
      if(row.slot_id) return error("This case already has a slot",409);
      const inserted=await env.DB.prepare("INSERT OR IGNORE INTO slots (slot_id,case_id,created_at) VALUES (?,?,?)")
        .bind(slot,id,now()).run();
      if(!inserted.meta?.changes) return error("That slot was just taken",409);
      await env.DB.prepare("UPDATE cases SET slot_id=? WHERE id=?").bind(slot,id).run();
      return j({slot,calendarUrl:`/api/cases/${id}/ics?token=${row.family_key}`});
    }
    if(action==="ics" && request.method==="GET" && role==="family") {
      if(!row.slot_id) return error("No call slot reserved",404);
      return new Response(ics(row.slot_id,id),{headers:{"content-type":"text/calendar; charset=utf-8",
        "content-disposition":"attachment; filename=demo-parent-call.ics"}});
    }
    return error("Not found",404);
  } catch(e) { return error(trim(e.message||String(e),180),500); }
}};
