// Dream Mantra Career Library — Subjects, Streams, Tabs metadata

const SUBJ_MAP  = D.subjectMap;
const STREAM_MAP= D.streamMap;

const DEMAND_ORDER = ["Very High","High","Medium","Low"];
const PAGE = 60;

// ── TABS ────────────────────────────────────────────────────────────────────
const TABS = [
  {id:"all",      label:"All Pathways",    data:CAREERS,   hasGrid:true,  hasFilters:true},
  {id:"bach",     label:"Bachelor's",      data:BACHELORS, hasGrid:true,  hasFilters:true},
  {id:"masters",  label:"Master's",        data:MASTERS,   hasGrid:true,  hasFilters:true},
  {id:"phd",      label:"PhD",             data:PHDS,      hasGrid:true,  hasFilters:true},
  {id:"diploma",  label:"Diploma / Cert",  data:DIPLOMAS,  hasGrid:true,  hasFilters:true},
  {id:"future",   label:"Future Careers",  data:FUTURE,    hasGrid:true,  hasFilters:false},
  {id:"universal",label:"Any Stream",      data:UNIVERSAL, hasGrid:true,  hasFilters:false},
  {id:"subjects", label:"Subjects",        data:null,      hasGrid:false, hasFilters:false},
  {id:"streams",  label:"Streams",         data:null,      hasGrid:false, hasFilters:false},
  {id:"exams",   label:"All Exams",       data:null,      hasGrid:false, hasFilters:false},
];

// ── STATE ───────────────────────────────────────────────────────────────────
