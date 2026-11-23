// Builds src/data/db.json from Wikidata (CC0).  Run:  node scripts/import-wikidata.mjs
// Scope: footballers who played for a club of the big five leagues or the Azerbaijan
// Premier League (well-known players only, measured by number of Wikipedia language
// editions), plus footballers with Azerbaijani nationality.
import { writeFileSync } from 'node:fs';

const ENDPOINT = 'https://query.wikidata.org/sparql';
const UA = 'football-quiz-data-import/0.1 (generic client)';
const LEAGUES = { Q9448: 'ENG', Q324867: 'ESP', Q82595: 'GER', Q15804: 'ITA', Q13394: 'FRA', Q326859: 'AZE' };
const MIN_SITELINKS = 15; // top-league players
const MIN_SITELINKS_AZE = 3; // Azerbaijan clubs and Azerbaijani players
const OUT = new URL('../src/data/db.json', import.meta.url);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const qid = (uri) => uri.slice(uri.lastIndexOf('/') + 1);

async function sparql(query, attempt = 0) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/sparql-results+json',
      'User-Agent': UA,
    },
    body: 'query=' + encodeURIComponent(query),
  });
  if (res.status === 429 || res.status >= 500) {
    if (attempt >= 5) throw new Error(`SPARQL failed: ${res.status}`);
    const wait = Number(res.headers.get('retry-after') || 10) * 1000;
    await sleep(wait);
    return sparql(query, attempt + 1);
  }
  if (!res.ok) throw new Error(`SPARQL ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = await res.json();
  await sleep(250);
  return json.results.bindings.map((b) =>
    Object.fromEntries(Object.entries(b).map(([k, v]) => [k, v.value])),
  );
}

async function batched(ids, size, makeQuery) {
  const rows = [];
  for (let i = 0; i < ids.length; i += size) {
    const values = ids.slice(i, i + size).map((q) => `wd:${q}`).join(' ');
    rows.push(...(await sparql(makeQuery(values))));
    process.stdout.write(`\r  ${Math.min(i + size, ids.length)}/${ids.length}`);
  }
  process.stdout.write('\n');
  return rows;
}

const year = (iso) => (iso ? Number(iso.slice(0, 4)) : null);
const num = (v) => (v === undefined ? null : Math.round(Number(v)));

function cleanClub(name) {
  return name
    .replace(/ Club de Fútbol$/, '')
    .replace(/^(FC|AC|AS|SS|SSC|US|RC|OGC|AFC|VfB|VfL|TSG 1899|1\. FC|1\. FSV|SC|SV|FK|PFK) /, (m, p) =>
      ['VfB', 'VfL', 'AC', 'AS', 'RC', '1. FC'].includes(p) ? m : '',
    )
    .replace(/,? (F\.C\.|FC|A\.F\.C\.|AFC|C\.F\.|CF|PFC|PFK|FK|S\.p\.A\.|Calcio|Football Club)$/, '')
    .trim();
}

function position(labels) {
  const s = labels.join(' ').toLowerCase();
  if (/goalkeeper/.test(s)) return 'GK';
  if (/forward|striker|winger/.test(s)) return 'FWD';
  if (/midfield/.test(s)) return 'MID';
  if (/back|defender|sweeper/.test(s)) return 'DEF';
  return null;
}

const YOUTH = /under-|\bU-?\d\d\b|youth|academy|reserve|juvenil|primavera|castilla| B$| II$| C$|olympic|amateur/i;
const HOME_NATIONS = {
  Q21: ['ENG', '🏴󠁧󠁢󠁥󠁮󠁧󠁿'], Q22: ['SCO', '🏴󠁧󠁢󠁳󠁣󠁴󠁿'], Q25: ['WAL', '🏴󠁧󠁢󠁷󠁬󠁳󠁿'], Q26: ['NIR', '🇬🇧'],
};
// ISO alpha-3 -> the three-letter codes football fans know
const FIFA = {
  DEU: 'GER', PRT: 'POR', URY: 'URU', DNK: 'DEN', NLD: 'NED', CHE: 'SUI', HRV: 'CRO', GRC: 'GRE',
  BGR: 'BUL', DZA: 'ALG', AGO: 'ANG', CHL: 'CHI', COG: 'CGO', CRI: 'CRC', GNQ: 'EQG', GTM: 'GUA',
  GIN: 'GUI', HTI: 'HAI', HND: 'HON', KWT: 'KUW', LVA: 'LVA', LBN: 'LBN', MDG: 'MAD', MYS: 'MAS',
  MRT: 'MTN', NER: 'NIG', PRY: 'PAR', PHL: 'PHI', PRI: 'PUR', SAU: 'KSA', ZAF: 'RSA', TWN: 'TPE',
  TZA: 'TAN', TGO: 'TOG', ARE: 'UAE', VNM: 'VIE', ZMB: 'ZAM', ZWE: 'ZIM', GMB: 'GAM', OMN: 'OMA',
  TTO: 'TRI', SGP: 'SIN', MUS: 'MRI', LSO: 'LES', BWA: 'BOT', KHM: 'CAM', SLV: 'SLV', IRN: 'IRN',
  IDN: 'IDN', NPL: 'NEP', BRB: 'BRB', SDN: 'SDN', LBY: 'LBY', MWI: 'MWI', TCD: 'CHA', BFA: 'BFA',
};
const flagOf = (a2) => (a2 ? [...a2.toUpperCase()].map((c) => String.fromCodePoint(127397 + c.charCodeAt(0))).join('') : '');

// ---------------------------------------------------------------- 1. clubs
console.log('1/5 clubs of the target leagues');
const leagueClubs = new Map(); // qid -> league code
for (const [lq, code] of Object.entries(LEAGUES)) {
  const rows = await sparql(
    `SELECT DISTINCT ?c WHERE { ?c wdt:P118 wd:${lq} ; wdt:P31/wdt:P279* wd:Q476028 . }`,
  );
  rows.forEach((r) => leagueClubs.set(qid(r.c), code));
  console.log(`  ${code}: ${rows.length} clubs`);
}

// ---------------------------------------------------------------- 2. players
console.log('2/5 players per club');
const sitelinks = new Map(); // player qid -> sitelinks
let done = 0;
for (const [club, code] of leagueClubs) {
  const min = code === 'AZE' ? MIN_SITELINKS_AZE : MIN_SITELINKS;
  const rows = await sparql(
    `SELECT DISTINCT ?p ?s WHERE { ?p p:P54/ps:P54 wd:${club} ; wdt:P106 wd:Q937857 ; wikibase:sitelinks ?s . FILTER(?s >= ${min}) }`,
  );
  rows.forEach((r) => sitelinks.set(qid(r.p), Number(r.s)));
  process.stdout.write(`\r  ${++done}/${leagueClubs.size} clubs, ${sitelinks.size} players`);
}
const aze = await sparql(
  `SELECT DISTINCT ?p ?s WHERE { ?p wdt:P106 wd:Q937857 ; wdt:P27 wd:Q227 ; wikibase:sitelinks ?s . FILTER(?s >= ${MIN_SITELINKS_AZE}) }`,
);
aze.forEach((r) => sitelinks.set(qid(r.p), Number(r.s)));
console.log(`\n  + Azerbaijani players -> ${sitelinks.size} players`);
const playerIds = [...sitelinks.keys()];

// ---------------------------------------------------------------- 3. details
console.log('3/5 player details');
const info = new Map();
const detailRows = await batched(playerIds, 150, (values) => `
  SELECT ?p ?pLabel ?dob ?sport ?cit ?posLabel WHERE {
    VALUES ?p { ${values} }
    OPTIONAL { ?p wdt:P569 ?dob }
    OPTIONAL { ?p wdt:P1532 ?sport }
    OPTIONAL { ?p wdt:P27 ?cit }
    OPTIONAL { ?p wdt:P413 ?pos }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  }`);
for (const r of detailRows) {
  const id = qid(r.p);
  const p = info.get(id) ?? { name: r.pLabel, dob: null, sport: null, cit: null, pos: new Set() };
  p.dob ??= year(r.dob);
  if (r.sport) p.sport ??= qid(r.sport);
  if (r.cit) p.cit ??= qid(r.cit);
  if (r.posLabel) p.pos.add(r.posLabel);
  info.set(id, p);
}

// ---------------------------------------------------------------- 4. careers
console.log('4/5 careers');
const careerRows = await batched(playerIds, 80, (values) => `
  SELECT ?p ?team ?start ?end ?apps ?goals WHERE {
    VALUES ?p { ${values} }
    ?p p:P54 ?st . ?st ps:P54 ?team .
    OPTIONAL { ?st pq:P580 ?start }
    OPTIONAL { ?st pq:P582 ?end }
    OPTIONAL { ?st pq:P1350 ?apps }
    OPTIONAL { ?st pq:P1351 ?goals }
  }`);
const teamIds = [...new Set(careerRows.map((r) => qid(r.team)))];

console.log(`5/5 teams (${teamIds.length})`);
const teams = new Map();
const teamRows = await batched(teamIds, 200, (values) => `
  SELECT ?t ?tLabel ?country ?sportCountry WHERE {
    VALUES ?t { ${values} }
    OPTIONAL { ?t wdt:P17 ?country }
    OPTIONAL { ?t wdt:P1532 ?sportCountry }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  }`);
for (const r of teamRows) {
  const id = qid(r.t);
  if (teams.has(id)) continue;
  const national = /national\b.*\bteam/i.test(r.tLabel);
  teams.set(id, {
    name: r.tLabel,
    national,
    youth: YOUTH.test(r.tLabel),
    country: r.sportCountry ? qid(r.sportCountry) : r.country ? qid(r.country) : null,
  });
}

// countries: codes and flags
const countryIds = [
  ...new Set(
    [...teams.values()].filter((t) => t.national && t.country).map((t) => t.country)
      .concat([...info.values()].flatMap((p) => [p.sport, p.cit]).filter(Boolean)),
  ),
];
const countries = new Map();
const countryRows = await batched(countryIds, 200, (values) => `
  SELECT ?c ?cLabel ?a2 ?a3 WHERE {
    VALUES ?c { ${values} }
    OPTIONAL { ?c wdt:P297 ?a2 } OPTIONAL { ?c wdt:P298 ?a3 }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  }`);
for (const r of countryRows) {
  const id = qid(r.c);
  if (countries.has(id)) continue;
  const home = HOME_NATIONS[id];
  countries.set(id, { name: r.cLabel, code: home ? home[0] : r.a3 ? FIFA[r.a3] ?? r.a3 : null, flag: home ? home[1] : flagOf(r.a2) });
}

// ---------------------------------------------------------------- assemble
const careers = new Map();
for (const r of careerRows) {
  const id = qid(r.p);
  if (!careers.has(id)) careers.set(id, []);
  careers.get(id).push({ team: qid(r.team), start: year(r.start), end: year(r.end), apps: num(r.apps), goals: num(r.goals) });
}

const clubIndex = new Map();
const clubs = [];
const natOut = {};
const players = [];

for (const id of playerIds) {
  const p = info.get(id);
  if (!p || !p.name || /^Q\d+$/.test(p.name)) continue;
  const stints = (careers.get(id) ?? []).sort((a, b) => (a.start ?? 9999) - (b.start ?? 9999));

  // nationality: senior national team first, then country for sport, then citizenship
  const senior = stints.filter((s) => teams.get(s.team)?.national && !teams.get(s.team).youth);
  const main = senior.slice().sort((a, b) => (b.apps ?? 0) - (a.apps ?? 0))[0];
  const natId = (main && teams.get(main.team).country) ?? p.sport ?? p.cit;
  const country = natId ? countries.get(natId) : null;
  if (!country?.code) continue;
  natOut[country.code] = [country.name, country.flag];

  const career = [];
  for (const s of stints) {
    const t = teams.get(s.team);
    if (!t || t.national || t.youth) continue;
    if (!clubIndex.has(s.team)) {
      clubIndex.set(s.team, clubs.length);
      clubs.push([cleanClub(t.name), leagueClubs.get(s.team) ?? null]);
    }
    career.push([clubIndex.get(s.team), s.start, s.end, s.apps, s.goals]);
  }
  if (career.length === 0) continue;

  players.push({
    n: p.name,
    nat: country.code,
    pos: position([...p.pos]),
    b: p.dob,
    f: sitelinks.get(id), // fame: number of Wikipedia language editions
    caps: senior.reduce((a, s) => a + (s.apps ?? 0), 0) || null,
    c: career,
  });
}

players.sort((a, b) => b.f - a.f);
const db = {
  source: 'Wikidata (CC0), https://www.wikidata.org',
  generated: new Date().toISOString().slice(0, 10),
  nations: natOut, // code -> [name, flag]
  clubs, // index -> [name, league code or null]
  players, // c: [clubIndex, startYear, endYear, leagueApps, leagueGoals]
};
writeFileSync(OUT, JSON.stringify(db));
console.log(`wrote ${players.length} players, ${clubs.length} clubs, ${Object.keys(natOut).length} nations`);
