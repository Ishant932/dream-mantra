/** Title-aware career copy — keeps section headings same, body unique per role. */

function t(title) {
  return String(title || '').trim();
}

function lower(title) {
  return t(title).toLowerCase();
}

function match(title, patterns) {
  const s = lower(title);
  return patterns.some((p) => (p instanceof RegExp ? p.test(s) : s.includes(p)));
}

export function roleDayInLife(title, category, tier) {
  const base = t(title);
  if (match(base, [/doctor|surgeon|physician|mbbs|cardio|neuro|pediatr|gynec|dermat|ophthal|dentist|anesth/])) {
    return `Morning OPD or ward rounds as ${base}, reviewing patient histories and investigations. Mid-day: procedures, consultations, or emergency cases. Afternoon: documentation, interdisciplinary meetings, and mentoring junior residents. On-call nights are common in hospitals.`;
  }
  if (match(base, [/nurse|paramedic|pharm/])) {
    return `${base} shifts start with handover, medication administration, and patient monitoring. You coordinate with doctors, maintain charts, and support families. Work is shift-based in hospitals, clinics, or community health programmes.`;
  }
  if (match(base, [/software|developer|full stack|devops|cloud|cyber|blockchain|mobile app|game dev/])) {
    return `A ${base} typically begins with stand-up, reviewing tickets, and pairing on features. You write and review code, debug production issues, and collaborate with product/design. Remote or hybrid work is common in Indian IT hubs.`;
  }
  if (match(base, [/data sc|machine learning|ai engineer|analyst/])) {
    return `${base} work involves cleaning datasets, building models, and presenting insights to stakeholders. You experiment in notebooks, deploy pipelines, and document findings for business or research teams.`;
  }
  if (match(base, [/chartered account|auditor|tax |finance|bank|actuary|investment/])) {
    return `${base} professionals analyse financial statements, prepare returns, audit books, or advise clients on investments. Peak seasons (March closing, audit cycles) mean longer hours; otherwise structured office schedules.`;
  }
  if (match(base, [/lawyer|legal|advocate|judge|prosecutor/])) {
    return `${base} days mix court appearances, client meetings, legal research, and drafting petitions or contracts. Deadlines around hearings drive the rhythm; chambers or corporate legal teams set the environment.`;
  }
  if (match(base, [/ias|ips|ifs|irs|collector|civil services/])) {
    return `${base} officers handle administration, field inspections, policy implementation, and public grievances. Days vary between desk work, travel to districts, and coordination with state departments.`;
  }
  if (match(base, [/teacher|professor|faculty|tutor|educator/])) {
    return `${base} prepares lessons, delivers classes, assesses students, and mentors learners. Parent meetings, exam duty, and curriculum planning fill non-teaching hours. Academic calendars shape the year.`;
  }
  if (match(base, [/chef|pastry|hotel|hospitality|flight attendant|tour guide/])) {
    return `${base} work is service-oriented — prep, guest interaction, quality checks, and team coordination. Shifts include weekends and festivals; customer satisfaction is the daily metric.`;
  }
  if (match(base, [/pilot|aviation/])) {
    return `${base} follows strict pre-flight checks, cockpit procedures, and regulatory logs. Schedules include layovers; fitness and simulator training are ongoing requirements.`;
  }
  if (match(base, [/journalist|anchor|editor|content creator|copywriter|pr |public relations/])) {
    return `${base} researches stories, interviews sources, writes or records pieces, and meets publishing deadlines. Newsrooms and digital teams run on fast turnarounds and trending topics.`;
  }
  if (match(base, [/designer|architect|animator|photographer|illustrator|ux |ui /])) {
    return `${base} balances creative briefs, client feedback, and production deadlines. Studio or agency work mixes solo design time with review sessions and vendor coordination.`;
  }
  if (match(base, [/scientist|research|biologist|chemist|physicist|microbio|genetic/])) {
    return `${base} designs experiments, collects data in labs or field sites, analyses results, and writes reports or papers. Grant deadlines and peer review shape project timelines.`;
  }
  if (match(base, [/army|navy|air force|nda|defence|police|crpf|firefighter/])) {
    return `${base} training and duty include physical drills, operations planning, patrols, and discipline routines. Postings may be field-based with structured hierarchy and service protocols.`;
  }
  if (match(base, [/electrician|plumber|welder|carpenter|technician|hvac|mechanic/])) {
    return `${base} travels to sites, diagnoses issues, installs or repairs equipment, and maintains safety standards. Work is hands-on with tools; self-employment or contractor models are common.`;
  }
  if (match(base, [/marketing|sales|business development|hr |human resource/])) {
    return `${base} plans campaigns or pipelines, meets clients, tracks KPIs, and coordinates with product or operations teams. Target-driven roles with quarterly goals are typical.`;
  }
  if (tier === 'senior') {
    return `Senior ${base} leads teams, sets priorities, reviews deliverables, and represents the function in leadership meetings — balancing strategy with hands-on decisions.`;
  }
  const env = category.includes('Medical') ? 'hospitals and clinics'
    : category.includes('Engineering') || category.includes('IT') ? 'tech offices and hybrid setups'
      : category.includes('Defence') ? 'bases and field postings'
        : 'offices, sites, or client locations';
  return `As ${base}, you handle role-specific tasks, coordinate with colleagues, and report progress to supervisors. Typical settings: ${env} across Indian metros and tier-2 cities.`;
}

export function roleResponsibilities(title, category, tier, id) {
  const base = t(title);
  const extras = [
    `Maintain quality standards expected of ${base} professionals in India`,
    `Stay updated on regulations and best practices in ${category.split(' ')[0]}`,
    `Document work and communicate clearly with supervisors and clients`,
  ];
  if (match(base, [/software|developer|engineer/])) {
    return [
      `Design, build, and maintain software systems as ${base}`,
      'Write clean code, unit tests, and participate in code reviews',
      'Collaborate with product managers and QA on releases',
      id % 2 ? 'Optimise performance, security, and scalability' : 'Deploy via CI/CD and monitor production health',
      ...extras.slice(0, 1),
    ];
  }
  if (match(base, [/doctor|surgeon|physician/])) {
    return [
      `Diagnose and treat patients as ${base}`,
      'Prescribe evidence-based treatment plans',
      'Coordinate with nursing, lab, and radiology teams',
      'Maintain medical records and ethical practice',
      'Guide patients and families on recovery and prevention',
    ];
  }
  if (match(base, [/chartered account|auditor/])) {
    return [
      `Prepare and audit financial statements for ${base} engagements`,
      'Ensure GST, income tax, and Companies Act compliance',
      'Advise clients on tax planning and internal controls',
      'Lead audit teams during busy season',
    ];
  }
  if (match(base, [/teacher|professor/])) {
    return [
      `Deliver curriculum-aligned instruction as ${base}`,
      'Assess student learning and provide feedback',
      'Develop lesson plans and learning materials',
      'Participate in school/college committees and events',
    ];
  }
  if (tier === 'senior') {
    return [
      `Lead and mentor juniors in ${base} workflows`,
      'Own team KPIs, hiring, and performance reviews',
      'Align department goals with organisational strategy',
      pick(['Manage budgets and vendor relationships', 'Drive process improvement initiatives'], id),
    ];
  }
  return [
    `Execute core duties of ${base} with accuracy and timelines`,
    'Collaborate with cross-functional teams',
    pick(['Analyse data and prepare reports', 'Manage projects end-to-end', 'Support senior staff on key deliverables'], id),
    pick(['Research industry trends', 'Train new joiners', 'Improve operational efficiency'], id + 1),
    extras[id % extras.length],
  ];
}

export function roleHardSkills(title, category) {
  const base = lower(title);
  if (/software|developer|full stack/.test(base)) return ['Programming (Java/Python/JS)', 'Data structures & algorithms', 'Git & version control', 'APIs & databases', 'Cloud basics (AWS/Azure)'];
  if (/data sc|machine learning|ai/.test(base)) return ['Python/R & SQL', 'Statistics & ML libraries', 'Data visualisation', 'Model deployment', 'Experiment tracking'];
  if (/doctor|surgeon|mbbs/.test(base)) return ['Clinical examination', 'Diagnosis & treatment protocols', 'Medical documentation', 'Emergency care', 'Patient communication'];
  if (/chartered account|auditor/.test(base)) return ['Accounting standards (Ind AS)', 'Taxation & GST', 'Audit procedures', 'Tally/SAP/Excel advanced', 'Financial analysis'];
  if (/lawyer|legal/.test(base)) return ['Legal research', 'Drafting & pleadings', 'Contract law', 'Court procedure', 'Case management'];
  if (/teacher|professor/.test(base)) return ['Curriculum design', 'Classroom management', 'Assessment design', 'EdTech tools', 'Subject mastery'];
  if (/chef|culinary/.test(base)) return ['Menu planning', 'Food safety (FSSAI)', 'Kitchen operations', 'Cost control', 'Cuisine techniques'];
  if (/designer|ux|ui/.test(base)) return ['Figma/Adobe Creative Suite', 'Visual design principles', 'Prototyping', 'Design systems', 'User research basics'];
  if (/electrician|technician/.test(base)) return ['Electrical safety codes', 'Wiring & troubleshooting', 'Tool handling', 'Blueprint reading', 'Preventive maintenance'];
  if (category.includes('Medical')) return ['Clinical skills', 'Diagnostics', 'Patient care', 'Medical ethics', 'Health informatics'];
  if (category.includes('Engineering')) return ['Technical design', 'CAD/simulation tools', 'Quality standards', 'Project documentation', 'Safety compliance'];
  return [`${t(title)} domain techniques`, 'Industry software/tools', 'Regulatory awareness', 'Technical reporting'];
}

export function roleTools(title, category) {
  const base = lower(title);
  if (/software|developer/.test(base)) return ['VS Code / IntelliJ', 'GitHub / GitLab', 'Jira / Linear', 'Docker & Kubernetes', 'Postman / Swagger'];
  if (/data sc|analyst/.test(base)) return ['Python / Jupyter', 'SQL & BigQuery', 'Power BI / Tableau', 'Excel advanced', 'dbt / Airflow'];
  if (/doctor|hospital|nurse/.test(base)) return ['Hospital EMR/HIS', 'Diagnostic equipment', 'PACS/imaging systems', 'Telemedicine platforms'];
  if (/chartered account|finance/.test(base)) return ['Tally Prime', 'SAP FICO', 'Excel & Power Query', 'ClearTax / GST portals', 'Audit management tools'];
  if (/designer|graphic/.test(base)) return ['Figma', 'Adobe Illustrator', 'Photoshop', 'Canva Pro', 'Prototyping tools'];
  if (/journalist|content/.test(base)) return ['CMS platforms', 'SEO tools', 'Social schedulers', 'Video editing suites', 'Analytics dashboards'];
  return ['Microsoft 365 / Google Workspace', `${category.split(' ')[0]} industry software`, 'Collaboration & PM tools'];
}

export function roleCertifications(title, category, id) {
  const base = lower(title);
  if (/software|cloud|devops/.test(base)) return pickSet(id, [
    ['AWS Solutions Architect', 'Google Professional Cloud', 'Kubernetes CKA'],
    ['Microsoft Azure Administrator', 'Scrum Master (PSM)', 'Oracle Java certification'],
  ]);
  if (/chartered account/.test(base)) return ['CA (ICAI)', 'CPA (USA) optional', 'DipIFRS'];
  if (/doctor|surgeon/.test(base)) return ['NEET PG qualification', 'Specialty board (MD/MS)', 'ACLS/BLS training'];
  if (/lawyer/.test(base)) return ['Bar Council enrolment', 'LLM (optional)', 'Corporate law diplomas (NUJS/ILI)'];
  if (/teacher/.test(base)) return ['B.Ed / D.El.Ed', 'CTET / State TET', 'Subject-specific NET/SET for higher ed'];
  return pickSet(id, [
    ['Sector skill council (NSDC) certificate', 'ISO-aligned quality training'],
    ['NASSCOM / sector certification', 'Coursera/edX professional certificate'],
  ]);
}

export function roleInternshipPath(title, category, tier) {
  const base = t(title);
  if (tier !== 'entry') return null;
  if (match(base, [/software|developer/])) return `Apply for ${base} internships from 2nd year B.Tech/BCA via LinkedIn, Instahyre, and campus drives — build a GitHub portfolio with 2–3 projects.`;
  if (match(base, [/doctor|mbbs/])) return `Clinical rotations during MBBS; seek observerships in hospitals during internship year before NEET PG.`;
  if (match(base, [/chartered account/])) return `Articleship under practising CA (3 years) is mandatory — apply through ICAI portal and network with firms in your city.`;
  return `Seek ${base} internships from Year 2 of your degree via campus placement cell, LinkedIn, and Dreams Mantra Career Launchpad referrals.`;
}

function pick(arr, i) {
  return arr[i % arr.length];
}

function pickSet(i, sets) {
  return sets[i % sets.length];
}
