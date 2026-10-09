// WCAG 2.1 contrast check for Airola's colour pairs.
// Run: node scripts/contrast-check.mjs   (exits 1 if any in-use pair fails)
//
// kind: 'text'       normal text, needs 4.5:1
//       'large-text' 24px+, or 18.66px+ bold, needs 3:1
//       'ui'         borders, icons, focus rings, needs 3:1
// retired: pairs replaced in the a11y pass. Printed for the before/after record, not counted.

const PAIRS = [
  // Buttons and badges
  { fg: '#FFFFFF', bg: '#2D6E5F', kind: 'text', use: 'White text on action green (buttons, badges)' },
  { fg: '#FFFFFF', bg: '#245A4E', kind: 'text', use: 'White text on action green hover' },
  { fg: '#FFFFFF', bg: '#15803D', kind: 'text', use: 'White text on green-700 ("Save £10" badge)' },
  { fg: '#FFFFFF', bg: '#3D8D7A', kind: 'ui', use: 'White icon on primary green (decorative tiles)' },
  // Footer
  { fg: '#CCECE5', bg: '#2D6E5F', kind: 'text', use: 'Footer body text' },
  { fg: '#FFFFFF', bg: '#2D6E5F', kind: 'text', use: 'Footer headings and hovered links' },
  // Brand green as text
  { fg: '#2D6E5F', bg: '#FFFFFF', kind: 'text', use: 'Green text/links on white' },
  { fg: '#2D6E5F', bg: '#EBF7F4', kind: 'text', use: 'Green text on mint tint (badges, selected options)' },
  { fg: '#2D6E5F', bg: '#F9EFEF', kind: 'text', use: 'Green text on blush page background' },
  { fg: '#3D8D7A', bg: '#FFFFFF', kind: 'large-text', use: 'Primary green in large headings (e.g. "Trust")' },
  { fg: '#3D8D7A', bg: '#F9EFEF', kind: 'large-text', use: 'Primary green in large headings on blush' },
  { fg: '#3D8D7A', bg: '#FFFFFF', kind: 'ui', use: 'Primary green icons on white' },
  // Greys
  { fg: '#64748B', bg: '#FFFFFF', kind: 'text', use: 'slate-500 secondary text on white' },
  { fg: '#64748B', bg: '#F8FAFC', kind: 'text', use: 'slate-500 labels on slate-50 inputs' },
  { fg: '#475569', bg: '#FFFFFF', kind: 'text', use: 'slate-600 body text on white' },
  { fg: '#475569', bg: '#F9EFEF', kind: 'text', use: 'slate-600 text on blush page background' },
  { fg: '#475569', bg: '#EBF7F4', kind: 'text', use: 'slate-600 text on mint tint' },
  { fg: '#334155', bg: '#F9EFEF', kind: 'text', use: 'slate-700 body text on blush' },
  { fg: '#94A3B8', bg: '#0F172A', kind: 'text', use: 'slate-400 text on slate-900 (quote price panel)' },
  { fg: '#CBD5E1', bg: '#0F172A', kind: 'text', use: 'slate-300 text on slate-900 (photo-proof steps)' },
  { fg: '#6AB0A0', bg: '#0F172A', kind: 'text', use: 'Mint price text on slate-900' },
  // Errors and focus
  { fg: '#B91C1C', bg: '#FEF2F2', kind: 'text', use: 'Error text (red-700 on red-50)' },
  { fg: '#2D6E5F', bg: '#FFFFFF', kind: 'ui', use: 'Focus ring on white' },
  { fg: '#2D6E5F', bg: '#F9EFEF', kind: 'ui', use: 'Focus ring on blush' },
  { fg: '#FFFFFF', bg: '#2D6E5F', kind: 'ui', use: 'White focus ring in footer' },
  { fg: '#FFFFFF', bg: '#0F172A', kind: 'ui', use: 'White focus ring on dark panels' },

  // Retired (before) pairs
  { fg: '#FFFFFF', bg: '#3D8D7A', kind: 'text', use: 'BEFORE: white text on #3D8D7A buttons', retired: true },
  { fg: '#CCECE5', bg: '#3D8D7A', kind: 'text', use: 'BEFORE: footer text on #3D8D7A', retired: true },
  { fg: '#94A3B8', bg: '#FFFFFF', kind: 'text', use: 'BEFORE: slate-400 labels on white', retired: true },
  { fg: '#3D8D7A', bg: '#FFFFFF', kind: 'text', use: 'BEFORE: #3D8D7A small text on white', retired: true },
  { fg: '#FFFFFF', bg: '#22C55E', kind: 'text', use: 'BEFORE: white on green-500 badge', retired: true },
  { fg: '#DC2626', bg: '#FEF2F2', kind: 'text', use: 'BEFORE: red-600 error text on red-50', retired: true },
];

const MIN = { text: 4.5, 'large-text': 3, ui: 3 };

const luminance = hex => {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map(i => parseInt(n.slice(i, i + 2), 16) / 255).map(c =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

let failures = 0;
for (const p of PAIRS) {
  const r = ratio(p.fg, p.bg);
  const pass = r >= MIN[p.kind];
  if (!pass && !p.retired) failures++;
  const status = p.retired ? (pass ? 'pass' : 'fail (retired)') : pass ? 'PASS' : 'FAIL';
  console.log(`${status.padEnd(15)} ${r.toFixed(2).padStart(5)}:1  need ${MIN[p.kind]}:1  ${p.fg} on ${p.bg}  ${p.use}`);
}

console.log(failures ? `\n${failures} in-use pair(s) below WCAG AA.` : '\nAll in-use pairs meet WCAG AA.');
process.exit(failures ? 1 : 0);
