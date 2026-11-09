// Content validator: node scripts/check-content.mjs [ja|zh|fr|es|en]  (all five when no course is given).
// Hard errors fail the run (exit 1); warnings are printed and counted. `npm test` runs it for every course.
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const COURSES = ['ja', 'zh', 'fr', 'es', 'en'];
const arg = process.argv[2];

// ---- No course given: run each in its own process (the course is fixed at load time) ----
if (!arg) {
  let failed = false;
  for (const code of COURSES) {
    try {
      process.stdout.write(execFileSync(process.execPath, [new URL(import.meta.url).pathname, code], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
    } catch (err) {
      process.stdout.write(err.stdout || '');
      process.stderr.write(err.stderr || '');
      failed = true;
    }
  }
  process.exit(failed ? 1 : 0);
}

globalThis.__HAJIME_COURSE__ = arg;
const { ITEMS, SECTIONS } = await import('../app/js/course.js');
const { L } = await import('../app/js/lang.js');
const pack = await import('../app/js/content/pack.js');
const { artCode } = await import('../app/js/art.js');
const { latinKey } = await import('../app/js/normalise.js');
const { SECTIONS_DATA, DIALOGUES, GRAMMAR, GLOSSARY, MISSIONS, PHRASES, PATTERNS, CONJUGATIONS, PRONUNCIATION, FILLERS } = pack;

const errors = [];
const warnings = [];
const err = (msg) => errors.push(msg);
const warn = (kind, msg) => warnings.push([kind, msg]);
const hasArt = (name) => existsSync(new URL(`../app/art/${artCode(name)}.svg`, import.meta.url));
const loose = (text) => text.toLowerCase().replace(/[\s.,!?;:¿¡。！？，、'’"“”()\-～~]/g, '');

const words = [...ITEMS.values()].filter((i) => i.type === 'word');
const sentences = [...ITEMS.values()].filter((i) => i.type === 'sentence');

// ---- Duplicates (the course build already throws on a clash; this names them early) ----
const seenIds = new Map();
for (const s of SECTIONS_DATA) for (const u of s.units) for (const l of u.lessons) for (const w of l.words || []) {
  const text = Array.isArray(w) ? w[0] : w;
  const key = loose(text);
  if (seenIds.has(key) && seenIds.get(key) !== text) err(`words "${seenIds.get(key)}" and "${text}" are too alike (same id)`);
  seenIds.set(key, text);
}

// ---- Units, lessons, grammar ids, art, sizes ----
const unitIds = new Set(SECTIONS.flatMap((s) => s.units.map((u) => u.id)));
for (const s of SECTIONS_DATA) for (const u of s.units) {
  for (const l of u.lessons) {
    const where = `${s.id}-${u.id} / ${l.title}`;
    const n = (l.words?.length || 0) + (l.sentences?.length || 0);
    if (n <= 2 || n >= 6) warn('lesson size', `${where}: ${n} items (3-5 is best)`);
    if (l.grammar && !GRAMMAR[l.grammar]) err(`${where}: unknown grammar "${l.grammar}"`);
    if (!l.words?.length && !l.sentences?.length) err(`${where}: empty lesson`);
  }
  for (const d of u.dialogues || []) if (!DIALOGUES[d]) err(`${s.id}-${u.id}: unknown dialogue "${d}"`);
}
for (const it of words) if (!it.art || !hasArt(it.art)) err(`word "${it.jp}": missing art "${it.art}"`);

// ---- Latin nouns: articles present and agreeing ----
const ARTICLES = { fr: /^(le|la|l'|l’|les|un|une|des) ?/i, es: /^(el|la|los|las|un|una|unos|unas) /i, en: /^(a|an|the) /i };
// Feminine nouns that take el (Spanish) and the like: not flagged by the ending rules below.
const ES_EL_FEMININE = new Set(['agua', 'águila', 'hambre', 'arte', 'aula', 'hacha', 'alma', 'área']);
const ES_EL_ENDING_A = new Set(['día', 'mapa', 'problema', 'idioma', 'programa', 'planeta', 'sistema', 'tema', 'café', 'viaje']);
const ES_LA_ENDING_O = new Set(['mano', 'foto', 'moto', 'radio', 'dinamo']);
const FR_LE_FEMININE_ENDING = /(tion|sion|té|ée)$/;
const FR_LE_OK = new Set(['musée', 'café', 'thé', 'lycée', 'comité', 'été', 'blé', 'pré']);
const FR_LA_MASCULINE_ENDING = /(age|ment|isme|eau)$/;
const FR_LA_OK = new Set(['page', 'plage', 'cage', 'image', 'nage', 'rage', 'eau', 'peau']);
if (L.latin) {
  const rx = ARTICLES[L.code];
  for (const w of words) {
    const m = rx.exec(w.jp);
    if (!m) {
      // A noun glossed "the …" / "a …" with no article of its own.
      if (/^(the|a|an) /.test(w.en) && L.code !== 'en' && !/^(il fait|hace)/.test(w.jp) && !/^(cent|cien)/.test(w.jp)) warn('article', `"${w.jp}" (${w.en}) has no article`);
      continue;
    }
    const article = m[1].toLowerCase();
    const noun = w.jp.slice(m[0].length).toLowerCase();
    if (L.code === 'es') {
      if (article === 'el' && /a$/.test(noun) && !ES_EL_ENDING_A.has(noun) && !ES_EL_FEMININE.has(noun)) warn('gender', `"${w.jp}": el + feminine ending`);
      if (article === 'la' && /o$/.test(noun) && !ES_LA_ENDING_O.has(noun)) warn('gender', `"${w.jp}": la + masculine ending`);
    }
    if (L.code === 'fr') {
      if (/^(le|un)$/.test(article) && FR_LE_FEMININE_ENDING.test(noun) && !FR_LE_OK.has(noun)) warn('gender', `"${w.jp}": masculine article, feminine ending`);
      if (/^(la|une)$/.test(article) && FR_LA_MASCULINE_ENDING.test(noun) && !FR_LA_OK.has(noun)) warn('gender', `"${w.jp}": feminine article, masculine ending`);
    }
    if (L.code === 'en') {
      const vowel = /^[aeiou]/.test(noun) && !/^(uni|use|eu|one)/.test(noun);
      if ((article === 'a' && vowel) || (article === 'an' && !vowel && !/^(hour|honest|heir)/.test(noun))) warn('article', `"${w.jp}": a / an`);
    }
  }
}

// ---- Every sentence chunk can be glossed: a word of the course, a glossary entry or a filler ----
const known = new Set([...words.map((w) => (L.latin ? latinKey(w.jp) : w.jp)), ...Object.keys(GLOSSARY || {}).map((k) => (L.latin ? latinKey(k) : k)), ...(FILLERS || []).map((k) => (L.latin ? latinKey(k) : k))]);
// Other sentences, patterns and phrases also count as glossing for a multi-word chunk.
for (const s of sentences) {
  s.jp.forEach((c) => {
    const key = L.latin ? latinKey(c) : c;
    if (!known.has(key) && !known.has(c) && !known.has(key.replace(/[.,!?]/g, ''))) warn('chunk', `"${s.text}": chunk "${c}" has no gloss`);
  });
}

// ---- Missions: real units, replies tied to taught items or explained ----
const taughtKeys = new Set([...words, ...sentences].map((i) => loose(i.text || i.jp)));
for (const p of PATTERNS) {
  for (const [id] of p.slots) {
    const w = ITEMS.get(id);
    if (!w) err(`pattern ${p.id}: unknown word ${id}`);
    else taughtKeys.add(loose(`${p.jp}${w.jp}`));
  }
}
for (const p of PHRASES) taughtKeys.add(loose(p.jp));
for (const k of Object.keys(GLOSSARY || {})) taughtKeys.add(loose(k));
// A reply is covered when it can be cut into taught pieces ("Bonjour madame!" = bonjour + madame).
const covered = (key) => {
  const ok = Array(key.length + 1).fill(false);
  ok[0] = true;
  for (let i = 1; i <= key.length; i++) for (let j = 0; j < i && !ok[i]; j++) ok[i] = ok[j] && taughtKeys.has(key.slice(j, i));
  return ok[key.length];
};
for (const m of MISSIONS) {
  if (!unitIds.has(m.unit)) err(`mission ${m.id}: unknown unit "${m.unit}"`);
  if (!m.art || !hasArt(m.art)) warn('art', `mission ${m.id}: art "${m.art}" not bundled`);
  for (const [i, step] of m.steps.entries()) {
    if (!step.replies?.some((r) => r.ok)) err(`mission ${m.id} step ${i + 1}: no right reply`);
    for (const r of step.replies || []) {
      // Comprehension steps (a number, a direction…) have replies with only a meaning.
      if (!r.en && !r.jp) err(`mission ${m.id} step ${i + 1}: a reply needs jp or en (${JSON.stringify(r)})`);
      if (r.ok && r.jp && !covered(loose(r.jp)) && !r.note) warn('mission', `${m.id} step ${i + 1}: reply "${r.jp}" is not a taught word or sentence`);
    }
  }
}

// ---- Phrases, conjugations, pronunciation ----
for (const p of PHRASES) {
  if (!p.say) err(`phrase ${p.id} "${p.jp}": no say`);
  if (p.icon && !p.icon.trim()) err(`phrase ${p.id}: empty icon`);
}
const conjIds = new Set();
for (const c of CONJUGATIONS) {
  const where = `conjugation ${c.id}`;
  if (conjIds.has(c.id)) err(`${where}: duplicate id`);
  conjIds.add(c.id);
  if (!c.verb || !c.meaning) err(`${where}: verb and meaning needed`);
  const forms = Object.entries(c.forms || {});
  if (forms.length < 3) err(`${where}: needs at least 3 forms`);
  if (forms.some(([l, f]) => !l || !f)) err(`${where}: empty label or form`);
  const texts = new Set(forms.map(([, f]) => (L.latin ? latinKey(f) : f)));
  if (texts.size < 2) err(`${where}: fewer than 2 different forms`);
  else if (texts.size < 3) warn('conjugation', `${where}: only ${texts.size} different forms (too few for a 3-option task)`);
  if (c.formsRomaji) for (const [l] of forms) if (!c.formsRomaji[l]) warn('conjugation', `${where}: no romaji for "${l}"`);
  if (c.example) {
    if (!c.example.jp || !c.example.en) err(`${where}: example needs jp and en`);
    else if (!forms.some(([, f]) => c.example.jp.toLowerCase().includes(f.toLowerCase()))) warn('conjugation', `${where}: example contains none of the forms`);
  }
}
const pronIds = new Set();
for (const p of PRONUNCIATION) {
  const where = `pronunciation ${p.id}`;
  if (pronIds.has(p.id)) err(`${where}: duplicate id`);
  pronIds.add(p.id);
  for (const k of ['id', 'title', 'text', 'example', 'say', 'icon']) if (!p[k]) err(`${where}: missing ${k}`);
}

// ---- Dialogues: options[0] is the answer, and the others differ from it ----
const checkQuestion = (where, q) => {
  if (!q.question || !Array.isArray(q.options) || q.options.length < 2) return err(`${where}: needs a question and at least 2 options`);
  if (new Set(q.options.map((o) => o.toLowerCase())).size !== q.options.length) err(`${where}: duplicate options`);
};
for (const [id, d] of Object.entries(DIALOGUES)) {
  checkQuestion(`dialogue ${id}`, d);
  (d.questions || []).forEach((q, i) => checkQuestion(`dialogue ${id} question ${i + 1}`, q));
  if (d.questions?.length && d.questions[0].options[0] !== d.options[0]) warn('dialogue', `${id}: questions[0] answer differs from the main answer`);
  if (!d.lines?.length || d.lines.some((l) => !l.jp || !l.en)) err(`dialogue ${id}: lines need jp and en`);
}

// ---- Report ----
const byKind = {};
for (const [kind, msg] of warnings) (byKind[kind] ||= []).push(msg);
console.log(`[${arg}] ${words.length} words, ${sentences.length} sentences, ${MISSIONS.length} missions, ${CONJUGATIONS.length} conjugations, ${PRONUNCIATION.length} pronunciation tips: ${errors.length} errors, ${warnings.length} warnings`);
for (const [kind, list] of Object.entries(byKind)) {
  console.log(`  warning (${kind}): ${list.length}`);
  for (const msg of list.slice(0, process.env.VERBOSE ? Infinity : 4)) console.log(`    ${msg}`);
}
if (errors.length) {
  for (const e of errors) console.error(`  ERROR [${arg}] ${e}`);
  process.exit(1);
}
