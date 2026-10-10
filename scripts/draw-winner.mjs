// Giveaway winner draw. Run by hand after the giveaway closes; never runs on build and writes nothing.
//   node scripts/draw-winner.mjs entries.csv [runnerUps=2]
// The CSV is your export of giveaway entries with a header row: name,email,phone,created_at
// Duplicates (same lower-cased email, or same phone digits) count once, keeping the earliest entry.
import { readFileSync } from 'node:fs';
import { randomInt } from 'node:crypto';

const [file, runnerUpArg = '2'] = process.argv.slice(2);
if (!file) {
  console.error('Usage: node scripts/draw-winner.mjs entries.csv [runnerUps=2]');
  process.exit(1);
}

// Minimal CSV parser: handles quoted fields, escaped quotes and commas or newlines inside quotes.
const parseCsv = text => {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter(r => r.some(v => v.trim()));
};

const [header, ...lines] = parseCsv(readFileSync(file, 'utf8').replace(/^﻿/, ''));
const col = Object.fromEntries(header.map((h, i) => [h.trim().toLowerCase(), i]));
for (const name of ['name', 'email', 'phone', 'created_at']) {
  if (!(name in col)) { console.error(`Missing column: ${name}`); process.exit(1); }
}

const entries = lines
  .map(r => ({ name: r[col.name]?.trim(), email: r[col.email]?.trim().toLowerCase(), phone: r[col.phone]?.replace(/\D/g, ''), created_at: r[col.created_at]?.trim() }))
  .filter(e => e.email || e.phone)
  .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));

const seen = new Set();
const valid = entries.filter(e => {
  const keys = [e.email && `e:${e.email}`, e.phone && `p:${e.phone}`].filter(Boolean);
  if (keys.some(k => seen.has(k))) return false;
  keys.forEach(k => seen.add(k));
  return true;
});

if (!valid.length) { console.error('No valid entries.'); process.exit(1); }

// Draw without replacement using a cryptographic random number generator.
const pool = [...valid];
const drawn = [];
const wanted = Math.min(pool.length, 1 + Math.max(0, parseInt(runnerUpArg, 10) || 0));
while (drawn.length < wanted) drawn.push(pool.splice(randomInt(pool.length), 1)[0]);

const show = e => `${e.name || '(no name)'} <${e.email || '-'}> ${e.phone || '-'}`;
console.log(`Winner: ${show(drawn[0])}`);
drawn.slice(1).forEach((e, i) => console.log(`Runner-up ${i + 1}: ${show(e)}`));
console.log(`[draw] ${new Date().toISOString()} valid_entries=${valid.length} total_rows=${lines.length} duplicates_removed=${entries.length - valid.length}`);
