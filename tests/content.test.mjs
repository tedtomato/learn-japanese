// The content validator (scripts/check-content.mjs) runs for every course: hard errors fail the test,
// warnings are printed by `node scripts/check-content.mjs` (VERBOSE=1 for all of them).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

for (const code of ['ja', 'zh', 'fr', 'es', 'en']) {
  test(`${code}: the content validator finds no errors`, () => {
    const run = spawnSync(process.execPath, [new URL('../scripts/check-content.mjs', import.meta.url).pathname, code], { encoding: 'utf8' });
    assert.equal(run.status, 0, `${run.stdout}\n${run.stderr}`);
    assert.match(run.stdout, new RegExp(`^\\[${code}\\] .* 0 errors`));
  });
}

test('the validator prints a one-line summary per course', () => {
  const run = spawnSync(process.execPath, [new URL('../scripts/check-content.mjs', import.meta.url).pathname, 'fr'], { encoding: 'utf8' });
  assert.match(run.stdout, /words, .* sentences, .* missions, .* conjugations, .* pronunciation tips/);
});
