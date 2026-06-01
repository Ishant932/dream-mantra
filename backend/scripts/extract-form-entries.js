const FORMS = {
  vak: 'https://docs.google.com/forms/d/e/1FAIpQLSd7p0jHNECuSjQpeFq_qwXDrk6nkDWvy1QywlRhO9AbxdYQxg/viewform',
  mit: 'https://docs.google.com/forms/d/e/1FAIpQLScFPTNZEGEzQfOqZVo3p8JrkPY04ACH7EkjohPAX__oIYU5Qg/viewform',
  disc: 'https://docs.google.com/forms/d/e/1FAIpQLSfei4_2YtzW-4QpZY7Zn0NSQsuNPl-tDw1NSCBilOa0BpUr_A/viewform',
  riasec: 'https://docs.google.com/forms/d/e/1FAIpQLScT1dyE6IHa_JwO2VYT7_cxpmhBSv9XyQZ3J-64AKxH-sq1Ig/viewform',
  mbti: 'https://docs.google.com/forms/d/e/1FAIpQLSfVU5p89sERCKfcCpQHul1auD48btzT1IZwDt2a-APb750u-g/viewform',
  big5: 'https://docs.google.com/forms/d/e/1FAIpQLSel5kdNq5lxLyHK9ImFKOK0Gb_HuUGdzAdS_p9zme5XlmTngg/viewform',
  'career-understanding': 'https://docs.google.com/forms/d/e/1FAIpQLSe7Cg6TSzmVHoVglQpBcSuCMcT1RNAJ_chiD8EiWCPXdi3oYQ/viewform',
};

function extractFields(html) {
  const fields = [];
  const labels = ['Dreamz ID', 'Name', 'Registered Phone', 'Email', 'Dream Mantra'];
  for (const label of labels) {
    const escaped = label.replace(/ /g, '&quot;,&quot;') || label;
    const patterns = [
      new RegExp(`${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^\\[]*\\[\\[(\\d+),`, 'i'),
      new RegExp(`${label.replace(/ /g, '&quot;,&quot;')}[^\\[]*\\[\\[(\\d+),`, 'i'),
    ];
    for (const p of patterns) {
      const m = html.match(p);
      if (m) {
        fields.push({ label, entryId: m[1] });
        break;
      }
    }
  }
  // Generic: first three text fields after titles in FB_PUBLIC_LOAD_DATA_
  const block = html.match(/FB_PUBLIC_LOAD_DATA_\s*=\s*(\[.*?\]);/s);
  if (block) {
    const dreamz = [...block[1].matchAll(/Dreamz ID[^[]*\[\[(\d+),/g)].map((m) => m[1]);
    const name = [...block[1].matchAll(/Name[^[]*\[\[(\d+),/g)].map((m) => m[1]);
    const phone = [...block[1].matchAll(/Registered Phone[^[]*\[\[(\d+),/g)].map((m) => m[1]);
    return { dreamzId: dreamz[0], name: name[0], phone: phone[0], raw: fields };
  }
  return { raw: fields };
}

const result = {};
for (const [name, url] of Object.entries(FORMS)) {
  const html = await (await fetch(url)).text();
  const dreamzMatch = html.match(/Dreamz ID[^[]*\[\[(\d+),/);
  const nameMatch = html.match(/Name[^[]*\[\[(\d+),/);
  const phoneMatch = html.match(/Registered Phone[^[]*\[\[(\d+),/);
  result[name] = {
    userUid: dreamzMatch?.[1] ? `entry.${dreamzMatch[1]}` : null,
    userName: nameMatch?.[1] ? `entry.${nameMatch[1]}` : null,
    phone: phoneMatch?.[1] ? `entry.${phoneMatch[1]}` : null,
  };
  console.log(name, result[name]);
}

console.log('\nJSON:', JSON.stringify(result, null, 2));
