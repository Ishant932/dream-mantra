
if (new URLSearchParams(location.search).get('embed') === '1') {
  document.documentElement.classList.add('embed-mode');
  document.addEventListener('DOMContentLoaded', function () {
    document.body.classList.add('embed-mode');
  });
}

/* ═══════════════════════════════════════════════════════════════════
   CAREER LIBRARY v2 — app.js
   Clean, career-first, student-friendly
═══════════════════════════════════════════════════════════════════ */

// ── DATA SETUP ──────────────────────────────────────────────────────────────
var ALL_CAREERS   = (D.careers   || []).concat(D.future || [], D.universal || []);
var CAREER_MAP    = {};
ALL_CAREERS.forEach(function(c){ CAREER_MAP[c.id] = c; });

// Derive unique values for filters
function uniq(arr) { return [...new Set(arr.filter(Boolean))].sort(); }

var ALL_STREAMS  = uniq(ALL_CAREERS.flatMap(function(c){ return c.streams||[]; }));
var ALL_CLUSTERS = uniq(ALL_CAREERS.map(function(c){ return c.cluster||c.domain||''; }));
var ALL_LEVELS   = uniq(ALL_CAREERS.map(function(c){ return c.level||''; }));
var ALL_TYPES    = uniq(ALL_CAREERS.map(function(c){ return c.degreeType||''; }));

// ── CLUSTER → COLOR CLASS ────────────────────────────────────────────────────
function clusterClass(cluster) {
  var cl = (cluster||'').toLowerCase();
  if (cl.includes('engineer') || cl.includes('information tech') || cl.includes('artificial') || cl.includes('software') || cl.includes('data') || cl.includes('aviation')) return 'cc-tech';
  if (cl.includes('health') || cl.includes('medical') || cl.includes('nurs') || cl.includes('pharma')) return 'cc-health';
  if (cl.includes('agri') || cl.includes('food') || cl.includes('horticult') || cl.includes('dairy')) return 'cc-agri';
  if (cl.includes('sport') || cl.includes('fitness')) return 'cc-sport';
  if (cl.includes('finance') || cl.includes('banking') || cl.includes('account') || cl.includes('insurance')) return 'cc-finance';
  if (cl.includes('management') || cl.includes('business') || cl.includes('market') || cl.includes('hr')) return 'cc-biz';
  if (cl.includes('legal') || cl.includes('law') || cl.includes('govern') || cl.includes('public')) return 'cc-law';
  if (cl.includes('hospit') || cl.includes('tourism') || cl.includes('hotel') || cl.includes('travel')) return 'cc-hosp';
  if (cl.includes('educat') || cl.includes('teach')) return 'cc-edu';
  if (cl.includes('design') || cl.includes('media') || cl.includes('art') || cl.includes('fashion') || cl.includes('film')) return 'cc-design';
  if (cl.includes('science') || cl.includes('research') || cl.includes('environment')) return 'cc-sci';
  if (cl.includes('defence') || cl.includes('defense') || cl.includes('armed') || cl.includes('military')) return 'cc-def';
  return 'cc-other';
}
function clusterDot(cluster) {
  var map = { 'cc-tech':'#3B82F6','cc-health':'#16A34A','cc-biz':'#D97706',
    'cc-law':'#7C3AED','cc-design':'#DB2777','cc-sci':'#0891B2','cc-def':'#1B2A4A',
    'cc-agri':'#65A30D','cc-sport':'#CA8A04','cc-finance':'#0F766E','cc-hosp':'#EA580C','cc-edu':'#7C3AED','cc-other':'#9A9390' };
  return map[clusterClass(cluster)] || '#9A9390';
}
function clusterSticker(cluster) {
  var map = { 'cc-tech':'💻','cc-health':'🏥','cc-biz':'💼',
    'cc-law':'⚖️','cc-design':'🎨','cc-sci':'🔬','cc-def':'🛡️',
    'cc-agri':'🌾','cc-sport':'🏅','cc-finance':'📈','cc-hosp':'🏨','cc-edu':'📚','cc-other':'📌' };
  return map[clusterClass(cluster)] || '📌';
}
function safeClusterElig(cluster) {
  try {
    var map = (typeof CLUSTER_ELIG !== 'undefined' && CLUSTER_ELIG) ? CLUSTER_ELIG : {};
    if (typeof clusterLookup === 'function') return clusterLookup(map, cluster) || null;
    if (!cluster) return null;
    var cl = String(cluster).toLowerCase();
    var keys = Object.keys(map);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var part = key.toLowerCase().split('&')[0].trim();
      if (cl.indexOf(part) !== -1 || part.indexOf(cl.split('&')[0].trim()) !== -1) return map[key];
    }
    return map['Multidisciplinary / Professional'] || null;
  } catch (err) {
    return null;
  }
}

// ── CATEGORY QUICK-FILTER GROUPS ─────────────────────────────────────────────
var QUICK_CATS = [
  { id:'tech',   label:'Technology',   fn: function(c){ var cl=(c.cluster||'').toLowerCase(); return cl.includes('engineer')||cl.includes('tech')||cl.includes('artificial')||cl.includes('data')||cl.includes('software')||cl.includes('aviation'); }},
  { id:'health', label:'Healthcare',   fn: function(c){ var cl=(c.cluster||'').toLowerCase(); return cl.includes('health')||cl.includes('medical')||cl.includes('nurs')||cl.includes('pharma'); }},
  { id:'biz',    label:'Business',     fn: function(c){ var cl=(c.cluster||'').toLowerCase(); return cl.includes('management')||cl.includes('business')||cl.includes('market')||cl.includes('hr'); }},
  { id:'finance',label:'Finance',      fn: function(c){ var cl=(c.cluster||'').toLowerCase(); return cl.includes('finance')||cl.includes('banking')||cl.includes('account')||cl.includes('insurance'); }},
  { id:'creative',label:'Creative',    fn: function(c){ var cl=(c.cluster||'').toLowerCase(); return cl.includes('design')||cl.includes('media')||cl.includes('art')||cl.includes('fashion')||cl.includes('film'); }},
  { id:'science',label:'Science',      fn: function(c){ var cl=(c.cluster||'').toLowerCase(); return cl.includes('science')||cl.includes('research')||cl.includes('environment'); }},
  { id:'edu',    label:'Education',    fn: function(c){ var cl=(c.cluster||'').toLowerCase(); var n=(c.name||'').toLowerCase(); return cl.includes('educat')||cl.includes('teach')||n.includes('teacher')||n.includes('professor'); }},
  { id:'govt',   label:'Govt / Law',   fn: function(c){ var cl=(c.cluster||'').toLowerCase(); return cl.includes('legal')||cl.includes('law')||cl.includes('public')||cl.includes('civil service')||cl.includes('govern'); }},
  { id:'defence',label:'Defence',      fn: function(c){ var cl=(c.cluster||'').toLowerCase(); return cl.includes('defence')||cl.includes('defense')||cl.includes('armed')||cl.includes('military'); }},
  { id:'agri',   label:'Agriculture',  fn: function(c){ var cl=(c.cluster||'').toLowerCase(); return cl.includes('agri')||cl.includes('food')||cl.includes('dairy')||cl.includes('horticult'); }},
  { id:'hospitality',label:'Hospitality', fn: function(c){ var cl=(c.cluster||'').toLowerCase(); return cl.includes('hospit')||cl.includes('tourism')||cl.includes('hotel')||cl.includes('travel'); }},
  { id:'sports', label:'Sports',       fn: function(c){ var cl=(c.cluster||'').toLowerCase(); return cl.includes('sport')||cl.includes('fitness')||cl.includes('physical education'); }},
];

// ── STATE ────────────────────────────────────────────────────────────────────
var state = {
  q: '',
  stream: '',
  cluster: '',
  level: '',
  type: '',
  quickCat: 'tech',
  sort: 'rel',
  page: 1,
  tab: 'careers',   // 'careers' | 'exams' | 'streams'
};
var PAGE_SIZE = 60;

// ── SEARCH + FILTER ──────────────────────────────────────────────────────────
function scoreCareer(c, ql) {
  if (!ql) return 1;
  var name    = (c.name||'').toLowerCase();
  var desc    = (c.description||c.whatYouStudy||'').toLowerCase();
  var cluster = (c.cluster||c.domain||'').toLowerCase();
  var skills  = ((c.skills||[]).join(' ')).toLowerCase();
  var careers = ((c.topCareers||[]).join(' ')).toLowerCase();
  
  if (name === ql) return 1000;
  if (name.startsWith(ql)) return 800;
  if (name.includes(ql)) return 600;
  if (careers.includes(ql)) return 100;
  if (cluster.includes(ql)) return 60;
  if (desc.includes(ql)) return 40;
  if (skills.includes(ql)) return 20;
  return 0;
}

function applyFilters() {
  var ql = state.q.toLowerCase().trim();
  var results = ALL_CAREERS.filter(function(c) {
    if (state.stream  && !(c.streams||[]).includes(state.stream))         return false;
    if (state.cluster && (c.cluster||c.domain||'')!==state.cluster)       return false;
    if (state.level   && (c.level||'')!==state.level)                     return false;
    if (state.type    && (c.degreeType||'')!==state.type)                 return false;
    if (state.quickCat) {
      var qc = QUICK_CATS.find(function(x){ return x.id===state.quickCat; });
      if (qc && !qc.fn(c)) return false;
    }
    if (ql) {
      var sc = scoreCareer(c, ql);
      c._score = sc;
      return sc > 0;
    }
    c._score = 0;
    return true;
  });

  if (ql) {
    results.sort(function(a,b){ return b._score - a._score; });
  } else if (state.sort === 'demand') {
    var order = ['Very High','High','Medium','Low'];
    results.sort(function(a,b){ return order.indexOf(a.industryDemand||'') - order.indexOf(b.industryDemand||''); });
  } else if (state.sort === 'az') {
    results.sort(function(a,b){ return a.name.localeCompare(b.name); });
  } else if (state.sort === 'salary') {
    results.sort(function(a,b){
      var as = parseFloat((a.salaryMid||'0').replace(/[^0-9.]/g,'')) || 0;
      var bs = parseFloat((b.salaryMid||'0').replace(/[^0-9.]/g,'')) || 0;
      return bs - as;
    });
  }
  return results;
}

// ── RENDER CAREER CARD ───────────────────────────────────────────────────────
function renderCard(c) {
  var cc    = clusterClass(c.cluster||c.domain||'');
  var dot   = clusterDot(c.cluster||c.domain||'');
  var desc  = c.description || c.whatYouStudy || 'A professional career path with strong prospects.';
  var demand= c.industryDemand || c.futureDemand || '';
  var demCls= demand==='Very High'?'tag-demand-vh':demand==='High'?'tag-demand-h':'';
  var salEntry = c.salaryEntry || '';
  var typeLabel= c.degreeType || '';
  var lvl  = c.level || '';

  return '<button class="card '+cc+'" type="button" data-career-id="'+escH(c.id)+'" aria-label="'+escH(c.name)+'">'
    + '<span class="card-sticker" aria-hidden="true">'+clusterSticker(c.cluster||c.domain||'')+'</span>'
    + '<div class="card-cluster"><span class="cluster-dot" style="background:'+dot+'"></span>'+escH(c.cluster||c.domain||'Career')+'</div>'
    + '<div class="card-name">'+escH(c.name)+'</div>'
    + '<div class="card-desc">'+escH(desc)+'</div>'
    + '<div class="card-footer">'
    +   '<div class="card-tags">'
    +     (typeLabel ? '<span class="tag">'+escH(typeLabel)+'</span>' : '')
    +     (demand    ? '<span class="tag '+demCls+'">'+escH(demand)+' demand</span>' : '')
    +     (salEntry  ? '<span class="tag">'+escH(salEntry)+'</span>' : '')
    +   '</div>'
    +   '<span class="card-cta">Explore →</span>'
    + '</div>'
    + '</button>';
}

// ── RENDER GRID ──────────────────────────────────────────────────────────────
var _filtered = [];

function renderGrid() {
  _filtered = applyFilters();
  var grid  = document.getElementById('career-grid');
  var empty = document.getElementById('empty-state');
  var count = document.getElementById('result-count');
  var loadW = document.getElementById('load-wrap');

  count.innerHTML = _filtered.length
    ? '<strong>'+_filtered.length.toLocaleString()+'</strong> career'+(+_filtered.length!==1?'s':'')+' found'
    : '';

  if (!_filtered.length) {
    grid.innerHTML  = '';
    empty.style.display = 'block';
    loadW.style.display = 'none';
    return;
  }
  empty.style.display = 'none';

  var slice = _filtered.slice(0, state.page * PAGE_SIZE);
  grid.innerHTML = slice.map(renderCard).join('');
  loadW.style.display = slice.length < _filtered.length ? 'block' : 'none';
}

// ── POPULATE SELECTS ─────────────────────────────────────────────────────────
function fillSelect(el, values) {
  if (!el) return;
  values.forEach(function(s) {
    var o = document.createElement('option'); o.value = s; o.textContent = s;
    el.appendChild(o);
  });
}

function buildSelects() {
  fillSelect(document.getElementById('f-stream'), ALL_STREAMS);
  fillSelect(document.getElementById('f-cluster'), ALL_CLUSTERS);
  fillSelect(document.getElementById('f-level'), ALL_LEVELS);
  fillSelect(document.getElementById('f-type'), ALL_TYPES);
  enhanceSelects();
}

function enhanceSelects() {
  ['f-stream', 'f-cluster', 'f-level', 'f-type'].forEach(function(id) {
    var sel = document.getElementById(id);
    if (!sel || sel.dataset.enhanced === '1') return;
    sel.dataset.enhanced = '1';
    sel.classList.add('filter-dd__native');
    var wrap = document.createElement('div');
    wrap.className = 'filter-dd';
    sel.parentNode.insertBefore(wrap, sel);
    wrap.appendChild(sel);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'f-select filter-dd__btn';
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].textContent : 'Select';

    var menu = document.createElement('div');
    menu.className = 'filter-dd__menu';
    menu.setAttribute('role', 'listbox');

    function rebuildMenu() {
      menu.innerHTML = '';
      Array.prototype.forEach.call(sel.options, function(opt) {
        var item = document.createElement('button');
        item.type = 'button';
        item.className = 'filter-dd__opt' + (opt.value === sel.value ? ' is-active' : '');
        item.textContent = opt.textContent;
        item.addEventListener('click', function(e) {
          e.stopPropagation();
          sel.value = opt.value;
          sel.dispatchEvent(new Event('change', { bubbles: true }));
          btn.textContent = opt.textContent;
          wrap.classList.remove('is-open');
          btn.setAttribute('aria-expanded', 'false');
        });
        menu.appendChild(item);
      });
    }
    rebuildMenu();
    wrap.appendChild(btn);
    wrap.appendChild(menu);

    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var willOpen = !wrap.classList.contains('is-open');
      document.querySelectorAll('.filter-dd.is-open').forEach(function(other) {
        other.classList.remove('is-open');
        var b = other.querySelector('.filter-dd__btn');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
      wrap.classList.toggle('is-open', willOpen);
      btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
    sel.addEventListener('change', function() {
      var opt = sel.options[sel.selectedIndex];
      btn.textContent = opt ? opt.textContent : 'Select';
      btn.classList.toggle('active', !!sel.value);
      rebuildMenu();
    });
  });
  document.addEventListener('click', function() {
    document.querySelectorAll('.filter-dd.is-open').forEach(function(w) {
      w.classList.remove('is-open');
      var b = w.querySelector('.filter-dd__btn');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  });
}

// ── UPDATE CLEAR BUTTON ──────────────────────────────────────────────────────
function updateClearBtn() {
  var hasFilter = state.q||state.stream||state.cluster||state.level||state.type||state.quickCat;
  document.getElementById('clear-all').classList.toggle('visible', !!hasFilter);
}

// ── FILTER EVENTS ─────────────────────────────────────────────────────────────
function initFilters() {
  var searchEl = document.getElementById('search');
  var clearBtn = document.getElementById('search-clear');
  var clearAll = document.getElementById('clear-all');
  var sortSel  = document.getElementById('sort-sel');
  var fStream  = document.getElementById('f-stream');
  var fCluster = document.getElementById('f-cluster');
  var fLevel   = document.getElementById('f-level');
  var fType    = document.getElementById('f-type');

  var _t = null;
  searchEl.addEventListener('input', function() {
    state.q = searchEl.value;
    clearBtn.classList.toggle('visible', !!state.q);
    state.page = 1;
    clearTimeout(_t);
    _t = setTimeout(function(){ renderGrid(); updateClearBtn(); }, 180);
  });
  clearBtn.addEventListener('click', function() {
    searchEl.value = ''; state.q = ''; state.page = 1;
    clearBtn.classList.remove('visible');
    renderGrid(); updateClearBtn();
  });
  clearAll.addEventListener('click', clearFilters);

  [fStream, fCluster, fLevel, fType].forEach(function(sel) {
    if (!sel) return;
    sel.addEventListener('change', function() {
      if (sel.id==='f-stream')  state.stream  = sel.value;
      if (sel.id==='f-cluster') state.cluster = sel.value;
      if (sel.id==='f-level')   state.level   = sel.value;
      if (sel.id==='f-type')    state.type    = sel.value;
      sel.classList.toggle('active', !!sel.value);
      state.page = 1;
      renderGrid(); updateClearBtn();
    });
  });

  sortSel.addEventListener('change', function(){ state.sort = sortSel.value; state.page=1; renderGrid(); });

  // Quick cat chips
  document.querySelectorAll('.cat-chip').forEach(function(chip) {
    if (chip.dataset.cat === state.quickCat) chip.classList.add('active');
    chip.addEventListener('click', function() {
      var id = chip.dataset.cat;
      if (state.quickCat === id) { state.quickCat = ''; chip.classList.remove('active'); }
      else {
        document.querySelectorAll('.cat-chip').forEach(function(c){ c.classList.remove('active'); });
        state.quickCat = id; chip.classList.add('active');
      }
      state.page = 1; renderGrid(); updateClearBtn();
    });
  });

  // Load more
  document.getElementById('load-more').addEventListener('click', function() {
    state.page++; renderGrid();
    window.scrollTo({ top: document.getElementById('career-grid').offsetHeight, behavior: 'smooth' });
  });

  // Empty state clear
  document.getElementById('empty-clear').addEventListener('click', clearFilters);
}

function clearFilters() {
  state.q=''; state.stream=''; state.cluster=''; state.level=''; state.type=''; state.quickCat='';
  document.getElementById('search').value = '';
  document.getElementById('search-clear').classList.remove('visible');
  document.querySelectorAll('.f-select').forEach(function(s){ s.value=''; s.classList.remove('active'); });
  document.querySelectorAll('.cat-chip').forEach(function(c){ c.classList.remove('active'); });
  state.page = 1; renderGrid(); updateClearBtn();
}

// ── STATS ────────────────────────────────────────────────────────────────────
function renderStats() {
  var specs = [
    [D.careers.length.toLocaleString(), 'Careers'],
    [D.future.length, 'Future careers'],
    [D.universal.length, 'Any-stream paths'],
    [(D.exams||EXAMS||[]).length, 'Entrance exams'],
    ['22', 'Career clusters'],
  ];
  document.getElementById('stats-strip').innerHTML = specs.map(function(s) {
    return '<div class="stat-item"><div class="stat-num">'+s[0]+'</div><div class="stat-lbl">'+s[1]+'</div></div>';
  }).join('');
}

// ── CAREER DETAIL MODAL ──────────────────────────────────────────────────────
function escH(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function openCareer(id) {
  var c = CAREER_MAP[id];
  if (!c) return;
  try {
    renderCareerModal(c);
  } catch (err) {
    console.error('Career modal failed', err);
  }
}

function renderCareerModal(c) {

  var cluster = c.cluster || c.domain || '';
  var demand  = c.industryDemand || c.futureDemand || 'Medium';
  var desc    = c.description || c.whatYouStudy || '';
  var skills  = c.skills || [];
  var salEntry= c.salaryEntry || '';
  var salMid  = c.salaryMid   || '';
  var salSen  = c.salarySenior|| '';

  // Hero
  var hero = '<div class="m-hero">'
    + '<button class="modal-close" onclick="closeCareer()">✕</button>'
    + '<div class="m-breadcrumb">'+escH(cluster)+(c.streams&&c.streams.length?' <span>·</span> '+escH(c.streams[0]):'')+'</div>'
    + '<div class="m-title">'+escH(c.name)+'</div>'
    + (desc ? '<div class="m-desc">'+escH(desc)+'</div>' : '')
    + '</div>';

  // Snapshot
  var snap = '<div class="m-snapshot">'
    + '<div class="snap-item"><div class="snap-lbl">Qualification</div><div class="snap-val">'+escH(c.degreeType||'Degree')+'</div></div>'
    + '<div class="snap-item"><div class="snap-lbl">Entry salary</div><div class="snap-val green">'+escH(salEntry||'Varies')+'</div></div>'
    + '<div class="snap-item"><div class="snap-lbl">Industry demand</div><div class="snap-val '+(demand==='Very High'||demand==='High'?'green':'orange')+'">'+escH(demand)+'</div></div>'
    + '</div>';

  var body = '<div class="m-body">';

  // What they do
  var doText = c.typicalDay || c.workEnvironment || '';
  if (doText) {
    body += '<div class="m-section">'
      + '<div class="m-sec-title">What you\'ll do</div>'
      + '<div class="m-text">'+escH(doText)+'</div>'
      + '</div>';
  }

  // Skills
  if (skills.length) {
    body += '<div class="m-section">'
      + '<div class="m-sec-title">Skills you\'ll need</div>'
      + '<div class="skill-chips">'+skills.map(function(s){ return '<span class="skill-chip">'+escH(s)+'</span>'; }).join('')+'</div>'
      + '</div>';
  }

  // Education path from CLUSTER_ELIG
  var ep = safeClusterElig(cluster);
  if (ep || c.eligibility) {
    body += '<div class="m-section"><div class="m-sec-title">Education path</div><div class="edu-path">';
    if (ep) {
      if (ep.c10_maths) {
        body += '<div class="edu-step">'
          + '<div class="edu-dot edu-dot-10">10</div>'
          + '<div class="edu-content"><div class="edu-stage">Class 10</div>'
          + '<div class="edu-detail">'+escH(ep.c10_sci||'Science')+'</div>'
          + (ep.c10_maths.includes('MANDATORY')?'<div class="edu-tip">⚠️ Standard Mathematics is mandatory for this path</div>':'')
          + '</div></div>';
      }
      if (ep.c12_stream) {
        body += '<div class="edu-step">'
          + '<div class="edu-dot edu-dot-12">12</div>'
          + '<div class="edu-content"><div class="edu-stage">Class 11–12</div>'
          + '<div class="edu-detail">'+escH(ep.c12_stream)+'</div>'
          + (ep.c12_tip?'<div class="edu-tip">'+escH(ep.c12_tip)+'</div>':'')
          + '</div></div>';
      }
      if (ep.grad) {
        body += '<div class="edu-step">'
          + '<div class="edu-dot edu-dot-g">UG</div>'
          + '<div class="edu-content"><div class="edu-stage">Graduation</div>'
          + '<div class="edu-detail">'+escH(ep.grad)+'</div>'
          + '</div></div>';
      }
      if (ep.pg) {
        body += '<div class="edu-step">'
          + '<div class="edu-dot edu-dot-pg">PG</div>'
          + '<div class="edu-content"><div class="edu-stage">Postgraduate</div>'
          + '<div class="edu-detail">'+escH(ep.pg)+'</div>'
          + '</div></div>';
      }
    } else if (c.eligibility) {
      body += '<div class="edu-step">'
        + '<div class="edu-dot edu-dot-g">↓</div>'
        + '<div class="edu-content"><div class="edu-detail">'+escH(c.eligibility)+'</div></div>'
        + '</div>';
    }
    body += '</div></div>';
  }

  // Salaries
  if (salEntry || salMid || salSen) {
    body += '<div class="m-section">'
      + '<div class="m-sec-title">Salary range</div>'
      + '<div class="sal-grid">'
      + (salEntry?'<div class="sal-item"><div class="sal-lbl">Entry</div><div class="sal-val">'+escH(salEntry)+'</div></div>':'')
      + (salMid  ?'<div class="sal-item"><div class="sal-lbl">Mid-career</div><div class="sal-val">'+escH(salMid)+'</div></div>':'')
      + (salSen  ?'<div class="sal-item"><div class="sal-lbl">Senior</div><div class="sal-val">'+escH(salSen)+'</div></div>':'')
      + '</div></div>';
  }

  // Outlook
  var hasOutlook = c.futureOutlook || c.progressionPath || c.govtOpportunities || c.remoteWork;
  if (hasOutlook) {
    body += '<div class="m-section"><div class="m-sec-title">Career outlook</div><div class="outlook-row">';
    if (c.futureOutlook)     body += '<div class="outlook-item"><div class="outlook-lbl">Future outlook</div><div class="outlook-val">'+escH(c.futureOutlook)+'</div></div>';
    if (c.govtOpportunities) body += '<div class="outlook-item"><div class="outlook-lbl">Govt opportunities</div><div class="outlook-val">'+escH(c.govtOpportunities)+'</div></div>';
    if (c.remoteWork)        body += '<div class="outlook-item"><div class="outlook-lbl">Remote work</div><div class="outlook-val">'+escH(c.remoteWork)+'</div></div>';
    if (c.progressionPath)   body += '<div class="outlook-item"><div class="outlook-lbl">Progression</div><div class="outlook-val">'+escH(c.progressionPath)+'</div></div>';
    body += '</div></div>';
  }

  // Personality fit (kept — not RIASEC/MBTI)
  if (c.personalityFit) {
    body += '<div class="m-section">'
      + '<div class="m-sec-title">Who thrives here</div>'
      + '<div class="m-text">'+escH(c.personalityFit)+'</div>'
      + (c.multipleIntelligence?'<div style="margin-top:8px;font-size:12px;color:var(--muted)">Intelligence type: <strong style="color:#3A3028">'+escH(c.multipleIntelligence)+'</strong></div>':'')
      + '</div>';
  }

  // Related careers
  var related = (c.relatedDegrees||c.alternativeDegrees||c.similarDegrees||[]).slice(0,6);
  if (related.length) {
    body += '<div class="m-section"><div class="m-sec-title">Related careers</div><div class="related-grid">';
    related.forEach(function(name) {
      // Try to find the career
      var rel = ALL_CAREERS.find(function(x){ return x.name===name; });
      if (rel) {
        body += '<button class="rel-card" type="button" data-career-id="'+escH(rel.id)+'">'
          + '<div class="rel-name">'+escH(rel.name)+'</div>'
          + '<div class="rel-type">'+escH(rel.degreeType||rel.cluster||'')+'</div>'
          + '</button>';
      } else {
        body += '<div class="rel-card"><div class="rel-name">'+escH(name)+'</div></div>';
      }
    });
    body += '</div></div>';
  }

  body += '</div>'; // m-body

  document.getElementById('modal-content').innerHTML = hero + snap + body;
  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCareer() {
  var overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

window.openCareer = openCareer;
window.closeCareer = closeCareer;

// ── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  buildSelects();
  initFilters();
  renderStats();
  renderGrid();
  updateClearBtn();

  var grid = document.getElementById('career-grid');
  if (grid) {
    grid.addEventListener('click', function(e) {
      var btn = e.target.closest('[data-career-id]');
      if (!btn) return;
      e.preventDefault();
      openCareer(btn.getAttribute('data-career-id'));
    });
  }

  var overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target.closest('.modal-close')) {
        closeCareer();
        return;
      }
      var rel = e.target.closest('[data-career-id]');
      if (rel) {
        e.preventDefault();
        openCareer(rel.getAttribute('data-career-id'));
        return;
      }
      if (e.target === overlay) closeCareer();
    });
  }
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeCareer();
  });
});
