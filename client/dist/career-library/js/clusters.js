// Dream Mantra Career Library — Cluster lookup + career modal render functions


function clusterLookup(map, cluster) {
  if (!cluster) return null;
  var cl = cluster.toLowerCase();
  for (var key in map) {
    var kl = key.toLowerCase();
    var part = kl.split('&')[0].trim().split(',')[0].trim().split('/')[0].trim();
    if (cl.indexOf(part) !== -1 || part.indexOf(cl.split('&')[0].trim()) !== -1) {
      return map[key];
    }
  }
  return map['Multidisciplinary / Professional'] || null;
}

function renderEligPath(career) {
  var ep = clusterLookup(CLUSTER_ELIG, career.cluster);
  if (!ep) return '';
  var mathsColor = (ep.c10_maths && ep.c10_maths.indexOf('MANDATORY') !== -1) ? '#A82020' : '#3A1800';
  var html = '';
  html += '<div style="margin:14px 0">';
  html += '<div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:#1C0D00;margin-bottom:10px;font-family:Plus Jakarta Sans,sans-serif">📍 COMPLETE ELIGIBILITY PATH — FROM CLASS 10</div>';

  // Class 10
  html += '<div style="border-left:4px solid #F05A0E;margin:0 0 10px 0;padding:0 0 0 14px">';
  html += '<div style="font-size:11px;font-weight:800;color:#F05A0E;font-family:Plus Jakarta Sans,sans-serif;margin-bottom:6px">📚 CLASS 10 — Foundation</div>';
  html += '<div class="dl-row"><dt class="dl-lbl">Mathematics type</dt><dd class="dl-val" style="font-weight:600;color:' + mathsColor + '">' + (ep.c10_maths || '—') + '</dd></div>';
  html += '<div class="dl-row"><dt class="dl-lbl">Science subjects</dt><dd class="dl-val">' + (ep.c10_sci || '—') + '</dd></div>';
  html += '</div>';

  // Class 12
  html += '<div style="border-left:4px solid #1F618D;margin:0 0 10px 0;padding:0 0 0 14px">';
  html += '<div style="font-size:11px;font-weight:800;color:#1F618D;font-family:Plus Jakarta Sans,sans-serif;margin-bottom:6px">📖 CLASS 11–12 — Stream Choice</div>';
  html += '<div class="dl-row"><dt class="dl-lbl">Stream to choose</dt><dd class="dl-val" style="font-weight:600">' + (ep.c12_stream || '—') + '</dd></div>';
  html += '<div class="dl-row"><dt class="dl-lbl">Key subjects and marks</dt><dd class="dl-val">' + (ep.c12_key || '—') + '</dd></div>';
  if (ep.c12_tip) {
    html += '<div style="background:#EBF5FB;border:1px solid #AED6F1;border-radius:6px;padding:7px 10px;margin-top:5px;font-size:12px;color:#1A5276">💡 ' + ep.c12_tip + '</div>';
  }
  html += '</div>';

  // Graduation
  html += '<div style="border-left:4px solid #1A6640;margin:0 0 10px 0;padding:0 0 0 14px">';
  html += '<div style="font-size:11px;font-weight:800;color:#1A6640;font-family:Plus Jakarta Sans,sans-serif;margin-bottom:6px">🎓 GRADUATION</div>';
  html += '<div class="dl-row"><dt class="dl-lbl">Degree options</dt><dd class="dl-val">' + (ep.grad || '—') + '</dd></div>';
  if (ep.pg) {
    html += '<div class="dl-row"><dt class="dl-lbl">Postgraduate</dt><dd class="dl-val">' + ep.pg + '</dd></div>';
  }
  html += '</div>';

  // Exams
  html += '<div style="border-left:4px solid #7D3C98;margin:0 0 5px 0;padding:0 0 0 14px">';
  html += '<div style="font-size:11px;font-weight:800;color:#7D3C98;font-family:Plus Jakarta Sans,sans-serif;margin-bottom:6px">📝 KEY ENTRANCE EXAMS</div>';
  html += '<div style="font-size:12px;color:#3A1800;line-height:1.7">' + (ep.exams || '—') + '</div>';
  html += '</div>';

  html += '</div>';
  return html;
}

function renderCourses(career) {
  var courses = clusterLookup(CLUSTER_COURSES_MAP, career.cluster);
  if (!courses || !courses.length) return '';
  var html = '';
  html += '<div style="margin:14px 0">';
  html += '<div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:#1C0D00;margin-bottom:10px;font-family:Plus Jakarta Sans,sans-serif">🏫 COURSES TO PURSUE</div>';
  for (var i = 0; i < courses.length; i++) {
    var bg = (i % 2 === 0) ? '#FFF8F4' : '#FFFCFA';
    html += '<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:7px;padding:7px 10px;background:' + bg + ';border-radius:7px;border:1px solid #FFD5BC">';
    html += '<div style="flex-shrink:0;width:24px;height:24px;border-radius:50%;background:#F05A0E;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;font-family:Plus Jakarta Sans,sans-serif">' + (i + 1) + '</div>';
    html += '<div style="font-size:12px;color:#3A1800;line-height:1.6;font-weight:500">' + courses[i] + '</div>';
    html += '</div>';
  }
  html += '</div>';
  return html;
}

function renderSkills(career) {
  var sk = clusterLookup(CLUSTER_SKILLS_MAP, career.cluster) || {};
  var careerSk = career.skills || [];
  var techSk = sk.tech || [];
  var softSk = sk.soft || [];
  var html = '';
  html += '<div style="margin:14px 0">';
  html += '<div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:#1C0D00;margin-bottom:10px;font-family:Plus Jakarta Sans,sans-serif">💡 SKILLS TO ACQUIRE</div>';

  if (careerSk.length) {
    html += '<div style="margin-bottom:10px"><div style="font-size:11px;font-weight:700;color:#F05A0E;margin-bottom:5px;font-family:Plus Jakarta Sans,sans-serif">Key Skills for This Role</div><div style="display:flex;flex-wrap:wrap;gap:6px">';
    for (var i = 0; i < careerSk.length; i++) {
      html += '<span style="background:#FFF3EC;border:1px solid #FFD5BC;border-radius:5px;padding:3px 10px;font-size:11px;color:#7A3000;font-weight:600">' + careerSk[i] + '</span>';
    }
    html += '</div></div>';
  }

  if (techSk.length) {
    html += '<div style="margin-bottom:10px"><div style="font-size:11px;font-weight:700;color:#1F618D;margin-bottom:5px;font-family:Plus Jakarta Sans,sans-serif">Technical and Domain Skills</div><div style="display:flex;flex-wrap:wrap;gap:6px">';
    for (var i = 0; i < techSk.length; i++) {
      html += '<span style="background:#EBF5FB;border:1px solid #AED6F1;border-radius:5px;padding:3px 10px;font-size:11px;color:#1A5276;font-weight:500">' + techSk[i] + '</span>';
    }
    html += '</div></div>';
  }

  if (softSk.length) {
    html += '<div style="margin-bottom:5px"><div style="font-size:11px;font-weight:700;color:#1A6640;margin-bottom:5px;font-family:Plus Jakarta Sans,sans-serif">Soft and Professional Skills</div><div style="display:flex;flex-wrap:wrap;gap:6px">';
    for (var i = 0; i < softSk.length; i++) {
      html += '<span style="background:#E9F7EF;border:1px solid #A9DFBF;border-radius:5px;padding:3px 10px;font-size:11px;color:#1A5276;font-weight:500">' + softSk[i] + '</span>';
    }
    html += '</div></div>';
  }

  html += '</div>';
  return html;
}

// ── INIT ─────────────────────────────────────────────────────────────────────
renderStats();
renderAll();
