#!/usr/bin/env node
/*
 * Eschool test-case step merger.
 *
 * Given exported test-case workbooks that contain a "Test Cases" sheet and a
 * "classic" sheet (the step-by-step export), this folds the classic steps into
 * the Test Cases sheet as two new columns — "Steps" and "Results" — placed
 * between "Preconditions" and "Postconditions", then optionally deletes the
 * helper sheets so only "Test Cases" remains.
 *
 * Usage:
 *   node merge_testcases.js "<file-or-folder>" [--cleanup] [--dry-run]
 *
 *   <file-or-folder>  A single .xlsx, or a folder (recursed; ~$ lock files skipped).
 *   --cleanup         After merging, remove the "classic" and "Example" sheets.
 *   --dry-run         Report what would change without writing any file.
 *
 * Requires the `exceljs` package. If it is not found next to this script, set
 * NODE_PATH to a node_modules folder that has it, e.g.:
 *   NODE_PATH=/path/to/scratchpad/node_modules node merge_testcases.js ...
 */

let ExcelJS;
try { ExcelJS = require('exceljs'); }
catch (e) {
  console.error('ERROR: cannot load "exceljs". Install it and/or set NODE_PATH.\n' +
    '  e.g.  npm install exceljs   (then run with NODE_PATH=<dir>/node_modules)');
  process.exit(2);
}
const fs = require('fs');
const path = require('path');

const FINAL_HEADER = ['ID','Title','Description','Preconditions','Steps','Results',
  'Postconditions','Priority','Severity','Behavior','Type','Status',
  'Suite ID','Suite Title','Suite Parent ID','Created at'];
const STEPS_WIDTH = 46.28515625;
const RESULTS_WIDTH = 60.42578125;
const NEW_COL_ALIGN = { horizontal: 'left', vertical: 'top', wrapText: true };

// exceljs cell values can be plain, rich text, hyperlink, or formula objects.
function txt(v) {
  if (v && typeof v === 'object') {
    if (v.richText) return v.richText.map(t => t.text).join('');
    if (v.text !== undefined) return v.text;
    if (v.result !== undefined) return v.result;
  }
  return v == null ? '' : String(v);
}

function headerIndex(ws, name) {
  for (let c = 1; c <= ws.columnCount; c++) {
    if (txt(ws.getRow(1).getCell(c).value).trim() === name) return c;
  }
  return -1;
}

function collectFiles(target) {
  const st = fs.statSync(target);
  if (st.isFile()) return [target];
  const out = [];
  (function walk(d) {
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, f.name);
      if (f.isDirectory()) walk(p);
      else if (f.name.toLowerCase().endsWith('.xlsx') && !f.name.startsWith('~$')) out.push(p);
    }
  })(target);
  return out;
}

// Returns { steps: {caseId: text}, results: {caseId: text} }
function buildStepsFromClassic(cl) {
  const cId = headerIndex(cl, 'Case ID');
  const cPos = headerIndex(cl, 'Position');
  const cAct = headerIndex(cl, 'Action');
  const cExp = headerIndex(cl, 'Expected Result');
  if ([cId, cPos, cAct, cExp].includes(-1)) {
    throw new Error('classic sheet is missing one of: Case ID, Position, Action, Expected Result');
  }
  const groups = {};
  for (let r = 2; r <= cl.rowCount; r++) {
    const id = txt(cl.getRow(r).getCell(cId).value);
    if (id === '') continue;
    const pos = parseInt(txt(cl.getRow(r).getCell(cPos).value), 10) || 0;
    const action = txt(cl.getRow(r).getCell(cAct).value).trim();
    const exp = txt(cl.getRow(r).getCell(cExp).value).trim();
    (groups[id] = groups[id] || []).push({ pos, action, exp });
  }
  const steps = {}, results = {};
  for (const id in groups) {
    const list = groups[id].sort((a, b) => a.pos - b.pos);
    steps[id] = list.map(s => `${s.pos}. ${s.action}`).join('\n');
    results[id] = list.map(s => `${s.pos}. ${s.exp}`).join('\n');
  }
  return { steps, results };
}

// Mutates the Test Cases sheet in place. Returns { dataRows, missing:[ids] }.
function mergeIntoTestCases(tc, steps, results) {
  const hdr = [];
  for (let c = 1; c <= tc.columnCount; c++) hdr.push(txt(tc.getRow(1).getCell(c).value).trim());
  const preIdx = hdr.indexOf('Preconditions');
  const postIdx = hdr.indexOf('Postconditions');
  if (preIdx === -1 || postIdx === -1) {
    throw new Error('Test Cases sheet lacks Preconditions/Postconditions columns: ' + JSON.stringify(hdr));
  }
  if (postIdx !== preIdx + 1) {
    throw new Error('Postconditions is not directly after Preconditions; unexpected layout: ' + JSON.stringify(hdr));
  }
  const insertAt = postIdx + 1; // 1-based column where "Steps" will live

  const stepsCol = ['Steps'], resCol = ['Results'];
  const missing = [];
  let dataRows = 0;
  for (let r = 2; r <= tc.rowCount; r++) {
    const id = txt(tc.getRow(r).getCell(1).value);
    if (id === '') { stepsCol.push(null); resCol.push(null); continue; }
    dataRows++;
    if (!(id in steps)) missing.push(id);
    stepsCol.push(steps[id] ?? '');
    resCol.push(results[id] ?? '');
  }

  tc.spliceColumns(insertAt, 0, stepsCol, resCol);
  tc.getColumn(insertAt).width = STEPS_WIDTH;
  tc.getColumn(insertAt + 1).width = RESULTS_WIDTH;
  for (let r = 1; r <= tc.rowCount; r++) {
    for (const c of [insertAt, insertAt + 1]) {
      tc.getRow(r).getCell(c).alignment = { ...NEW_COL_ALIGN };
    }
  }
  return { dataRows, missing };
}

async function processFile(p, opts) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(p);
  const tc = wb.getWorksheet('Test Cases');
  if (!tc) return { status: 'SKIP', note: 'no "Test Cases" sheet' };

  const notes = [];
  let changed = false;

  // ---- Merge (idempotent: skip if Steps already present) ----
  const alreadyMerged = headerIndex(tc, 'Steps') !== -1;
  const cl = wb.getWorksheet('classic');
  if (alreadyMerged) {
    notes.push('already merged');
  } else if (cl) {
    const { steps, results } = buildStepsFromClassic(cl);
    const { dataRows, missing } = mergeIntoTestCases(tc, steps, results);
    changed = true;
    notes.push(`merged ${dataRows} cases`);
    if (missing.length) notes.push('NO-STEPS: ' + missing.join(','));
    // Sanity check the resulting header order.
    const nh = [];
    for (let c = 1; c <= tc.columnCount; c++) nh.push(txt(tc.getRow(1).getCell(c).value).trim());
    if (JSON.stringify(nh) !== JSON.stringify(FINAL_HEADER)) {
      notes.push('WARN header != expected: ' + JSON.stringify(nh));
    }
  } else {
    notes.push('no "classic" sheet to merge');
  }

  // ---- Cleanup (remove helper sheets) ----
  if (opts.cleanup) {
    const removed = [];
    for (const name of ['classic', 'Example']) {
      const ws = wb.getWorksheet(name);
      if (ws) { wb.removeWorksheet(ws.id); removed.push(name); changed = true; }
    }
    if (removed.length) notes.push('removed ' + JSON.stringify(removed));
  }

  if (!changed) return { status: 'SKIP', note: notes.join(' | ') };
  if (opts.dryRun) return { status: 'DRY', note: notes.join(' | ') };

  try {
    await wb.xlsx.writeFile(p);
  } catch (e) {
    if (e.code === 'EBUSY') return { status: 'LOCKED', note: 'file open in Excel — close it and re-run' };
    throw e;
  }
  return { status: 'DONE', note: notes.join(' | '), sheets: wb.worksheets.map(w => w.name) };
}

(async () => {
  const args = process.argv.slice(2);
  const opts = { cleanup: args.includes('--cleanup'), dryRun: args.includes('--dry-run') };
  const target = args.find(a => !a.startsWith('--'));
  if (!target) {
    console.error('Usage: node merge_testcases.js "<file-or-folder>" [--cleanup] [--dry-run]');
    process.exit(1);
  }
  if (!fs.existsSync(target)) { console.error('Path not found: ' + target); process.exit(1); }

  const files = collectFiles(target);
  const root = fs.statSync(target).isDirectory() ? target : path.dirname(target);
  let done = 0, skipped = 0, locked = 0, failed = 0;
  for (const p of files) {
    const rel = path.relative(root, p) || path.basename(p);
    try {
      const r = await processFile(p, opts);
      console.log(`${r.status.padEnd(6)}| ${rel} | ${r.note}${r.sheets ? ' | now=' + JSON.stringify(r.sheets) : ''}`);
      if (r.status === 'DONE' || r.status === 'DRY') done++;
      else if (r.status === 'LOCKED') locked++;
      else skipped++;
    } catch (e) {
      console.log(`FAIL  | ${rel} | ${e.message}`);
      failed++;
    }
  }
  console.log(`\nSummary: ${done} changed, ${skipped} skipped, ${locked} locked, ${failed} failed (of ${files.length} files)`);
  if (locked) console.log('Close the locked files in Excel and re-run to finish them.');
  if (failed) process.exitCode = 1;
})();
