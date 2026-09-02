---
name: eschool-testcase-steps-merge
description: >-
  Merge the step-by-step "classic" export into the "Test Cases" sheet of Eschool
  QA test-case workbooks (.xlsx): add "Steps" and "Results" columns between
  Preconditions and Postconditions, then optionally strip the helper sheets so
  only "Test Cases" remains. Use this whenever the user asks to combine/merge
  the classic and Test Cases sheets, add steps/results into test cases, produce
  the 16-column test-case layout, or clean up (delete) the classic/Example
  sheets — for a single file OR a whole folder of these workbooks (including the
  "Release v ... ( Test Cases )" / TPDC exports). Trigger even if the user only
  says "გააერთიანე ცხრილები", "ნაბიჯები ჩაამატე", or "წაშალე classic sheet".
---

# Eschool test-case step merger

## What these workbooks look like

Eschool QA exports arrive as `.xlsx` files that hold two (sometimes three) sheets:

- **`Test Cases`** — one row per test case, 14 columns:
  `ID, Title, Description, Preconditions, Postconditions, Priority, Severity,
  Behavior, Type, Status, Suite ID, Suite Title, Suite Parent ID, Created at`.
  It is missing the actual test steps.
- **`classic`** — the step export, one row per step, columns:
  `Case ID, Position, Action, Input Data, Expected Result, isShared`.
- **`Example`** — (only in some files) a hand-made reference of the finished
  layout. Never edit it; it is only a sample.

The goal is a `Test Cases` sheet with the steps folded in, in this exact
**16-column** order:

```
ID, Title, Description, Preconditions, Steps, Results, Postconditions,
Priority, Severity, Behavior, Type, Status, Suite ID, Suite Title,
Suite Parent ID, Created at
```

`Steps` and `Results` are inserted between `Preconditions` and `Postconditions`.

## How Steps / Results are built

Group the `classic` rows by `Case ID`, sort by `Position`, and join each group's
lines with newlines, numbered by `Position`:

- **Steps** = `1. {Action}` / `2. {Action}` / …
- **Results** = `1. {Expected Result}` / `2. {Expected Result}` / …

`Input Data` is normally empty in these exports and is not included. The two new
columns are left-aligned, top-aligned, wrap-text, with widths ~46 (Steps) and
~60 (Results) to match the reference `Example` sheet.

## Environment note (important on this machine)

There is **no working Python** here (only the Microsoft Store stub), so the
`xlsx` skill's Python path will not run. Use **Node.js + `exceljs`** instead —
that is what the bundled script uses. Node is at `C:\Program Files\nodejs`.

## Running it

The bundled script does merge + optional cleanup, is idempotent (skips files
already merged), matches columns by header name, and reports files that are open
in Excel (`LOCKED`) instead of failing.

1. Make sure `exceljs` is available. Install it once in the scratchpad and point
   `NODE_PATH` at it:

   ```bash
   cd "<scratchpad>" && npm init -y >/dev/null 2>&1 && npm install exceljs >/dev/null 2>&1
   ```

2. Run the script. `<path>` can be a single `.xlsx` **or a folder** (recursed;
   `~$…` Excel lock files are skipped automatically):

   ```bash
   NODE_PATH="<scratchpad>/node_modules" node "<skill-dir>/scripts/merge_testcases.js" "<path>" [--cleanup] [--dry-run]
   ```

   - Default (no flags): only merges Steps/Results into `Test Cases`.
   - `--cleanup`: after merging, also removes the `classic` and `Example` sheets
     so each file has just the `Test Cases` sheet.
   - `--dry-run`: report what would change, write nothing. Good first pass on a
     whole folder.

   On PowerShell instead of bash, set the env var separately:
   `$env:NODE_PATH="<scratchpad>/node_modules"; node "<script>" "<path>" --cleanup`.

3. Read the per-file report. Each line is
   `STATUS | file | notes`, with statuses:
   - `DONE` — merged and/or cleaned and saved.
   - `SKIP` — nothing to do (e.g. already merged, no `classic`).
   - `LOCKED` — the file is open in Excel. Ask the user to close it, then re-run;
     the script is safe to run again (idempotent).
   - `FAIL` — a real problem (e.g. `classic` header mismatch); investigate.
   - `NO-STEPS: <ids>` in the notes means those case IDs had no rows in
     `classic` — surface them to the user rather than silently leaving blanks.

## Guidance

- **Prefer merge and cleanup as separate confirmations** unless the user clearly
  asked for both. Merging is safe to redo; deleting the `classic`/`Example`
  sheets is harder to undo, so confirm before `--cleanup` if the user only asked
  to merge.
- **Files may be open in Excel.** A `~$<name>.xlsx` sibling means the workbook is
  open and writes will fail with `EBUSY`. The script reports these as `LOCKED`
  and keeps going — collect them and ask the user to close those files.
- **These edits overwrite the originals in place.** That is what the user wants
  for this workflow, but if a run is exploratory, use `--dry-run` first, or copy
  to a `(merged)` filename and confirm before overwriting.
- **Verify, don't assume.** After a real run, spot-check that the header is the
  16-column order above and that no data row has an empty `Steps`/`Results`
  (unless it legitimately had no `classic` steps).
- The script only touches `Test Cases` (and, with `--cleanup`, deletes helper
  sheets). It never modifies `classic` data or the `Example` reference.
