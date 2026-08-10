// Dream Mantra Career Library — Exam tab: state, render, filter functions


let examState = {
  q:"", cat:[], type:[], broad:[], typ:[], c10k:[], gradReq:[], hasDetail:false, page:1
};
var ES = examState;
const EXAM_PAGE = 50;

function catBadge(cat) {
  const colors = {
    "Civil Services (UPSC)":           {bg:"#1A4A7A",tx:"#fff"},
    "Staff Selection Commission":      {bg:"#2D7D4E",tx:"#fff"},
    "Banking":                         {bg:"#7A3A00",tx:"#fff"},
    "Defence":                         {bg:"#4A2A7A",tx:"#fff"},
    "Teaching Eligibility":            {bg:"#1A6640",tx:"#fff"},
    "State PSC (Rajasthan)":           {bg:"#8A1A1A",tx:"#fff"},
    "Teaching & Research":             {bg:"#1A4A4A",tx:"#fff"},
    "Engineering Entrance":            {bg:"#F05A0E",tx:"#fff"},
    "Medical Entrance":                {bg:"#C0392B",tx:"#fff"},
    "Management Entrance":             {bg:"#1A5276",tx:"#fff"},
    "Design Entrance":                 {bg:"#7D3C98",tx:"#fff"},
    "Law Entrance":                    {bg:"#2E4057",tx:"#fff"},
    "International / Language":        {bg:"#0E6655",tx:"#fff"},
    "Postgraduate Entrance":           {bg:"#784212",tx:"#fff"},
    "University Entrance":             {bg:"#1F618D",tx:"#fff"},
    "Railways":                        {bg:"#17202A",tx:"#fff"},
    "Insurance":                       {bg:"#186A3B",tx:"#fff"},
  };
  const c = colors[cat] || {bg:"#5D6D7E",tx:"#fff"};
  return `<span style="display:inline-block;padding:2px 8px;border-radius:5px;font-size:10px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;background:${c.bg};color:${c.tx}">${cat}</span>`;
}

function examCard(e) {
  const stages = (e.stages||[]).length;
  const months = (e.timeline||[]).length;
  const hasD = e.hasDetail ? '🔍 Full details' : '📋 Basic info';
  var _acl=
function clusterAccent(cluster) {
  var cl = (cluster||'').toLowerCase();
  if (cl.indexOf('engineer')>-1||cl.indexOf('information tech')>-1||cl.indexOf('artificial')>-1||cl.indexOf('emerging')>-1||cl.indexOf('aviation')>-1) return 'ca3';
  if (cl.indexOf('health')>-1||cl.indexOf('medical')>-1||cl.indexOf('nurs')>-1||cl.indexOf('agri')>-1||cl.indexOf('sustain')>-1||cl.indexOf('sport')>-1) return 'ca2';
  if (cl.indexOf('finance')>-1||cl.indexOf('banking')>-1||cl.indexOf('management')>-1||cl.indexOf('business')>-1||cl.indexOf('legal')>-1||cl.indexOf('multidis')>-1) return 'ca5';
  if (cl.indexOf('design')>-1||cl.indexOf('media')>-1||cl.indexOf('social')>-1||cl.indexOf('mental')>-1||cl.indexOf('hospit')>-1||cl.indexOf('skill')>-1||cl.indexOf('voc')>-1) return 'ca4';
  return 'ca1';
}
clusterAccent(c.cluster||c.domain||""); return `<button class="card ${_acl}" onclick="openExamModal('${e.id}')" style="border-top:3px solid ${e.hasDetail?'#F05A0E':'#FFD5BC'};border-left:1px solid #FFD5BC;gap:8px">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px">
      ${catBadge(e.category)}
      <span style="font-size:10px;color:${e.type==='govt'?'#2D7D4E':'#1F618D'};font-weight:700;background:${e.type==='govt'?'#E8F7EE':'#EBF5FB'};border-radius:4px;padding:2px 6px">${e.type==='govt'?'Govt Job':'Admission'}</span>
    </div>
    <div>
      <div class="card-name" style="font-size:13px">${e.name}</div>
      <div class="card-sub" style="font-size:11px;margin-top:2px">${e.conductedBy||''}</div>
    </div>
    <div class="card-sub" style="font-size:11px;color:#7A5C4A;line-height:1.5">${(e.forAdmissionTo||e.eligibilityBasic||'').slice(0,80)}${(e.forAdmissionTo||'').length>80?'…':''}</div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:2px">
      <span style="font-size:10px;color:#F05A0E;font-weight:600">${stages>0?stages+' stages':''}</span>
      <span style="font-size:10px;background:${e.hasDetail?'#FFF3EC':'#F5F5F5'};border:1px solid ${e.hasDetail?'#FFD5BC':'#E0E0E0'};border-radius:4px;padding:1px 6px;color:${e.hasDetail?'#7A3000':'#7A5C4A'}">${hasD}</span>
    </div>
  </button>`;
}

function filterExams(){
  if(!ES.gradReq) ES.gradReq=[];
  var ql=ES.q.trim().toLowerCase();
  return EXAMS.filter(function(e){
    if(ql&&[e.name,e.cat,e.broad,e.cby,e.for_,e.elig].join(' ').toLowerCase().indexOf(ql)===-1) return false;
    if(ES.broad.length  &&ES.broad.indexOf(e.broad)===-1)return false;
    if(ES.typ.length    &&ES.typ.indexOf(e.typ)===-1)    return false;
    if(ES.c10k.length   &&ES.c10k.indexOf(e.c10)===-1)   return false;
    if(ES.gradReq.length){
      var hg=e.grad&&e.grad!==null&&String(e.grad)!=='null'&&e.grad!==undefined&&e.grad!=='';
      if(ES.gradReq.indexOf('yes')>-1&&ES.gradReq.indexOf('no')===-1&&!hg) return false;
      if(ES.gradReq.indexOf('no')>-1&&ES.gradReq.indexOf('yes')===-1&&hg)  return false;
    }
    if(ES.detail&&!e.hasDetail) return false;
    return true;
  });
}

function renderExamGrid() {
  const res = filterExams();
  const show = res.slice(0, examState.page * EXAM_PAGE);
  document.getElementById("res-ct").innerHTML = `<strong>${res.length.toLocaleString()}</strong> exam${res.length!==1?"s":""}`;
  document.getElementById("main-content").innerHTML =
    res.length===0
    ? `<div class="empty-box"><h3>No exams match these filters.</h3><p>Try removing a filter.</p><button class="load-btn" onclick="clearExamFilters()">Clear filters</button></div>`
    : `<div class="grid">${show.map(e=>examCard(e)).join('')}</div>`;
  const lw = document.getElementById("load-wrap");
  if (res.length > show.length) {
    lw.style.display="";
    document.getElementById("load-btn").textContent=`Show more (${res.length-show.length} remaining)`;
    document.getElementById("load-btn").onclick=()=>{examState.page++;renderExamGrid();};
  } else { lw.style.display="none"; }
}

function renderExamFilters(cid) {
  if (!ES.gradReq) ES.gradReq = [];
  var broads = [...new Set(EXAMS.map(function(e){return e.broad||'';}).filter(Boolean))].sort();

  function efsec(title, items, selKey, openDef) {
    if (!items.length) return '';
    var arr = selKey==='broad'?ES.broad:selKey==='typ'?ES.typ:selKey==='c10'?ES.c10k:ES.gradReq;
    var opts = items.map(function(item){
      var val=item[0], lbl=item[1];
      var chk = arr.indexOf(val)>-1?'checked':'';
      var cnt = EXAMS.filter(function(e){
        if (selKey==='broad')   return e.broad===val;
        if (selKey==='typ')     return e.typ===val;
        if (selKey==='c10')     return e.c10===val;
        if (selKey==='gradReq') {
          var hg=e.grad&&e.grad!==null&&String(e.grad)!=='null'&&e.grad!==undefined&&e.grad!=='';
          return val==='yes'?hg:!hg;
        }
        return false;
      }).length;
      var sv=val.replace(/&/g,'&amp;').replace(/"/g,'&quot;');
      return '<label><input type="checkbox" class="exam-cb" data-key="'+selKey+'" data-val="'+sv+'" '+chk+'/>'+lbl+' <span class="f-count">'+cnt+'</span></label>';
    }).join('');
    var disp=openDef?'':'none'; var arr2=openDef?'−':'+';
    return '<div class="f-sec"><button class="f-tog" onclick="toggleSec(this)">'+title+'<span class="arr">'+arr2+'</span></button><div class="f-opts" style="display:'+disp+'">'+opts+'</div></div>';
  }

  var detChk='<div class="f-sec"><label style="display:flex;align-items:center;gap:7px;font-size:12px;color:#7A5C4A;cursor:pointer;padding:4px 0"><input type="checkbox" '+(ES.detail?'checked':'')+' onchange="ES.detail=this.checked;ES.page=1;renderExamFilters(\'side-filters\');renderExamFilters(\'drw-filters\');renderExamGrid()" style="accent-color:#F05A0E;cursor:pointer"/>Full details only</label></div>';

  document.getElementById(cid).innerHTML =
    efsec('Category', broads.map(function(b){return [b,b];}), 'broad', true) +
    efsec('Exam Type', [['admission','Admission / Entrance'],['govt','Government Job'],['cert','Certification']], 'typ', false) +
    efsec('Class 10 Path', [['pcm','PCM — Engineering / Science'],['pcb','PCB — Medical / Biology'],['com','Commerce'],['any','Open to All Streams'],['grad','After Graduation only']], 'c10', false) +
    efsec('Degree Required?', [['no','After Class 12 (no degree needed)'],['yes','Graduation required']], 'gradReq', false) +
    detChk;

  document.getElementById(cid).querySelectorAll('.exam-cb').forEach(function(cb){
    cb.addEventListener('change', function(){
      var key=cb.dataset.key, val=cb.dataset.val;
      var arr=key==='broad'?ES.broad:key==='typ'?ES.typ:key==='c10'?ES.c10k:ES.gradReq;
      if (cb.checked){if(arr.indexOf(val)===-1)arr.push(val);}
      else{var i=arr.indexOf(val);if(i>-1)arr.splice(i,1);}
      ES.page=1; renderExamGrid();
    });
  });
}
function clearExamFilters() {
  examState.q=''; examState.cat=[]; examState.type=[]; examState.broad=[]; examState.typ=[]; examState.c10k=[]; examState.gradReq=[]; examState.hasDetail=false; examState.page=1;
  document.getElementById("srch").value='';
  renderExamFilters('side-filters'); renderExamFilters('drw-filters'); renderExamGrid();
}

// ── EXAM DETAIL MODAL ────────────────────────────────────────────────────────
const EXAM_MAP = Object.fromEntries(EXAMS.map(e=>[e.id,e]));

function erow(label, value) {
  if (!value) return '';
  const v = Array.isArray(value)?value.join(', '):String(value);
  if (!v.trim() || v==='undefined' || v==='null') return '';
  return `<div class="dl-row"><dt class="dl-lbl">${label}</dt><dd class="dl-val">${v}</dd></div>`;
}

function eligTree(e) {
  const c10 = e.class10;
  const c12 = e.class12;
  const grad = e.graduation;
  let html = '';

  // Class 10
  if (c10) {
    html += `<div style="border-left:3px solid #F05A0E;margin:12px 0;padding-left:12px">
      <div style="font-size:12px;font-weight:800;color:#F05A0E;font-family:'Plus Jakarta Sans',sans-serif;margin-bottom:6px">📚 CLASS 10 — Foundation Requirements</div>
      <div class="dl-row"><dt class="dl-lbl">Mathematics type</dt><dd class="dl-val" style="color:${c10.mathType&&c10.mathType.includes('NOT')?'#A82020':'#3A1800'}">${c10.mathType||'—'}</dd></div>
      <div class="dl-row"><dt class="dl-lbl">Minimum marks</dt><dd class="dl-val">${c10.minMarks||'—'}</dd></div>
      <div class="dl-row"><dt class="dl-lbl">Key subjects</dt><dd class="dl-val">${Array.isArray(c10.mandatorySubjects)?c10.mandatorySubjects.join(', '):(c10.mandatorySubjects||'—')}</dd></div>
      ${c10.avoidNote?`<div style="background:#FFF3EC;border:1px solid #FFD5BC;border-radius:6px;padding:8px 10px;margin-top:6px;font-size:12px;color:#7A3000">⚠️ ${c10.avoidNote}</div>`:''}
      ${c10.note?`<div style="background:#FFF8F4;border:1px solid #FFD5BC;border-radius:6px;padding:8px 10px;margin-top:6px;font-size:12px;color:#7A5C4A">💡 ${c10.note}</div>`:''}
    </div>`;
  }

  // Class 11-12
  if (c12) {
    html += `<div style="border-left:3px solid #1F618D;margin:12px 0;padding-left:12px">
      <div style="font-size:12px;font-weight:800;color:#1F618D;font-family:'Plus Jakarta Sans',sans-serif;margin-bottom:6px">📖 CLASS 11–12 — Stream & Subject Requirements</div>
      <div class="dl-row"><dt class="dl-lbl">Required stream</dt><dd class="dl-val" style="font-weight:600">${c12.stream||'—'}</dd></div>
      <div class="dl-row"><dt class="dl-lbl">Mandatory subjects</dt><dd class="dl-val">${Array.isArray(c12.mandatory)?c12.mandatory.join(', '):(c12.mandatory||'—')}</dd></div>
      ${c12.optional&&c12.optional.length?`<div class="dl-row"><dt class="dl-lbl">Optional / allowed</dt><dd class="dl-val">${Array.isArray(c12.optional)?c12.optional.join(', '):c12.optional}</dd></div>`:''}
      <div class="dl-row"><dt class="dl-lbl">Class 12 marks required</dt><dd class="dl-val">${c12.minMarks12||'—'}</dd></div>
      ${c12.importantNote?`<div style="background:#EBF5FB;border:1px solid #AED6F1;border-radius:6px;padding:8px 10px;margin-top:6px;font-size:12px;color:#1A5276">📌 ${c12.importantNote}</div>`:''}
      ${c12.yearsValid?`<div class="dl-row"><dt class="dl-lbl">Years valid</dt><dd class="dl-val">${c12.yearsValid}</dd></div>`:''}
    </div>`;
  }

  // Graduation
  if (grad) {
    html += `<div style="border-left:3px solid #1A6640;margin:12px 0;padding-left:12px">
      <div style="font-size:12px;font-weight:800;color:#1A6640;font-family:'Plus Jakarta Sans',sans-serif;margin-bottom:6px">🎓 GRADUATION — Degree Requirements</div>
      <div class="dl-row"><dt class="dl-lbl">Degree required</dt><dd class="dl-val" style="font-weight:600">${grad.degreeRequired||'—'}</dd></div>
      <div class="dl-row"><dt class="dl-lbl">Minimum marks</dt><dd class="dl-val">${grad.minMarks||'—'}</dd></div>
      <div class="dl-row"><dt class="dl-lbl">Branch</dt><dd class="dl-val">${grad.branchRequired||'—'}</dd></div>
      <div class="dl-row"><dt class="dl-lbl">Final year allowed</dt><dd class="dl-val">${grad.finalYearAllowed?'Yes — provisional':'No — must be completed'}</dd></div>
      ${grad.finalYearNote?`<div style="font-size:12px;color:#7A5C4A;margin-top:4px">• ${grad.finalYearNote}</div>`:''}
      ${grad.cgpaNote?`<div class="dl-row"><dt class="dl-lbl">CGPA note</dt><dd class="dl-val">${grad.cgpaNote}</dd></div>`:''}
    </div>`;
  }

  return html || `<div class="dl-row"><dt class="dl-lbl">Eligibility</dt><dd class="dl-val">${e.eligibilityBasic||'See official notification'}</dd></div>`;
}

function stagesHTML(stages) {
  if (!stages||!stages.length) return '';
  return `<div style="margin:14px 0">
    <div style="font-size:12px;font-weight:800;color:#1C0D00;font-family:'Plus Jakarta Sans',sans-serif;margin-bottom:10px;text-transform:uppercase;letter-spacing:.06em">Step-by-Step Process</div>
    ${stages.map(s=>`
    <div style="display:flex;gap:12px;margin-bottom:12px">
      <div style="flex-shrink:0;width:28px;height:28px;border-radius:50%;background:#F05A0E;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;font-family:'Plus Jakarta Sans',sans-serif">${s.n}</div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:700;color:#1C0D00;font-family:'Plus Jakarta Sans',sans-serif">${s.name}</div>
        <div style="font-size:12px;color:#7A5C4A;margin-top:2px;line-height:1.6">${s.detail}</div>
      </div>
    </div>`).join('')}
  </div>`;
}

function timelineHTML(timeline) {
  if (!timeline||!timeline.length) return '';
  return `<div style="margin:14px 0">
    <div style="font-size:12px;font-weight:800;color:#1C0D00;font-family:'Plus Jakarta Sans',sans-serif;margin-bottom:10px;text-transform:uppercase;letter-spacing:.06em">📅 Month-wise Timeline (Approximate)</div>
    ${timeline.map((t,i)=>`
    <div style="display:flex;gap:12px;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid #FFF3EC">
      <div style="flex-shrink:0;min-width:130px;font-size:11px;font-weight:700;color:#F05A0E;font-family:'Plus Jakarta Sans',sans-serif;padding-top:1px">${t.month}</div>
      <div style="flex:1;font-size:12px;color:#3A1800;line-height:1.5">${t.activity}</div>
    </div>`).join('')}
  </div>`;
}

function examPatternHTML(ep) {
  if (!ep) return '';
  return `<div style="margin:14px 0;background:#FFF8F4;border:1px solid #FFD5BC;border-radius:9px;padding:14px">
    <div style="font-size:12px;font-weight:800;color:#1C0D00;font-family:'Plus Jakarta Sans',sans-serif;margin-bottom:10px;text-transform:uppercase;letter-spacing:.06em">📝 Exam Pattern</div>
    ${erow('Mode',ep.mode)}
    ${erow('Duration',ep.duration)}
    ${erow('Marking Scheme',ep.marking)}
    ${erow('Languages',ep.languages)}
    ${ep.papers&&ep.papers.length?`<div style="margin-top:8px">${ep.papers.map(p=>`
      <div style="background:#fff;border:1px solid #FFD5BC;border-radius:7px;padding:10px;margin-bottom:8px">
        <div style="font-size:12px;font-weight:700;color:#F05A0E;margin-bottom:4px;font-family:'Plus Jakarta Sans',sans-serif">${p.paper}</div>
        <div style="font-size:12px;color:#7A5C4A;line-height:1.5">${p.sections}</div>
        ${p.total?`<div style="font-size:11px;font-weight:600;color:#1C0D00;margin-top:4px">→ ${p.total}</div>`:''}
      </div>`).join('')}</div>`:''}
  </div>`;
}

function openExamModal(id) {
  const e = EXAM_MAP[id];
  if (!e) return;
  document.getElementById("mcl").textContent  = e.category||'';
  document.getElementById("mnm").textContent  = e.name;
  document.getElementById("mmt").textContent  = [e.conductedBy, e.ageLimit&&('Age: '+e.ageLimit), e.attemptsAllowed&&('Attempts: '+e.attemptsAllowed)].filter(Boolean).join(' | ');
  document.getElementById("mbdg").innerHTML   = (e.type==='govt'?`<span style="background:#2D7D4E;color:#fff;padding:2px 8px;border-radius:5px;font-size:11px;font-weight:700">Govt Job</span>`:`<span style="background:#1F618D;color:#fff;padding:2px 8px;border-radius:5px;font-size:11px;font-weight:700">Admission</span>`) + (e.hasDetail?` <span style="background:#FFF3EC;color:#7A3000;border:1px solid #FFD5BC;padding:2px 8px;border-radius:5px;font-size:11px;font-weight:700">Full details</span>`:'');
  document.getElementById("mdsc").textContent = e.forAdmissionTo||e.eligibilityBasic||'';
  document.getElementById("mmtr").innerHTML   = '';
  document.getElementById("mdl").innerHTML    =
    `<div style="font-size:12px;font-weight:800;color:#1C0D00;font-family:'Plus Jakarta Sans',sans-serif;margin:12px 0 6px;text-transform:uppercase;letter-spacing:.06em">🎯 What This Exam Is For</div>`+
    erow('For admission to', e.forAdmissionTo) +
    erow('Full name', e.fullName!==e.name?e.fullName:null) +
    erow('Conducted by', e.conductedBy) +
    erow('Frequency', e.frequency||e.examPatternBasic) +
    erow('Registration fee', e.fee) +
    erow('Official website', e.website||e.officialWebsite) +
    `<div style="font-size:12px;font-weight:800;color:#1C0D00;font-family:'Plus Jakarta Sans',sans-serif;margin:14px 0 6px;text-transform:uppercase;letter-spacing:.06em">✅ Eligibility — Complete Path</div>`+
    eligTree(e) +
    erow('Basic eligibility (from notification)', e.eligibilityBasic) +
    examPatternHTML(e.examPattern) +
    stagesHTML(e.stages) +
    timelineHTML(e.timeline) +
    (e.cutoff?`<div style="margin:14px 0;background:#FFF3EC;border:1px solid #FFD5BC;border-radius:9px;padding:12px"><div style="font-size:12px;font-weight:800;color:#F05A0E;margin-bottom:6px;font-family:'Plus Jakarta Sans',sans-serif">CUT-OFF / SELECTION CRITERIA</div><div style="font-size:13px;color:#3A1800;line-height:1.6">${e.cutoff}</div></div>`:'')+
    erow('After qualifying', e.afterQualifying||e.salary) +
    erow('Promotion path', e.promotionPath) +
    erow('Preparation time', e.prepTime) +
    (e.importantNotes?`<div style="margin:14px 0;background:#EBF5FB;border:1px solid #AED6F1;border-radius:9px;padding:12px"><div style="font-size:12px;font-weight:800;color:#1A5276;margin-bottom:6px;font-family:'Plus Jakarta Sans',sans-serif">IMPORTANT NOTES</div><div style="font-size:12px;color:#1A5276;line-height:1.6">${e.importantNotes}</div></div>`:'');
  document.getElementById("modal").style.display="flex";
  document.body.style.overflow="hidden";
}

// hook exam search into the main search bar when exam tab is active
const _origSearchListener = document.getElementById("srch").oninput;
document.getElementById("srch").addEventListener("input", function(ev) {
  if (state.tab === "exams") {
    examState.q = ev.target.value; examState.page=1; renderExamGrid();
    ev.stopImmediatePropagation && ev.stopImmediatePropagation();
  }
});
// ═══════════════════════════════════════════════════════════════════════════


// ═════════════════════════════════════════════
// CLUSTER ELIGIBILITY + COURSES + SKILLS DATA
// ═════════════════════════════════════════════
