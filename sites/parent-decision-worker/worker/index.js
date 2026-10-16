const PAGE = "";
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
      "HTTP-Referer":"https://niat-parent-decision-demo.kerala-ayurv-7936.chatgpt.site",
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
