// Dream Mantra Career Library — Main app: state, career filters, render functions


let state = {
  tab: "all", q: "", sort: "rel", page: 1,
  streams:[], clusters:[], types:[], levels:[],
  demand:[], risk:[], dur:[], diff:[], remote:[],
  mob:[], govt:[], ent:[], sal:[], country:[], research:[], priv:[]
};

// ── HELPERS ─────────────────────────────────────────────────────────────────
const uniq = arr => [...new Set(arr.filter(Boolean))].sort();
const idx  = (arr, v) => arr.indexOf(v) === -1 ? 999 : arr.indexOf(v);

function demB(v) {
  const cls = {
    "Very High":"b b-vh","High":"b b-h","Medium":"b b-m","Low":"b b-l"
  }[v] || "b b-l";
  return `<span class="${cls}">${v||"?"} demand</span>`;
}
function riskB(v) {
  const cls = {"Low":"b b-rlo","Medium":"b b-rme","High":"b b-rhi"}[v]||"b b-rme";
  return `<span class="${cls}">AI: ${v||"?"}</span>`;
}
function pill(v) { return `<span class="b b-pill">${v}</span>`; }
function domB(v) { return `<span class="b b-dom">${v}</span>`; }

function meter(score) {
  const pct = Math.max(0, Math.min(10, score||0)) * 10;
  const col = score>=7?"#F05A0E":score>=5?"#D07020":"#B84040";
  return `<div class="mtr">
    <div class="mtr-top"><span>AI resilience</span><strong style="color:${col}">${score}/10</strong></div>
    <div class="mtr-track"><div class="mtr-fill" style="width:${pct}%"></div></div>
  </div>`;
}

// ── FILTER OPTIONS per tab ──────────────────────────────────────────────────
function getOpts(data) {
  if (!data) return {};
  return {
    streams:  uniq(data.flatMap(c => c.streams||[])),
    clusters: uniq(data.map(c => c.cluster||c.domain||"")),
    types:    uniq(data.map(c => c.degreeType||c.domain||"")),
    levels:   ["After Class 10","After Class 12","After Graduation","After Post Graduation"],
    demand:   DEMAND_ORDER.filter(d => data.some(c => c.industryDemand===d||c.futureDemand===d)),
    risk:     ["Low","Medium","High"].filter(r => data.some(c => c.aiImpactRisk===r)),
    dur:      uniq(data.map(c => c.durCat||"").filter(Boolean)),
    diff:     ["Low-Medium","Medium","Medium-High","High","Very High"].filter(d => data.some(c => c.difficulty===d)),
    remote:   ["High","Medium","Low"].filter(r => data.some(c => c.remoteWork===r)),
    mob:      uniq(data.map(c => c.mobCat||"").filter(Boolean)),
    govt:     ["Very High","High","Medium","Low"].filter(g => data.some(c => c.govtOpportunities===g)),
    ent:      ["Very High","High","Medium","Low"].filter(e => data.some(c => c.entrepreneurship===e)),
    sal:      uniq(data.map(c => c.salCat||"").filter(Boolean)),
    country:  ["India","International"].filter(cc => data.some(c => (c.country||"").includes(cc))),
    research: ["High","Medium","Low"].filter(r => data.some(c => c.research===r)),
    priv:     ["Very High","High","Medium","Low"].filter(p => data.some(c => c.privateOpportunities===p)),
  };
}

// ── FILTER + SORT DATA ──────────────────────────────────────────────────────
function applyFilters(data) {
  const ql = state.q.trim().toLowerCase();
  return data.filter(c => {
    if (ql) {
      const hay = [c.name,c.cluster,c.domain,...(c.skills||[]),...(c.topCareers||[]),...(c.streams||[])]
        .join(" ").toLowerCase();
      if (!hay.includes(ql)) return false;
    }
    if (state.streams.length  && !(c.streams||[]).some(s => state.streams.includes(s)))  return false;
    if (state.clusters.length && !state.clusters.includes(c.cluster||c.domain||""))       return false;
    if (state.types.length    && !state.types.includes(c.degreeType||c.domain||""))       return false;
    if (state.levels.length   && !state.levels.includes(c.level||""))                     return false;
    if (state.demand.length   && !state.demand.includes(c.industryDemand||c.futureDemand||"")) return false;
    if (state.risk.length     && !state.risk.includes(c.aiImpactRisk||""))                return false;
    if (state.dur.length      && !state.dur.includes(c.durCat||""))                       return false;
    if (state.diff.length     && !state.diff.includes(c.difficulty||""))                  return false;
    if (state.remote.length   && !state.remote.includes(c.remoteWork||""))                return false;
    if (state.mob.length      && !state.mob.includes(c.mobCat||""))                       return false;
    if (state.govt.length     && !state.govt.includes(c.govtOpportunities||""))           return false;
    if (state.ent.length      && !state.ent.includes(c.entrepreneurship||""))             return false;
    if (state.sal.length      && !state.sal.includes(c.salCat||""))                       return false;
    return true;
  }).sort((a,b) => {
    if (state.sort === "ai")     return (b.aiProofScore||0)-(a.aiProofScore||0);
    if (state.sort === "demand") return idx(DEMAND_ORDER,a.industryDemand)-idx(DEMAND_ORDER,b.industryDemand);
    if (state.sort === "az")     return a.name.localeCompare(b.name);
    return 0;
  });
}

// ── CARD HTML ───────────────────────────────────────────────────────────────
function cardHTML(c, globalIdx) {
  const streams = (c.streams||[]).slice(0,3).map(s=>pill(s)).join("");
  const topC = (c.topCareers||[]).slice(0,2).join(", ");
  return `
  <button class="card" onclick="openModal(${globalIdx})">
    <div class="card-top">
      <span class="card-cl">${c.cluster||c.domain||""}</span>
      ${riskB(c.aiImpactRisk)}
    </div>
    <div>
      <div class="card-name">${c.name}</div>
      <div class="card-sub">${[c.degreeType,c.duration].filter(Boolean).join(" · ")}</div>
    </div>
    <div class="card-pills">${streams}</div>
    <div class="card-bot">
      ${demB(c.industryDemand||c.futureDemand)}
      <span class="card-sal">${c.salaryEntry||c.salaryPotentialSenior||""}</span>
    </div>
    ${c.aiProofScore!=null ? meter(c.aiProofScore) : ""}
  </button>`;
}

// ── SUBJECTS VIEW ───────────────────────────────────────────────────────────
function renderSubjects() {
  const ql = state.q.trim().toLowerCase();
  const entries = Object.entries(SUBJ_MAP)
    .filter(([s]) => !ql || s.toLowerCase().includes(ql));
  document.getElementById("res-ct").innerHTML =
    `<strong>${entries.length}</strong> subjects`;
  document.getElementById("main-content").innerHTML =
    `<div class="subj-grid">${entries.map(([subj, careers]) => {
      const topCareers = careers.slice(0,5).map(c=>c.name).join(", ");
      const dems = [...new Set(careers.map(c=>c.demand))];
      return `<button class="subj-card" onclick="openSubjectDetail('${subj.replace(/'/g,"\'")}')">
        <h3>${subj}</h3>
        <div class="deg-count">${careers.length} degree pathway${careers.length!==1?"s":""}</div>
        <div class="card-pills" style="margin-bottom:6px">
          ${dems.map(d=>demB(d)).join(" ")}
        </div>
        <div class="career-list">${topCareers}${careers.length>5?`<span style="color:#F05A0E"> +${careers.length-5} more</span>`:""}
        </div>
      </button>`;
    }).join("")}</div>`;
  document.getElementById("load-wrap").style.display = "none";
}

// ── STREAMS VIEW ────────────────────────────────────────────────────────────
function renderStreams() {
  const entries = Object.entries(STREAM_MAP);
  document.getElementById("res-ct").innerHTML =
    `<strong>${entries.length}</strong> streams`;
  document.getElementById("main-content").innerHTML =
    `<div class="subj-grid">${entries.map(([stream, degrees]) => {
      const byType = {};
      degrees.forEach(d => { byType[d.degreeType]=(byType[d.degreeType]||0)+1; });
      const topDegs = degrees.slice(0,6).map(d=>d.name);
      return `<div class="stream-card">
        <h3>${stream}</h3>
        <div class="stream-stat">${degrees.length} degree pathways available</div>
        <div class="card-pills" style="margin-bottom:8px">
          ${Object.entries(byType).map(([t,n])=>`<span class="b b-pill">${t}: ${n}</span>`).join("")}
        </div>
        <div class="career-list" style="font-size:12px;color:#7A5C4A;line-height:1.7">
          ${topDegs.join(", ")}${degrees.length>6?`<span style="color:#F05A0E"> +${degrees.length-6} more</span>`:""}
        </div>
      </div>`;
    }).join("")}</div>`;
  document.getElementById("load-wrap").style.display = "none";
}

// ── MAIN GRID RENDER ────────────────────────────────────────────────────────
function renderGrid() {
  const tab = TABS.find(t=>t.id===state.tab);
  if (!tab.hasGrid) {
    if (state.tab==="subjects") renderSubjects();
    else if (state.tab==="streams") renderStreams();
    else if (state.tab==="exams") renderExamGrid();
    return;
  }

  const data = tab.data;
  const res  = applyFilters(data);
  const show = res.slice(0, state.page * PAGE);

  document.getElementById("res-ct").innerHTML =
    `<strong>${res.length.toLocaleString()}</strong> pathway${res.length!==1?"s":""}`;

  if (res.length === 0) {
    document.getElementById("main-content").innerHTML =
      `<div class="empty-box">
        <h3>No pathways match these filters.</h3>
        <p>Try removing a filter or searching a broader term.</p>
        <button class="load-btn" onclick="clearAll()">Clear all filters</button>
      </div>`;
    document.getElementById("load-wrap").style.display = "none";
    return;
  }

  // map card idx → global CAREERS idx for modal
  document.getElementById("main-content").innerHTML =
    `<div class="grid">${show.map(c => {
      const gi = CAREERS.findIndex(x=>x.id===c.id);
      return cardHTML(c, gi!==-1 ? gi : 0);
    }).join("")}</div>`;

  const lw = document.getElementById("load-wrap");
  if (res.length > show.length) {
    lw.style.display = "";
    document.getElementById("load-btn").textContent =
      `Show more (${res.length-show.length} remaining)`;
  } else {
    lw.style.display = "none";
  }
}

function loadMore() { state.page++; renderGrid(); }

// ── FILTERS PANEL ────────────────────────────────────────────────────────────
function fsec(id, title, options, selKey, openDef) {
  if (!options || !options.length) return "";
  const opts = options.map(opt => {
    const chk = state[selKey].includes(opt) ? "checked" : "";
    const cnt = (TABS.find(t=>t.id===state.tab)?.data||[])
      .filter(c => {
        if (selKey==="streams")  return (c.streams||[]).includes(opt);
        if (selKey==="clusters") return (c.cluster||c.domain)===opt;
        if (selKey==="types")    return c.degreeType===opt;
        if (selKey==="levels")   return c.level===opt;
        if (selKey==="demand")   return c.industryDemand===opt||c.futureDemand===opt;
        if (selKey==="risk")     return c.aiImpactRisk===opt;
        if (selKey==="dur")      return c.durCat===opt;
        if (selKey==="diff")     return c.difficulty===opt;
        if (selKey==="remote")   return c.remoteWork===opt;
        if (selKey==="mob")      return c.mobCat===opt;
        if (selKey==="govt")     return c.govtOpportunities===opt;
        if (selKey==="ent")      return c.entrepreneurship===opt;
        if (selKey==="riasec")   return (c.riasecList||[]).includes(opt);
        if (selKey==="sal")      return c.salCat===opt;
        return false;
      }).length;
    const safeOpt = opt.replace(/&/g,"&amp;").replace(/"/g,"&quot;");
    return `<label>
      <input type="checkbox" data-key="${selKey}" data-val="${safeOpt}" ${chk}/>
      ${opt}
      <span class="f-count">${cnt}</span>
    </label>`;
  }).join("");
  return `<div class="f-sec">
    <button class="f-tog" onclick="toggleSec(this)">
      ${title}<span class="arr">${openDef?"−":"+"}</span>
    </button>
    <div class="f-opts" style="display:${openDef?"":"none"}">${opts}</div>
  </div>`;
}

function toggleSec(btn) {
  const opts = btn.nextElementSibling;
  const arr  = btn.querySelector(".arr");
  const open = opts.style.display !== "none";
  opts.style.display = open ? "none" : "";
  arr.textContent    = open ? "+" : "−";
}

function renderFilters(containerId) {
  const tab  = TABS.find(t=>t.id===state.tab);
  if (!tab.hasFilters) { document.getElementById(containerId).innerHTML=""; return; }
  const data = tab.data;
  const opts = getOpts(data);
  document.getElementById(containerId).innerHTML =
    fsec("f-streams",  "Stream eligibility",   opts.streams,  "streams",  true)  +
    fsec("f-clusters", "Field / Interest area", opts.clusters, "clusters", true)  +
    fsec("f-types",    "Qualification type",    opts.types,    "types",    false) +
    fsec("f-levels",   "Entry level",           opts.levels,   "levels",   false) +
    fsec("f-demand",   "Industry demand",       opts.demand,   "demand",   false) +
    fsec("f-risk",     "AI impact risk",        opts.risk,     "risk",     false) +
    fsec("f-dur",      "Duration",              opts.dur,      "dur",      false) +
    fsec("f-diff",     "Difficulty",            opts.diff,     "diff",     false) +
    fsec("f-remote",   "Remote work",           opts.remote,   "remote",   false) +
    fsec("f-mob",      "Global mobility",       opts.mob,      "mob",      false) +
    fsec("f-govt",     "Govt opportunities",    opts.govt,     "govt",     false) +
    fsec("f-ent",      "Entrepreneurship",      opts.ent,      "ent",      false) +
    fsec("f-sal",      "Entry salary",          opts.sal,      "sal",      false) +
    fsec("f-priv",     "Private sector",        opts.priv,     "priv",     false) +
    fsec("f-country",  "India / Global",        opts.country,  "country",  false) +
    fsec("f-research", "Research component",    opts.research, "research", false);

  document.getElementById(containerId).querySelectorAll("input[type=checkbox]")
    .forEach(cb => cb.addEventListener("change", () => {
      const key = cb.dataset.key;
      const val = cb.dataset.val;
      if (cb.checked) { if (!state[key].includes(val)) state[key].push(val); }
      else { const i=state[key].indexOf(val); if(i>-1) state[key].splice(i,1); }
      state.page = 1;
      renderAll();
    }));
}

// ── CHIPS ────────────────────────────────────────────────────────────────────
function renderChips() {
  const KEYS = [
    ["streams","Stream"],["clusters","Field"],["types","Type"],["levels","Level"],
    ["demand","Demand"],["risk","AI Risk"],["dur","Duration"],["diff","Difficulty"],
    ["remote","Remote"],["mob","Mobility"],["govt","Govt"],["ent","Ent."],
    ["sal","Salary"],["country","Scope"],["priv","Private"],["research","Research"],
  ];
  const pairs = KEYS.flatMap(([key,label]) =>
    state[key].map(v => [v, key])
  );
  document.getElementById("chips").innerHTML = pairs.map(([v,key],i) =>
    `<span class="chip">${v}<button class="chip-x" data-k="${key}" data-v="${v.replace(/"/g,"&quot;")}">&#x2715;</button></span>`
  ).join("");
  document.getElementById("chips").querySelectorAll(".chip-x").forEach(btn => {
    btn.addEventListener("click", () => {
      const k=btn.dataset.k, v=btn.dataset.v;
      const i=state[k].indexOf(v); if(i>-1) state[k].splice(i,1);
      state.page=1; renderAll();
    });
  });
}

// ── TABS ─────────────────────────────────────────────────────────────────────
function renderTabs() {
  document.getElementById("tabs").innerHTML = TABS.map(t =>
    `<button class="tab${t.id===state.tab?" active":""}" onclick="setTab('${t.id}')">
      ${t.label}
      <span class="tab-count">${t.data?t.data.length.toLocaleString():Object.keys(t.id==="subjects"?SUBJ_MAP:STREAM_MAP).length}}</span></span>
    </button>`
  ).join("");
}

function setTab(id) {
  state.tab=id; state.page=1; state.q="";
  document.getElementById("srch").value="";
  renderAll();
}

// ── STATS HEADER ─────────────────────────────────────────────────────────────
function renderStats() {
  const s = [
    [CAREERS.length.toLocaleString(),"Total Pathways"],
    [(EXAMS?EXAMS.length:0),"Exams Covered"],
    [BACHELORS.length,"Bachelor's"],
    [MASTERS.length,"Master's"],
    [PHDS.length,"PhDs"],
    [DIPLOMAS.length,"Diploma/Cert"],
    [Object.keys(SUBJ_MAP).length,"Subjects"],
    [Object.keys(STREAM_MAP).length,"Streams"],
    [FUTURE.length,"Future Careers"],
  ];
  document.getElementById("hdr-stats").innerHTML = s.map(([n,l])=>
    `<div class="stat-box"><div class="stat-n">${n}</div><div class="stat-l">${l}</div></div>`
  ).join("");
}

// ── MODAL ─────────────────────────────────────────────────────────────────────
function drow(label, value) {
  if (!value||(Array.isArray(value)&&!value.length)) return "";
  const v = Array.isArray(value)?value.join(", "):String(value);
  return `<div class="dl-row"><dt class="dl-lbl">${label}</dt><dd class="dl-val">${v}</dd></div>`;
}

function openModal(gi) {
  var c = CAREERS[gi];
  if (!c) return;
  document.getElementById("mcl").textContent = c.cluster||"";
  document.getElementById("mnm").textContent = c.name;
  document.getElementById("mmt").textContent = [c.degreeType,c.level,c.duration].filter(Boolean).join(" · ");
  document.getElementById("mbdg").innerHTML  = demB(c.industryDemand)+" "+riskB(c.aiImpactRisk);
  document.getElementById("mdsc").textContent= c.description||"";
  document.getElementById("mmtr").innerHTML  = meter(c.aiProofScore);

  // Salary grid
  var salaryHTML = "";
  if (c.salaryEntry || c.salaryMid || c.salarySenior) {
    salaryHTML += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:8px 0">';
    var levels = ["Entry", "Mid", "Senior"];
    var vals = [c.salaryEntry, c.salaryMid, c.salarySenior];
    var bgs = ["#FFF3EC", "#FFF8F0", "#FFFCFA"];
    for (var si = 0; si < 3; si++) {
      if (vals[si]) {
        salaryHTML += '<div style="background:' + bgs[si] + ';border:1px solid #FFD5BC;border-radius:8px;padding:9px;text-align:center">';
        salaryHTML += '<div style="font-size:10px;color:#7A5C4A;font-weight:700;font-family:Plus Jakarta Sans,sans-serif;text-transform:uppercase">' + levels[si] + '</div>';
        salaryHTML += '<div style="font-size:12px;color:#F05A0E;font-weight:800;margin-top:3px;font-family:Plus Jakarta Sans,sans-serif">' + vals[si] + '</div>';
        salaryHTML += '</div>';
      }
    }
    salaryHTML += '</div>';
  }

  // Section heading helper
  function sh(emoji, title, color) {
    return '<div style="border-top:2px solid ' + color + '30;margin:14px 0 0 0"><div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:' + color + ';margin:10px 0 6px 0;font-family:Plus Jakarta Sans,sans-serif">' + emoji + ' ' + title + '</div>';
  }

  var body = "";

  // 1. What this career is
  body += sh("📌", "What You Study", "#1F618D");
  body += drow("What you study", c.whatYouStudy);
  body += drow("Streams eligible", c.streams);
  body += drow("Key subjects", c.subjects);
  body += drow("Basic eligibility", c.eligibility);
  body += drow("Top career roles", c.topCareers);
  body += "</div>";

  // 2. Full eligibility from Class 10
  body += renderEligPath(c);

  // 3. Courses to pursue
  body += renderCourses(c);

  // 4. Entrance exams
  if (c.entranceExams && c.entranceExams.length) {
    body += sh("📝", "Entrance Exams to Target", "#7D3C98");
    body += drow("Key exams", c.entranceExams);
    body += "</div>";
  }

  // 5. Skills to acquire
  body += renderSkills(c);

  // 6. Salary
  if (salaryHTML) {
    body += sh("💰", "Salary Range", "#F05A0E");
    body += salaryHTML;
    body += "</div>";
  }

  // 7. Career prospects
  body += sh("🚀", "Career Prospects", "#1A6640");
  body += drow("Work environment", c.workEnvironment);
  body += drow("Typical day", c.typicalDay);
  body += drow("Difficulty level", c.difficulty);
  body += drow("Course duration", c.duration);
  body += drow("Cost range", c.costRange);
  body += drow("Scholarships", c.scholarship);
  body += "</div>";

  // 8. Opportunities
  body += sh("🌐", "Opportunities and Outlook", "#1A4A7A");
  body += drow("Govt opportunities", c.govtOpportunities);
  body += drow("Private sector", c.privateOpportunities);
  body += drow("Remote work", c.remoteWork);
  body += drow("Global mobility", (c.globalMobility||0)+"/10");
  body += drow("Entrepreneurship", c.entrepreneurship);
  body += drow("AI risk", c.aiImpactRisk);
  body += drow("AI proof score", (c.aiProofScore||0)+"/10");
  body += drow("Future outlook", c.futureOutlook);
  body += drow("Career progression", c.progressionPath);
  body += "</div>";

  // 9. Personality (kept: multiple intelligences; removed: MBTI and RIASEC)
  body += sh("🧠", "Who Thrives in This Field", "#7D3C98");
  body += drow("Personality fit", c.personalityFit);
  body += drow("Multiple intelligences", c.multipleIntelligence);
  body += "</div>";

  // 10. Related paths
  if (c.relatedDegrees && c.relatedDegrees.length) {
    body += sh("🔗", "Related and Alternative Degrees", "#5D6D7E");
    body += drow("Related degrees", c.relatedDegrees);
    body += drow("Alternative routes", c.alternativeDegrees);
    body += "</div>";
  }

  document.getElementById("mdl").innerHTML = body;
  document.getElementById("modal").style.display="flex";
  document.body.style.overflow="hidden";
}

function openSubjectDetail(subj) {
  const careers = SUBJ_MAP[subj]||[];
  document.getElementById("mcl").textContent  = "Subject";
  document.getElementById("mnm").textContent  = subj;
  document.getElementById("mmt").textContent  = careers.length+" career pathways";
  document.getElementById("mbdg").innerHTML   = "";
  document.getElementById("mdsc").textContent = "All degrees and careers you can pursue with "+subj+" as a key subject.";
  document.getElementById("mmtr").innerHTML   = "";
  document.getElementById("mdl").innerHTML    =
    careers.map(c=>`<div class="dl-row">
      <dt class="dl-lbl">${c.degreeType}</dt>
      <dd class="dl-val"><strong>${c.name}</strong><br>
        <span style="font-size:11px;color:#7A5C4A">${(c.streams||[]).join(", ")}</span>
      </dd>
    </div>`).join("");
  document.getElementById("modal").style.display="flex";
  document.body.style.overflow="hidden";
}

function closeModal() {
  document.getElementById("modal").style.display="none";
  document.body.style.overflow="";
}

// ── CLEAR ALL ────────────────────────────────────────────────────────────────
function clearAll() {
  if(state.tab==="exams"){clearExamFilters();return;}
  ["streams","clusters","types","levels","demand","risk","dur","diff",
   "remote","mob","govt","ent","sal"].forEach(k => state[k]=[]);
  state.q=""; state.page=1;
  document.getElementById("srch").value="";
  renderAll();
}

// ── DRAWER ───────────────────────────────────────────────────────────────────
function openDrw()  { document.getElementById("drw-ov").classList.add("open"); }
function closeDrw() { document.getElementById("drw-ov").classList.remove("open"); }

// ── SEARCH / SORT ────────────────────────────────────────────────────────────
document.getElementById("srch").addEventListener("input", e => {
  state.q=e.target.value; state.page=1; renderGrid(); renderChips();
});
document.getElementById("srt").addEventListener("change", e => {
  state.sort=e.target.value; state.page=1; renderGrid();
});
document.addEventListener("keydown", e => { if(e.key==="Escape"){ closeModal(); closeDrw(); } });

// show/hide controls based on tab
function toggleControls() {
  const tab = TABS.find(t=>t.id===state.tab);
  const show = tab.hasFilters || tab.hasGrid || tab.id==="exams";
  document.getElementById("ctrl-row").style.display = show?"":"none";
  document.getElementById("side").style.display = (tab.hasFilters||tab.id==="exams")?"":"none";
  document.getElementById("mob-btn").style.display = (tab.hasFilters||tab.id==="exams")?"":"none";
}

// ── RENDER ALL ───────────────────────────────────────────────────────────────
function renderAll() {
  renderTabs();
  toggleControls();
  if(state.tab==="exams"){renderExamFilters("side-filters");renderExamFilters("drw-filters");}else{renderFilters("side-filters");renderFilters("drw-filters");}
  renderChips();
  renderGrid();
  // update mob btn
  const total = ["streams","clusters","types","levels","demand","risk","dur","diff",
    "remote","mob","govt","ent","sal","country","research","priv"].reduce((a,k)=>a+state[k].length,0);
  document.getElementById("mob-btn").textContent = "Filters"+(total>0?` (${total})`:"");
  // update drawer btn
  const tab = TABS.find(t=>t.id===state.tab);
  const res = tab.data ? applyFilters(tab.data) : [];
  const db = document.getElementById("drw-apply");
  if (db) db.textContent = `Show ${res.length.toLocaleString()} results`;
}


// ═══════════════════════════════ EXAM TAB ═══════════════════════════════════
