/* ==================== COLOR / FONT / DATE CONFIG ====================
   Loaded at runtime from data/config.json so designers/devs can add new
   color themes, font pairings, date formats, or templates without
   touching any JavaScript. Falls back to an identical embedded copy if
   the file is opened directly (file://) instead of via a local server,
   since some browsers block fetch() for local files. */
let COLOR_THEMES = [];
let FONT_PAIRS = {};
let DATE_FORMATS = [];
let TEMPLATES = [];

const FALLBACK_CONFIG = {
  colorThemes: [
    {key:'navygold', name:'Navy & Gold', primary:'#0b2545', accent:'#c6a15b'},
    {key:'charcoalburgundy', name:'Charcoal & Burgundy', primary:'#2b2b2b', accent:'#8a2846'},
    {key:'forestcopper', name:'Forest & Copper', primary:'#1f3a2e', accent:'#b5651d'},
    {key:'slateteal', name:'Slate & Teal', primary:'#33475b', accent:'#1f9d8a'},
    {key:'maroongold', name:'Maroon & Gold', primary:'#5c1a1a', accent:'#c99b3f'},
    {key:'midnightsilver', name:'Midnight & Silver', primary:'#111827', accent:'#9ca3af'},
    {key:'custom', name:'Custom', primary:'#0b2545', accent:'#c6a15b'}
  ],
  fontPairs: {
    atsClassic:{head:"Georgia, 'Times New Roman', serif", body:"Arial, Helvetica, sans-serif", label:'ATS-Safe Classic (Georgia / Arial)', safe:true},
    atsModern:{head:"Arial, Helvetica, sans-serif", body:"Arial, Helvetica, sans-serif", label:'ATS-Safe Modern (Arial)', safe:true},
    corporateSerif:{head:"'PT Serif', Georgia, serif", body:"'Source Sans 3', Arial, sans-serif", label:'Corporate Serif', safe:false},
    elegantEditorial:{head:"'Playfair Display', Georgia, serif", body:"'Lora', Georgia, serif", label:'Elegant Editorial', safe:false},
    modernSans:{head:"'Poppins', Arial, sans-serif", body:"'Inter', Arial, sans-serif", label:'Modern Sans', safe:false},
    execSlab:{head:"'Roboto Slab', Georgia, serif", body:"'Source Sans 3', Arial, sans-serif", label:'Executive Slab', safe:false}
  },
  dateFormats: [
    {key:'mmmYYYY', label:'Jan 2024'},
    {key:'mmYYYY', label:'01/2024'},
    {key:'monthYYYY', label:'January 2024'},
    {key:'yearOnly', label:'2024'}
  ],
  templates: [
    {key:'classic', label:'Classic ATS', hint:'Strictest parsing', swatch:'t-classic'},
    {key:'modern', label:'Modern Navy', hint:'Header band', swatch:'t-modern'},
    {key:'minimal', label:'Minimal Gold', hint:'Airy & clean', swatch:'t-minimal'},
    {key:'executive', label:'Executive Serif', hint:'Centered, senior roles', swatch:'t-executive'},
    {key:'compact', label:'Compact', hint:'Fits more on 1 page', swatch:'t-compact'},
    {key:'bold', label:'Bold Header', hint:'Strong color band', swatch:'t-bold'},
    {key:'timeline', label:'Timeline', hint:'Connected milestones', swatch:'t-timeline'},
    {key:'sidebar', label:'Sidebar', hint:'Two column', swatch:'t-sidebar'}
  ]
};

async function loadConfig(){
  let cfg;
  try{
    const res = await fetch('data/config.json');
    if(!res.ok) throw new Error('bad response');
    cfg = await res.json();
  } catch(e){
    console.warn('Could not fetch data/config.json (likely opened via file:// without a local server). Using built-in fallback config instead.', e);
    cfg = FALLBACK_CONFIG;
  }
  COLOR_THEMES = cfg.colorThemes;
  FONT_PAIRS = cfg.fontPairs;
  DATE_FORMATS = cfg.dateFormats;
  TEMPLATES = cfg.templates;
}

/* ==================== DATA MODEL ==================== */
const state = {
  template: 'classic',
  settings: {colorTheme:'navygold', primary:'#0b2545', accent:'#c6a15b', fontPair:'atsClassic', lineHeight:1.5, paraGap:16, dateFormat:'mmmYYYY'},
  personal: {name:'Your Name', title:'Professional Title', email:'you@email.com', phone:'+91 00000 00000', location:'Jaipur, India', linkedin:'', portfolio:'', github:''},
  summary: '',
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  achievements: [],
  languages: [],
  publications: [],
  volunteer: [],
  references: [],
  hobbies: '',
  custom: [],
  visibility: {},

  misc: {
    photo:'', dob:'', nationality:'', maritalStatus:'', gender:'', guardianName:'',
    passport:'', visaStatus:'', drivingLicense:'',
    noticePeriod:'', expectedSalary:'', securityClearance:'',
    careerObjective:'', researchInterests:'', thesisTitle:'', extracurricular:'',
    declaration:'', includeSignatureLine:false, signaturePlace:''
  },
  internships: [],
  trainings: [],
  memberships: [],
  grants: [],
  teaching: [],
  conferences: [],
  patents: [],
  portfolioSamples: [],

  textFormat: {
    summary:'para', hobbies:'para', careerObjective:'para',
    researchInterests:'para', extracurricular:'para', declaration:'para'
  }
};

const SECTIONS = [
  {key:'personal', label:'Personal Info', type:'single'},
  {key:'summary', label:'Summary', type:'text'},
  {key:'experience', label:'Experience', type:'repeat', fields:[
    {k:'role',l:'Job Title'},{k:'company',l:'Company'},{k:'location',l:'Location'},
    {k:'start',l:'Start Date',type:'month'},{k:'end',l:'End Date',type:'month',presentToggle:true},
    {k:'desc',l:'Description (one bullet per line)',area:true}
  ]},
  {key:'education', label:'Education', type:'repeat', fields:[
    {k:'degree',l:'Degree / Course'},{k:'school',l:'Institute'},{k:'location',l:'Location'},
    {k:'start',l:'Start Date',type:'month'},{k:'end',l:'End Date',type:'month',presentToggle:true},
    {k:'score',l:'Grade / Score'},{k:'certLink',l:'Certificate / Verification Link (optional)'}
  ]},
  {key:'skills', label:'Skills', type:'repeat', fields:[
    {k:'category',l:'Category (e.g. Technical, Soft Skills)'},{k:'items',l:'Skills (comma separated)'}
  ]},
  {key:'projects', label:'Projects', type:'repeat', fields:[
    {k:'name',l:'Project Name'},{k:'link',l:'Link (optional)'},{k:'date',l:'Date',type:'month'},
    {k:'desc',l:'Description (one bullet per line)',area:true}
  ]},
  {key:'certifications', label:'Certifications', type:'repeat', fields:[
    {k:'name',l:'Certification'},{k:'issuer',l:'Issued By'},{k:'date',l:'Date',type:'month'},
    {k:'proofLink',l:'Certificate / Credential Link (optional)'}
  ]},
  {key:'achievements', label:'Achievements / Awards', type:'repeat', fields:[
    {k:'title',l:'Title'},{k:'desc',l:'Description'},{k:'date',l:'Date',type:'month'},
    {k:'proofLink',l:'Proof Link (optional)'}
  ]},
  {key:'languages', label:'Languages', type:'repeat', fields:[
    {k:'name',l:'Language'},{k:'level',l:'Proficiency (e.g. Native, Fluent)'}
  ]},
  {key:'publications', label:'Publications', type:'repeat', fields:[
    {k:'title',l:'Title'},{k:'publisher',l:'Publisher / Journal'},{k:'date',l:'Date',type:'month'},{k:'link',l:'Link (optional)'}
  ]},
  {key:'volunteer', label:'Volunteer Experience', type:'repeat', fields:[
    {k:'role',l:'Role'},{k:'org',l:'Organization'},{k:'start',l:'Start',type:'month'},{k:'end',l:'End',type:'month',presentToggle:true},
    {k:'desc',l:'Description',area:true}
  ]},
  {key:'references', label:'References', type:'repeat', fields:[
    {k:'name',l:'Name'},{k:'role',l:'Designation / Company'},{k:'contact',l:'Email / Phone'}
  ]},
  {key:'hobbies', label:'Hobbies & Interests', type:'text'},
  {key:'custom', label:'Custom Section', type:'repeat', fields:[
    {k:'heading',l:'Section Heading'},{k:'body',l:'Content',area:true}
  ]}
];
SECTIONS.forEach(s=>state.visibility[s.key]=true);

const MISC_REPEAT_GROUPS = [
  {key:'internships', label:'Internships', fields:[
    {k:'role',l:'Role'},{k:'company',l:'Company'},{k:'start',l:'Start',type:'month'},{k:'end',l:'End',type:'month',presentToggle:true},
    {k:'desc',l:'Description (one bullet per line)',area:true}
  ]},
  {key:'trainings', label:'Training / Workshops Attended', fields:[
    {k:'title',l:'Title'},{k:'organizer',l:'Organizer'},{k:'date',l:'Date',type:'month'},{k:'proofLink',l:'Certificate Link (optional)'}
  ]},
  {key:'memberships', label:'Professional Memberships / Affiliations', fields:[
    {k:'org',l:'Organization'},{k:'role',l:'Role / Membership Type'},{k:'since',l:'Since',type:'month'},{k:'proofLink',l:'Membership / Credential Link (optional)'}
  ]},
  {key:'grants', label:'Grants & Funding', fields:[
    {k:'title',l:'Title'},{k:'funder',l:'Funding Body'},{k:'amount',l:'Amount'},{k:'year',l:'Year',type:'number'},{k:'proofLink',l:'Reference Link (optional)'}
  ]},
  {key:'teaching', label:'Teaching Experience', fields:[
    {k:'course',l:'Course / Subject'},{k:'institute',l:'Institute'},{k:'period',l:'Period'}
  ]},
  {key:'conferences', label:'Conference Presentations', fields:[
    {k:'title',l:'Title'},{k:'conference',l:'Conference'},{k:'date',l:'Date',type:'month'},{k:'proofLink',l:'Link to Talk / Paper (optional)'}
  ]},
  {key:'patents', label:'Patents', fields:[
    {k:'title',l:'Title'},{k:'number',l:'Patent Number'},{k:'date',l:'Date',type:'month'},{k:'proofLink',l:'Patent Link (optional)'}
  ]},
  {key:'portfolioSamples', label:'Portfolio Work Samples', fields:[
    {k:'title',l:'Title'},{k:'link',l:'Link'}
  ]}
];

/* ==================== COLOR UTILITIES ==================== */
function hexToRgb(hex){
  hex=(hex||'#000000').replace('#','');
  if(hex.length===3) hex=hex.split('').map(c=>c+c).join('');
  const num=parseInt(hex,16)||0;
  return {r:(num>>16)&255,g:(num>>8)&255,b:num&255};
}
function rgbToHex(r,g,b){
  return '#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
}
function tint(hex,percent){
  const {r,g,b}=hexToRgb(hex); const p=percent/100;
  return rgbToHex(r+(255-r)*p, g+(255-g)*p, b+(255-b)*p);
}

/* ==================== DATE / LINK HELPERS ==================== */
const MONTH_ABBR=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTH_FULL=['January','February','March','April','May','June','July','August','September','October','November','December'];

function formatDate(raw){
  if(!raw) return '';
  const parts=raw.split('-');
  if(parts.length<2) return raw;
  const y=parts[0], mi=parseInt(parts[1],10)-1;
  switch(state.settings.dateFormat){
    case 'mmYYYY': return `${parts[1]}/${y}`;
    case 'monthYYYY': return `${MONTH_FULL[mi]||''} ${y}`.trim();
    case 'yearOnly': return y;
    default: return `${MONTH_ABBR[mi]||''} ${y}`.trim();
  }
}
function dateRange(entry, startKey, endKey){
  const s = entry[startKey] ? formatDate(entry[startKey]) : '';
  const isPresent = entry[endKey+'Present'];
  const e = isPresent ? 'Present' : (entry[endKey] ? formatDate(entry[endKey]) : '');
  if(s && e) return `${s} – ${e}`;
  return s || e || '';
}
function esc(s){return (s||'').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

function linkify(raw, label){
  if(!raw || !raw.toString().trim()) return '';
  let val=raw.toString().trim();
  let url=val;
  if(/@/.test(val) && !/^mailto:/i.test(val) && !/^https?:\/\//i.test(val)){
    url='mailto:'+val;
  } else if(!/^https?:\/\//i.test(val)){
    url='https://'+val.replace(/^\/+/,'');
  }
  const display = label || val;
  return `<a href="${url.replace(/"/g,'&quot;')}" target="_blank" rel="noopener" class="cv-link">${esc(display)}</a>`;
}
function bulletify(text){
  if(!text) return '';
  return text.split('\n').filter(l=>l.trim()).map(l=>'• '+esc(l.trim())).join('\n');
}
function formatBlock(text, formatKey){
  if(!text || !text.trim()) return '';
  if(state.textFormat[formatKey]==='bullets'){
    return `<div class="item-desc">${bulletify(text)}</div>`;
  }
  return `<p class="summary-text">${esc(text)}</p>`;
}

/* ==================== SETTINGS PANEL ==================== */
function buildThemeSwatches(){
  const host=document.getElementById('themeSwatches');
  host.innerHTML='';
  COLOR_THEMES.forEach(t=>{
    const d=document.createElement('div');
    d.className='theme-dot'+(state.settings.colorTheme===t.key?' active':'');
    d.title=t.name;
    if(t.key==='custom'){
      d.style.background='conic-gradient(#0b2545 0 50%, #c6a15b 50% 100%)';
    } else {
      d.style.background=`linear-gradient(135deg, ${t.primary} 0 55%, ${t.accent} 55% 100%)`;
    }
    d.addEventListener('click',()=>{
      state.settings.colorTheme=t.key;
      if(t.key!=='custom'){ state.settings.primary=t.primary; state.settings.accent=t.accent; }
      document.getElementById('customColorRow').style.display = t.key==='custom' ? 'grid' : 'none';
      document.getElementById('customPrimary').value=state.settings.primary;
      document.getElementById('customAccent').value=state.settings.accent;
      buildThemeSwatches();
      applySettings(); render();
    });
    host.appendChild(d);
  });
}

function buildFontSelect(){
  const sel=document.getElementById('fontSelect');
  sel.innerHTML='';
  Object.keys(FONT_PAIRS).forEach(k=>{
    const opt=document.createElement('option');
    opt.value=k; opt.textContent=FONT_PAIRS[k].label+(FONT_PAIRS[k].safe?' — Max ATS safety':'');
    sel.appendChild(opt);
  });
  sel.value=state.settings.fontPair;
  sel.addEventListener('change',()=>{ state.settings.fontPair=sel.value; applySettings(); render(); });
}

function buildDateFormatSelect(){
  const sel=document.getElementById('dateFormatSelect');
  sel.innerHTML='';
  DATE_FORMATS.forEach(d=>{
    const opt=document.createElement('option'); opt.value=d.key; opt.textContent=d.label;
    sel.appendChild(opt);
  });
  sel.value=state.settings.dateFormat;
  sel.addEventListener('change',()=>{ state.settings.dateFormat=sel.value; render(); });
}

function initSettingsUI(){
  buildThemeSwatches();
  buildFontSelect();
  buildDateFormatSelect();

  document.getElementById('customPrimary').value=state.settings.primary;
  document.getElementById('customAccent').value=state.settings.accent;
  document.getElementById('customPrimary').addEventListener('input',e=>{ state.settings.primary=e.target.value; applySettings(); render(); });
  document.getElementById('customAccent').addEventListener('input',e=>{ state.settings.accent=e.target.value; applySettings(); render(); });

  const ls=document.getElementById('lineSpacing'); ls.value=state.settings.lineHeight;
  document.getElementById('lineSpacingVal').textContent=state.settings.lineHeight;
  ls.addEventListener('input',()=>{ state.settings.lineHeight=parseFloat(ls.value); document.getElementById('lineSpacingVal').textContent=ls.value; applySettings(); });

  const ps=document.getElementById('paraSpacing'); ps.value=state.settings.paraGap;
  document.getElementById('paraSpacingVal').textContent=state.settings.paraGap+'px';
  ps.addEventListener('input',()=>{ state.settings.paraGap=parseInt(ps.value,10); document.getElementById('paraSpacingVal').textContent=ps.value+'px'; applySettings(); });
}

function applySettings(){
  const pg=document.getElementById('page');
  const s=state.settings;
  pg.style.setProperty('--c-primary', s.primary);
  pg.style.setProperty('--c-primary2', tint(s.primary,30));
  pg.style.setProperty('--c-accent', s.accent);
  pg.style.setProperty('--c-accent-light', tint(s.accent,75));
  pg.style.setProperty('--font-head', FONT_PAIRS[s.fontPair].head);
  pg.style.setProperty('--font-body', FONT_PAIRS[s.fontPair].body);
  pg.style.setProperty('--line-h', s.lineHeight);
  pg.style.setProperty('--para-gap', s.paraGap+'px');
}

/* ==================== TEMPLATE GRID ==================== */
function buildTemplateGrid(){
  const grid=document.getElementById('templateGrid');
  grid.innerHTML='';
  TEMPLATES.forEach(t=>{
    const c=document.createElement('div');
    c.className='tpl-card'+(state.template===t.key?' active':'');
    c.innerHTML=`<div class="swatch ${t.swatch}"></div><p>${t.label}</p><small>${t.hint}</small>`;
    c.addEventListener('click',()=>{ state.template=t.key; buildTemplateGrid(); render(); });
    grid.appendChild(c);
  });
}

/* ==================== ATS SCORE ==================== */
function computeATSScore(){
  let score=0; const tips=[];
  const p=state.personal;

  const contactFields=[p.name && p.name!=='Your Name' ? p.name : '', p.email, p.phone, p.location];
  const filled=contactFields.filter(v=>v && v.trim()).length;
  score += (filled/4)*15;
  if(filled<4) tips.push('Complete all core contact fields (name, email, phone, location).');

  const summaryText=(state.summary||'')+' '+(state.misc.careerObjective||'');
  if(summaryText.trim().length>=40) score+=10;
  else if(summaryText.trim().length>0){ score+=5; tips.push('Expand your Summary / Career Objective to a couple of full sentences.'); }
  else tips.push('Add a Professional Summary or Career Objective.');

  if(state.experience.length){
    score+=10;
    const hasBullets=state.experience.some(x=>(x.desc||'').split('\n').filter(l=>l.trim()).length>=2);
    if(hasBullets) score+=10;
    else { score+=4; tips.push('Add at least 2 bullet points describing impact/results under each role.'); }
  } else if(state.internships.length){
    score+=16;
    tips.push('Add full Work Experience once available — Internships are a good stand-in for now.');
  } else {
    tips.push('Add at least one Work Experience or Internship entry.');
  }

  if(state.education.length) score+=15;
  else tips.push('Add your Education details.');

  const skillCount=state.skills.reduce((sum,x)=>sum+(x.items||'').split(',').filter(s=>s.trim()).length,0);
  if(skillCount>=6) score+=15;
  else if(skillCount>0){ score+=(skillCount/6)*15; tips.push('List at least 6 relevant skills across your skill groups.'); }
  else tips.push('Add a Skills section — one of the most heavily scanned sections by ATS.');

  const twoColTemplates=['sidebar'];
  if(twoColTemplates.includes(state.template)){ score+=6; tips.push('Two-column layouts can trip up older ATS parsers — Classic/Modern/Minimal/Executive score higher.'); }
  else score+=10;

  if(FONT_PAIRS[state.settings.fontPair].safe) score+=5;
  else { score+=3; tips.push('Pick an "ATS-Safe" font pairing for maximum parsing compatibility.'); }

  const totalChars=JSON.stringify(state).length;
  if(totalChars>1400) score+=5;
  else if(totalChars>700){ score+=3; tips.push('Add a bit more detail — thin resumes score lower with recruiters and ATS alike.'); }
  else tips.push('Your CV looks quite short — fill in more sections for a stronger score.');

  if((p.linkedin||'').trim() || (p.portfolio||'').trim()) score+=5;
  else tips.push('Add a LinkedIn or portfolio link.');

  score=Math.max(0,Math.min(100,Math.round(score)));
  return {score,tips};
}

function renderATSPanel(){
  const {score,tips}=computeATSScore();
  const el=document.getElementById('atsPanel');
  const color = score>=90 ? '#1c8a4b' : score>=70 ? '#c48a1f' : '#c0392b';
  const msg = score>=90 ? 'Excellent — you\'re in great shape' : score>=70 ? 'Good — a few tweaks will push this to 90+' : 'Needs work to pass most ATS filters';
  el.innerHTML=`
    <div style="display:flex;align-items:center;gap:14px;">
      <div style="font-size:26px;font-weight:800;color:${color};">${score}%</div>
      <div style="flex:1;">
        <div style="height:8px;background:#eee;border-radius:5px;overflow:hidden;">
          <div style="height:100%;width:${score}%;background:${color};"></div>
        </div>
        <div style="font-size:10.5px;color:var(--muted);margin-top:4px;">${msg}</div>
      </div>
    </div>
    ${tips.length ? `<ul class="ats-tips">${tips.slice(0,4).map(t=>`<li>${esc(t)}</li>`).join('')}</ul>` : `<div style="margin-top:8px;font-size:11px;color:#1c8a4b;">✓ All key ATS checks passed.</div>`}
  `;
}

/* ==================== TABS ==================== */
const tabbar=document.getElementById('tabbar');
const formHost=document.getElementById('formHost');
let activeTab='personal';

SECTIONS.forEach(s=>{
  const b=document.createElement('button');
  b.textContent=s.label; b.dataset.key=s.key;
  b.addEventListener('click',()=>{activeTab=s.key;renderTabs();renderForm();});
  tabbar.appendChild(b);
});
const miscBtn=document.createElement('button');
miscBtn.textContent='Misc / Optional'; miscBtn.dataset.key='misc';
miscBtn.style.cssText='border-color:var(--gold);';
miscBtn.addEventListener('click',()=>{activeTab='misc';renderTabs();renderForm();});
tabbar.appendChild(miscBtn);

function renderTabs(){
  [...tabbar.children].forEach(b=>b.classList.toggle('active', b.dataset.key===activeTab));
}

/* ==================== FIELD BUILDERS ==================== */
function fieldRow(label, value, onInput, area=false){
  const wrap=document.createElement('div'); wrap.className='field';
  const lab=document.createElement('label'); lab.textContent=label; wrap.appendChild(lab);
  const el=document.createElement(area?'textarea':'input');
  el.value=value||''; el.addEventListener('input',e=>{onInput(e.target.value); render();});
  wrap.appendChild(el);
  return wrap;
}

function fieldRowFormatted(label, value, onInput, formatKey){
  const wrap=document.createElement('div'); wrap.className='field';
  const labelRow=document.createElement('div');
  labelRow.style.cssText='display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px;margin-bottom:3px;';
  const lab=document.createElement('label'); lab.textContent=label; lab.style.marginBottom='0';
  labelRow.appendChild(lab);
  const toggle=document.createElement('div'); toggle.style.cssText='display:flex;gap:4px;';
  ['para','bullets'].forEach(fmt=>{
    const btn=document.createElement('button'); btn.type='button';
    btn.textContent = fmt==='para' ? 'Paragraph' : 'Bullet points';
    const isActive=state.textFormat[formatKey]===fmt;
    btn.style.cssText='font-size:10px;padding:2px 8px;border-radius:10px;border:1px solid '+(isActive?'var(--navy)':'var(--line)')+';background:'+(isActive?'var(--navy)':'#fff')+';color:'+(isActive?'#fff':'var(--navy)')+';cursor:pointer;';
    btn.addEventListener('click',()=>{
      state.textFormat[formatKey]=fmt; render();
      if(activeTab==='misc') renderMiscForm(); else renderForm();
    });
    toggle.appendChild(btn);
  });
  labelRow.appendChild(toggle);
  wrap.appendChild(labelRow);
  const el=document.createElement('textarea');
  el.value=value||'';
  el.placeholder = state.textFormat[formatKey]==='bullets' ? 'One point per line — each line becomes a bullet' : 'Write in paragraph form';
  el.addEventListener('input', e=>{ onInput(e.target.value); render(); });
  wrap.appendChild(el);
  return wrap;
}

function fieldSmart(f, entry){
  if(f.type==='month'){
    const wrap=document.createElement('div'); wrap.className='field';
    const lab=document.createElement('label'); lab.textContent=f.l; wrap.appendChild(lab);
    const row=document.createElement('div'); row.style.cssText='display:flex;gap:8px;align-items:center;';
    const inp=document.createElement('input'); inp.type='month'; inp.value=entry[f.k]||'';
    inp.addEventListener('input',e=>{entry[f.k]=e.target.value; render();});
    if(f.presentToggle && entry[f.k+'Present']) inp.disabled=true;
    row.appendChild(inp);
    if(f.presentToggle){
      const presKey=f.k+'Present';
      const chkWrap=document.createElement('label'); chkWrap.style.cssText='font-size:10.5px;color:var(--muted);display:flex;align-items:center;gap:4px;white-space:nowrap;';
      const chk=document.createElement('input'); chk.type='checkbox'; chk.checked=!!entry[presKey];
      chk.addEventListener('change',()=>{ entry[presKey]=chk.checked; inp.disabled=chk.checked; render(); if(activeTab==='misc') renderMiscForm(); else renderForm(); });
      chkWrap.appendChild(chk); chkWrap.appendChild(document.createTextNode('Present'));
      row.appendChild(chkWrap);
    }
    wrap.appendChild(row);
    return wrap;
  }
  if(f.type==='number'){
    const wrap=document.createElement('div'); wrap.className='field';
    const lab=document.createElement('label'); lab.textContent=f.l; wrap.appendChild(lab);
    const inp=document.createElement('input'); inp.type='number'; inp.placeholder='YYYY'; inp.value=entry[f.k]||'';
    inp.addEventListener('input',e=>{entry[f.k]=e.target.value; render();});
    wrap.appendChild(inp);
    return wrap;
  }
  return fieldRow(f.l, entry[f.k], v=>entry[f.k]=v, !!f.area);
}

function sectionHeader(section){
  const h=document.createElement('h2');
  const span=document.createElement('span'); span.textContent=section.label;
  const visWrap=document.createElement('label'); visWrap.className='toggle-vis';
  const chk=document.createElement('input'); chk.type='checkbox'; chk.checked=state.visibility[section.key];
  chk.addEventListener('change',()=>{state.visibility[section.key]=chk.checked; render();});
  visWrap.appendChild(chk); visWrap.appendChild(document.createTextNode('show on CV'));
  h.appendChild(span); h.appendChild(visWrap);
  return h;
}

function buildRepeatBlock(cfg){
  const block=document.createElement('div'); block.className='section-block';
  const h=document.createElement('h2');
  h.innerHTML=`<span>${cfg.label}</span><span style="font-size:10px;color:var(--muted);font-weight:400;text-transform:none;letter-spacing:0;">optional</span>`;
  block.appendChild(h);
  state[cfg.key].forEach((entry,idx)=>{
    const e=document.createElement('div'); e.className='entry';
    const del=document.createElement('button'); del.className='del'; del.textContent='Remove';
    del.addEventListener('click',()=>{state[cfg.key].splice(idx,1); render(); renderMiscForm();});
    e.appendChild(del);
    cfg.fields.forEach(f=>{ e.appendChild(fieldSmart(f, entry)); });
    block.appendChild(e);
  });
  const addBtn=document.createElement('button'); addBtn.className='add-btn';
  addBtn.textContent='+ Add '+cfg.label.replace(/s$/,'');
  addBtn.addEventListener('click',()=>{
    const obj={}; cfg.fields.forEach(f=>obj[f.k]='');
    state[cfg.key].push(obj); render(); renderMiscForm();
  });
  block.appendChild(addBtn);
  return block;
}

function renderMiscForm(){
  formHost.innerHTML='';
  const note=document.createElement('p'); note.className='hint'; note.style.margin='0 0 12px';
  note.textContent='Everything below is optional and situational. Leave a field blank and it simply won\'t appear on your CV. Note: photo, date of birth, marital status, gender and nationality can trigger bias filters in many Western ATS systems — fill these in only if standard for the role/region you\'re applying to.';
  formHost.appendChild(note);

  const photoBlock=document.createElement('div'); photoBlock.className='section-block';
  photoBlock.innerHTML=`<h2><span>Photo</span></h2>`;
  const photoField=document.createElement('div'); photoField.className='field';
  const photoInput=document.createElement('input'); photoInput.type='file'; photoInput.accept='image/*';
  photoInput.addEventListener('change', e=>{
    const file=e.target.files[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=()=>{ state.misc.photo=reader.result; render(); renderMiscForm(); };
    reader.readAsDataURL(file);
  });
  photoField.appendChild(photoInput);
  photoBlock.appendChild(photoField);
  if(state.misc.photo){
    const prevImg=document.createElement('img'); prevImg.src=state.misc.photo;
    prevImg.style.cssText='width:60px;height:60px;object-fit:cover;border-radius:50%;margin-top:8px;display:block;';
    photoBlock.appendChild(prevImg);
    const rm=document.createElement('button'); rm.className='add-btn'; rm.style.marginTop='8px'; rm.textContent='Remove Photo';
    rm.addEventListener('click',()=>{state.misc.photo=''; render(); renderMiscForm();});
    photoBlock.appendChild(rm);
  }
  formHost.appendChild(photoBlock);

  const pd=document.createElement('div'); pd.className='section-block';
  pd.innerHTML=`<h2><span>Personal Details</span></h2>`;
  const pdGrid=document.createElement('div'); pdGrid.className='row2';
  [['dob','Date of Birth'],['nationality','Nationality'],['maritalStatus','Marital Status'],
   ['gender','Gender'],['guardianName',"Father's / Husband's Name"],['passport','Passport Number'],
   ['visaStatus','Visa Status / Work Authorization'],['drivingLicense','Driving License']
  ].forEach(([k,l])=>pdGrid.appendChild(fieldRow(l, state.misc[k], v=>state.misc[k]=v)));
  pd.appendChild(pdGrid);
  formHost.appendChild(pd);

  const co=document.createElement('div'); co.className='section-block';
  co.innerHTML=`<h2><span>Career Objective</span></h2>`;
  co.appendChild(fieldRowFormatted('Objective statement (mainly used by freshers, instead of/along with Summary)', state.misc.careerObjective, v=>state.misc.careerObjective=v, 'careerObjective'));
  formHost.appendChild(co);

  const ap=document.createElement('div'); ap.className='section-block';
  ap.innerHTML=`<h2><span>Job Application Details</span></h2>`;
  const apGrid=document.createElement('div'); apGrid.className='row2';
  apGrid.appendChild(fieldRow('Notice Period', state.misc.noticePeriod, v=>state.misc.noticePeriod=v));
  apGrid.appendChild(fieldRow('Expected Salary', state.misc.expectedSalary, v=>state.misc.expectedSalary=v));
  ap.appendChild(apGrid);
  ap.appendChild(fieldRow('Security Clearance (govt / defense roles)', state.misc.securityClearance, v=>state.misc.securityClearance=v));
  formHost.appendChild(ap);

  MISC_REPEAT_GROUPS.forEach(cfg=>formHost.appendChild(buildRepeatBlock(cfg)));

  const ac=document.createElement('div'); ac.className='section-block';
  ac.innerHTML=`<h2><span>Academic Extras</span></h2>`;
  ac.appendChild(fieldRowFormatted('Research Interests', state.misc.researchInterests, v=>state.misc.researchInterests=v, 'researchInterests'));
  ac.appendChild(fieldRow('Thesis Title', state.misc.thesisTitle, v=>state.misc.thesisTitle=v));
  formHost.appendChild(ac);

  const ex=document.createElement('div'); ex.className='section-block';
  ex.innerHTML=`<h2><span>Extracurricular Activities</span></h2>`;
  ex.appendChild(fieldRowFormatted('Sports, clubs, leadership roles, etc.', state.misc.extracurricular, v=>state.misc.extracurricular=v, 'extracurricular'));
  formHost.appendChild(ex);

  const dec=document.createElement('div'); dec.className='section-block';
  dec.innerHTML=`<h2><span>Declaration & Signature</span></h2>`;
  dec.appendChild(fieldRowFormatted('Declaration statement (common in Indian CVs)', state.misc.declaration, v=>state.misc.declaration=v, 'declaration'));
  const chkWrap=document.createElement('label'); chkWrap.style.cssText='display:flex;align-items:center;gap:6px;font-size:12px;margin-top:6px;';
  const chk=document.createElement('input'); chk.type='checkbox'; chk.checked=state.misc.includeSignatureLine;
  chk.addEventListener('change',()=>{state.misc.includeSignatureLine=chk.checked; render(); renderMiscForm();});
  chkWrap.appendChild(chk); chkWrap.appendChild(document.createTextNode('Include Place & Signature line'));
  dec.appendChild(chkWrap);
  if(state.misc.includeSignatureLine){
    dec.appendChild(fieldRow('Place', state.misc.signaturePlace, v=>state.misc.signaturePlace=v));
  }
  formHost.appendChild(dec);
}

function renderForm(){
  formHost.innerHTML='';
  if(activeTab==='misc'){ renderMiscForm(); return; }
  const section=SECTIONS.find(s=>s.key===activeTab);
  const block=document.createElement('div'); block.className='section-block';
  block.appendChild(sectionHeader(section));

  if(section.key==='personal'){
    const p=state.personal;
    const row=document.createElement('div'); row.className='row2';
    row.appendChild(fieldRow('Full Name', p.name, v=>p.name=v));
    row.appendChild(fieldRow('Professional Title', p.title, v=>p.title=v));
    block.appendChild(row);
    const row2=document.createElement('div'); row2.className='row2';
    row2.appendChild(fieldRow('Email', p.email, v=>p.email=v));
    row2.appendChild(fieldRow('Phone', p.phone, v=>p.phone=v));
    block.appendChild(row2);
    block.appendChild(fieldRow('Location (City, Country)', p.location, v=>p.location=v));
    const row3=document.createElement('div'); row3.className='row2';
    row3.appendChild(fieldRow('LinkedIn URL', p.linkedin, v=>p.linkedin=v));
    row3.appendChild(fieldRow('Portfolio / Website', p.portfolio, v=>p.portfolio=v));
    block.appendChild(row3);
    block.appendChild(fieldRow('GitHub / Other Link', p.github, v=>p.github=v));
  }
  else if(section.type==='text'){
    if(section.key==='summary'){
      block.appendChild(fieldRowFormatted('Write a 2-4 line professional summary', state.summary, v=>state.summary=v, 'summary'));
    } else {
      block.appendChild(fieldRowFormatted('List your hobbies / interests', state.hobbies, v=>state.hobbies=v, 'hobbies'));
    }
  }
  else if(section.type==='repeat'){
    state[section.key].forEach((entry,idx)=>{
      const e=document.createElement('div'); e.className='entry';
      const del=document.createElement('button'); del.className='del'; del.textContent='Remove';
      del.addEventListener('click',()=>{state[section.key].splice(idx,1); render(); renderForm();});
      e.appendChild(del);
      section.fields.forEach(f=>{ e.appendChild(fieldSmart(f, entry)); });
      block.appendChild(e);
    });
    const addBtn=document.createElement('button'); addBtn.className='add-btn';
    addBtn.textContent='+ Add '+section.label.replace(/s$/,'').replace('Skill','Skill Group');
    addBtn.addEventListener('click',()=>{
      const obj={}; section.fields.forEach(f=>obj[f.k]='');
      state[section.key].push(obj); render(); renderForm();
    });
    block.appendChild(addBtn);
  }
  formHost.appendChild(block);
}

/* ==================== PREVIEW RENDER ==================== */
const pageEl=document.getElementById('page');

function contactBits(p){
  const bits=[];
  if(p.email) bits.push(linkify(p.email));
  if(p.phone) bits.push(esc(p.phone));
  if(p.location) bits.push(esc(p.location));
  if(p.linkedin) bits.push(linkify(p.linkedin,'LinkedIn'));
  if(p.portfolio) bits.push(linkify(p.portfolio,'Portfolio'));
  if(p.github) bits.push(linkify(p.github,'GitHub'));
  return bits.map(b=>`<span>${b}</span>`).join('<span class="sep">|</span>');
}

function proofTag(url){
  return url && url.trim() ? `<div class="item-proof">${linkify(url,'View Certificate / Proof')}</div>` : '';
}

function miscHTML(){
  let out='';
  const m=state.misc;

  const pdPairs=[
    ['Date of Birth', m.dob],['Nationality', m.nationality],['Marital Status', m.maritalStatus],
    ['Gender', m.gender],["Father's / Husband's Name", m.guardianName],['Passport No.', m.passport],
    ['Visa / Work Authorization', m.visaStatus],['Driving License', m.drivingLicense],
    ['Notice Period', m.noticePeriod],['Expected Salary', m.expectedSalary],['Security Clearance', m.securityClearance]
  ].filter(([l,val])=>val && val.trim());
  if(pdPairs.length){
    out+=`<section class="block"><h3 class="sec-title">Additional Information</h3><div class="two-col">`+
      pdPairs.map(([l,val])=>`<div class="item-desc"><b>${esc(l)}:</b> ${esc(val)}</div>`).join('')+
      `</div></section>`;
  }

  if(m.careerObjective && m.careerObjective.trim()){
    out+=`<section class="block"><h3 class="sec-title">Career Objective</h3>${formatBlock(m.careerObjective,'careerObjective')}</section>`;
  }

  if(state.internships.length){
    out+=`<section class="block"><h3 class="sec-title">Internships</h3>`+state.internships.map(x=>
      `<div class="item"><div class="item-head"><div><span class="item-title">${esc(x.role)}</span>${x.company?' — <span class="item-sub">'+esc(x.company)+'</span>':''}</div><span class="item-date">${dateRange(x,'start','end')}</span></div><div class="item-desc">${bulletify(x.desc)}</div></div>`
    ).join('')+`</section>`;
  }

  if(state.trainings.length){
    out+=`<section class="block"><h3 class="sec-title">Training &amp; Workshops</h3>`+state.trainings.map(x=>
      `<div class="item"><div class="item-head"><span class="item-title">${esc(x.title)}</span><span class="item-date">${formatDate(x.date)}</span></div>${x.organizer?'<div class="item-desc">'+esc(x.organizer)+'</div>':''}${proofTag(x.proofLink)}</div>`
    ).join('')+`</section>`;
  }

  if(state.memberships.length){
    out+=`<section class="block"><h3 class="sec-title">Professional Memberships</h3>`+state.memberships.map(x=>
      `<div class="item"><div class="item-head"><span class="item-title">${esc(x.org)}</span><span class="item-date">${formatDate(x.since)}</span></div>${x.role?'<div class="item-desc">'+esc(x.role)+'</div>':''}${proofTag(x.proofLink)}</div>`
    ).join('')+`</section>`;
  }

  if(m.researchInterests && m.researchInterests.trim()){
    out+=`<section class="block"><h3 class="sec-title">Research Interests</h3>${formatBlock(m.researchInterests,'researchInterests')}</section>`;
  }
  if(m.thesisTitle && m.thesisTitle.trim()){
    out+=`<section class="block"><h3 class="sec-title">Thesis</h3><p class="summary-text">${esc(m.thesisTitle)}</p></section>`;
  }

  if(state.grants.length){
    out+=`<section class="block"><h3 class="sec-title">Grants &amp; Funding</h3>`+state.grants.map(x=>
      `<div class="item"><div class="item-head"><span class="item-title">${esc(x.title)}</span><span class="item-date">${esc(x.year)}</span></div><div class="item-desc">${[x.funder,x.amount].filter(Boolean).map(v=>esc(v)).join(' | ')}</div>${proofTag(x.proofLink)}</div>`
    ).join('')+`</section>`;
  }

  if(state.teaching.length){
    out+=`<section class="block"><h3 class="sec-title">Teaching Experience</h3>`+state.teaching.map(x=>
      `<div class="item"><div class="item-head"><span class="item-title">${esc(x.course)}</span><span class="item-date">${esc(x.period)}</span></div>${x.institute?'<div class="item-desc">'+esc(x.institute)+'</div>':''}</div>`
    ).join('')+`</section>`;
  }

  if(state.conferences.length){
    out+=`<section class="block"><h3 class="sec-title">Conference Presentations</h3>`+state.conferences.map(x=>
      `<div class="item"><div class="item-head"><span class="item-title">${esc(x.title)}</span><span class="item-date">${formatDate(x.date)}</span></div>${x.conference?'<div class="item-desc">'+esc(x.conference)+'</div>':''}${proofTag(x.proofLink)}</div>`
    ).join('')+`</section>`;
  }

  if(state.patents.length){
    out+=`<section class="block"><h3 class="sec-title">Patents</h3>`+state.patents.map(x=>
      `<div class="item"><div class="item-head"><span class="item-title">${esc(x.title)}</span><span class="item-date">${formatDate(x.date)}</span></div>${x.number?'<div class="item-desc">Patent No. '+esc(x.number)+'</div>':''}${proofTag(x.proofLink)}</div>`
    ).join('')+`</section>`;
  }

  if(m.extracurricular && m.extracurricular.trim()){
    out+=`<section class="block"><h3 class="sec-title">Extracurricular Activities</h3>${formatBlock(m.extracurricular,'extracurricular')}</section>`;
  }

  if(state.portfolioSamples.length){
    out+=`<section class="block"><h3 class="sec-title">Portfolio Work Samples</h3><div class="two-col">`+state.portfolioSamples.map(x=>
      `<div class="item-desc"><b>${esc(x.title)}</b>${x.link?' — '+linkify(x.link,'View'):''}</div>`
    ).join('')+`</div></section>`;
  }

  if(m.declaration && m.declaration.trim()){
    out+=`<section class="block"><h3 class="sec-title">Declaration</h3>${formatBlock(m.declaration,'declaration')}`;
    if(m.includeSignatureLine){
      out+=`<div class="item-desc" style="margin-top:14px;display:flex;justify-content:space-between;"><span>Place: ${esc(m.signaturePlace||'_____________')}</span><span>Signature: _____________</span></div>`;
    }
    out+=`</section>`;
  } else if(m.includeSignatureLine){
    out+=`<section class="block"><div class="item-desc" style="margin-top:14px;display:flex;justify-content:space-between;"><span>Place: ${esc(m.signaturePlace||'_____________')}</span><span>Signature: _____________</span></div></section>`;
  }

  return out;
}

function sectionsHTML(){
  let out='';
  const v=state.visibility;

  if(v.summary && state.summary.trim()){
    out+=`<section class="block"><h3 class="sec-title">Professional Summary</h3>${formatBlock(state.summary,'summary')}</section>`;
  }

  if(v.experience && state.experience.length){
    out+=`<section class="block"><h3 class="sec-title">Experience</h3>`;
    state.experience.forEach(x=>{
      out+=`<div class="item"><div class="item-head"><div><span class="item-title">${esc(x.role)}</span>${x.company?' — <span class="item-sub">'+esc(x.company)+'</span>':''}</div><span class="item-date">${dateRange(x,'start','end')}${x.location?' | '+esc(x.location):''}</span></div><div class="item-desc">${bulletify(x.desc)}</div></div>`;
    });
    out+=`</section>`;
  }

  if(v.education && state.education.length){
    out+=`<section class="block"><h3 class="sec-title">Education</h3>`;
    state.education.forEach(x=>{
      out+=`<div class="item"><div class="item-head"><div><span class="item-title">${esc(x.degree)}</span>${x.school?' — <span class="item-sub">'+esc(x.school)+'</span>':''}</div><span class="item-date">${dateRange(x,'start','end')}</span></div>${(x.location||x.score)?'<div class="item-desc">'+[x.location,x.score?('Score: '+x.score):''].filter(Boolean).map(v=>esc(v)).join(' | ')+'</div>':''}${proofTag(x.certLink)}</div>`;
    });
    out+=`</section>`;
  }

  if(v.skills && state.skills.length){
    out+=`<section class="block"><h3 class="sec-title">Skills</h3>`;
    state.skills.forEach(x=>{
      const chips=(x.items||'').split(',').map(s=>s.trim()).filter(Boolean).map(s=>`<span class="tag">${esc(s)}</span>`).join('');
      out+=`<div class="item"><div class="item-sub" style="margin-bottom:5px;">${esc(x.category)}</div><div class="tags">${chips}</div></div>`;
    });
    out+=`</section>`;
  }

  if(v.projects && state.projects.length){
    out+=`<section class="block"><h3 class="sec-title">Projects</h3>`;
    state.projects.forEach(x=>{
      out+=`<div class="item"><div class="item-head"><span class="item-title">${esc(x.name)}${x.link?' ('+linkify(x.link,'View Project')+')':''}</span><span class="item-date">${formatDate(x.date)}</span></div><div class="item-desc">${bulletify(x.desc)}</div></div>`;
    });
    out+=`</section>`;
  }

  if(v.certifications && state.certifications.length){
    out+=`<section class="block"><h3 class="sec-title">Certifications</h3>`;
    state.certifications.forEach(x=>{
      out+=`<div class="item"><div class="item-head"><span class="item-title">${esc(x.name)}${x.issuer?' — <span class="item-sub">'+esc(x.issuer)+'</span>':''}</span><span class="item-date">${formatDate(x.date)}</span></div>${proofTag(x.proofLink)}</div>`;
    });
    out+=`</section>`;
  }

  if(v.achievements && state.achievements.length){
    out+=`<section class="block"><h3 class="sec-title">Achievements &amp; Awards</h3>`;
    state.achievements.forEach(x=>{
      out+=`<div class="item"><div class="item-head"><span class="item-title">${esc(x.title)}</span><span class="item-date">${formatDate(x.date)}</span></div>${x.desc?'<div class="item-desc">'+esc(x.desc)+'</div>':''}${proofTag(x.proofLink)}</div>`;
    });
    out+=`</section>`;
  }

  if(v.languages && state.languages.length){
    out+=`<section class="block"><h3 class="sec-title">Languages</h3><div class="two-col">`;
    state.languages.forEach(x=>{
      out+=`<div class="item-desc"><b>${esc(x.name)}</b>${x.level?' — '+esc(x.level):''}</div>`;
    });
    out+=`</div></section>`;
  }

  if(v.publications && state.publications.length){
    out+=`<section class="block"><h3 class="sec-title">Publications</h3>`;
    state.publications.forEach(x=>{
      out+=`<div class="item"><div class="item-head"><span class="item-title">${esc(x.title)}</span><span class="item-date">${formatDate(x.date)}</span></div><div class="item-desc">${[x.publisher?esc(x.publisher):'', x.link?linkify(x.link,'View'):''].filter(Boolean).join(' | ')}</div></div>`;
    });
    out+=`</section>`;
  }

  if(v.volunteer && state.volunteer.length){
    out+=`<section class="block"><h3 class="sec-title">Volunteer Experience</h3>`;
    state.volunteer.forEach(x=>{
      out+=`<div class="item"><div class="item-head"><div><span class="item-title">${esc(x.role)}</span>${x.org?' — <span class="item-sub">'+esc(x.org)+'</span>':''}</div><span class="item-date">${dateRange(x,'start','end')}</span></div><div class="item-desc">${bulletify(x.desc)}</div></div>`;
    });
    out+=`</section>`;
  }

  if(v.custom && state.custom.length){
    state.custom.forEach(x=>{
      if(!x.heading && !x.body) return;
      out+=`<section class="block"><h3 class="sec-title">${esc(x.heading||'Additional Information')}</h3><div class="item-desc">${bulletify(x.body)}</div></section>`;
    });
  }

  if(v.hobbies && state.hobbies.trim()){
    out+=`<section class="block"><h3 class="sec-title">Hobbies &amp; Interests</h3>${formatBlock(state.hobbies,'hobbies')}</section>`;
  }

  if(v.references && state.references.length){
    out+=`<section class="block"><h3 class="sec-title">References</h3><div class="two-col">`;
    state.references.forEach(x=>{
      out+=`<div class="item-desc"><b>${esc(x.name)}</b><br>${esc(x.role)}<br>${esc(x.contact)}</div>`;
    });
    out+=`</div></section>`;
  }

  out+=miscHTML();
  return out;
}

function render(){
  renderATSPanel();
  applySettings();

  const p=state.personal;
  const tpl=state.template;
  document.querySelector('.app').className='app tpl-'+tpl;

  const photoTag = state.misc.photo ? `<img src="${state.misc.photo}" alt="photo" style="width:84px;height:84px;border-radius:50%;object-fit:cover;border:2px solid var(--c-accent);flex-shrink:0;">` : '';
  const headerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:18px;">
      <div style="flex:1;">
        <h1 class="name">${esc(p.name||'Your Name')}</h1>
        <div class="title-line">${esc(p.title||'')}</div>
        <div class="contact-line">${contactBits(p)}</div>
      </div>
      ${photoTag}
    </div>
  `;

  if(tpl==='modern' || tpl==='bold'){
    pageEl.innerHTML = `<div class="head-band">${headerHTML}</div><div class="body-pad">${sectionsHTML()}</div>`;
  } else if(tpl==='sidebar'){
    const sideBits=[];
    if(state.misc.photo){
      sideBits.push(`<img src="${state.misc.photo}" alt="photo" style="width:96px;height:96px;border-radius:50%;object-fit:cover;border:2px solid var(--c-accent);margin-bottom:14px;display:block;">`);
    }
    sideBits.push(`<h1 class="name">${esc(p.name||'Your Name')}</h1><div class="title-line">${esc(p.title||'')}</div>`);
    const contactList=[p.email?linkify(p.email):'',p.phone?esc(p.phone):'',p.location?esc(p.location):'',p.linkedin?linkify(p.linkedin,'LinkedIn'):'',p.portfolio?linkify(p.portfolio,'Portfolio'):'',p.github?linkify(p.github,'GitHub'):''].filter(Boolean);
    sideBits.push(`<div class="contact-line" style="margin-top:14px;">${contactList.map(c=>`<span>${c}</span>`).join('')}</div>`);
    if(state.visibility.skills && state.skills.length){
      sideBits.push(`<section class="block" style="margin-top:20px;"><h3 class="sec-title">Skills</h3>`+state.skills.map(x=>{
        const chips=(x.items||'').split(',').map(s=>s.trim()).filter(Boolean).map(s=>`<span class="tag">${esc(s)}</span>`).join('');
        return `<div class="item"><div class="item-sub" style="margin-bottom:5px;">${esc(x.category)}</div><div class="tags">${chips}</div></div>`;
      }).join('')+`</section>`);
    }
    if(state.visibility.languages && state.languages.length){
      sideBits.push(`<section class="block"><h3 class="sec-title">Languages</h3>`+state.languages.map(x=>`<div class="item-desc">${esc(x.name)}${x.level?' — '+esc(x.level):''}</div>`).join('')+`</section>`);
    }
    if(state.visibility.certifications && state.certifications.length){
      sideBits.push(`<section class="block"><h3 class="sec-title">Certifications</h3>`+state.certifications.map(x=>`<div class="item-desc">${esc(x.name)}${x.issuer?' — '+esc(x.issuer):''}${proofTag(x.proofLink)}</div>`).join('')+`</section>`);
    }
    if(state.visibility.hobbies && state.hobbies.trim()){
      sideBits.push(`<section class="block"><h3 class="sec-title">Interests</h3>${formatBlock(state.hobbies,'hobbies')}</section>`);
    }

    const oldVis=Object.assign({},state.visibility);
    state.visibility.skills=false; state.visibility.languages=false; state.visibility.certifications=false; state.visibility.hobbies=false;
    const mainHTML = sectionsHTML();
    state.visibility=oldVis;

    pageEl.innerHTML=`<div class="side">${sideBits.join('')}</div><div class="main">${mainHTML}</div>`;
  } else {
    pageEl.innerHTML = headerHTML + sectionsHTML();
  }
}

async function bootstrap(){
  await loadConfig();
  initSettingsUI();
  buildTemplateGrid();
  renderTabs();
  renderForm();
  render();
}
bootstrap();
