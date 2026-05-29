#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════
//  cassie-extract.mjs · ◊·κ=1
//  Headless Playwright: load CASSIE, auto-start solver, wait for DPs,
//  extract state, print as JSON. Then POST to Oracle 3 if it's up.
// ═══════════════════════════════════════════════════════════════════

import { chromium } from 'playwright';
import fs from 'node:fs';

const CASSIE_URL = 'https://sjgant80-hub.github.io/cassietorusbtc135solver/cassie-torus-v2.html';
const ORACLE_URL = 'http://localhost:7777/advice';
const SOLVER_RUNTIME_SEC = parseInt(process.argv[2]) || 45;

console.log('◊·κ=1 · cassie-extract · headless\n');
console.log('◊ runtime budget:', SOLVER_RUNTIME_SEC, 'seconds');

const browser = await chromium.launch({
  headless: true,
  args: [
    '--enable-unsafe-swiftshader',
    '--enable-features=Vulkan',
    '--use-vulkan=swiftshader',
    '--enable-unsafe-webgpu'
  ]
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

console.log('◊ navigating to CASSIE…');
await page.goto(CASSIE_URL, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(4000);

const title = await page.title();
console.log('◊ loaded:', title);

// Try clicking Start Solver
console.log('◊ clicking Start Solver…');
const startClicked = await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll('button'));
  const target = btns.find(b => /start solver/i.test(b.textContent || ''));
  if (target) { target.click(); return true; }
  return false;
});
console.log(startClicked ? '  → solver started' : '  → start button not found (continuing anyway)');

// Wait for DPs to accumulate
console.log(`◊ waiting ${SOLVER_RUNTIME_SEC}s for DPs to accumulate…`);
const startTime = Date.now();
while ((Date.now() - startTime) < SOLVER_RUNTIME_SEC * 1000) {
  await page.waitForTimeout(5000);
  const dpCount = await page.evaluate(() => (window.recentDpSample || []).length);
  const oracleSteps = await page.evaluate(() => window.INLINE_ORACLE?.steps ?? 0);
  console.log(`  t=${((Date.now() - startTime) / 1000).toFixed(0)}s · DPs=${dpCount} · oracle_steps=${oracleSteps}`);
  if (dpCount >= 40) break;
}

// Extract full state
console.log('\n◊ extracting state…');
const state = await page.evaluate(() => {
  const dpSample = (window.recentDpSample || [])
    .filter(d => d && typeof d.torusPosition === 'number')
    .map(d => ({ torusPosition: d.torusPosition, ringsHeard: d.ringsHeard || 0 }));
  return {
    puzzle: 135,
    timestamp: new Date().toISOString(),
    focusMode: true,
    oracleConfidence: window.INLINE_ORACLE?.confidence ?? 0,
    oraclePosition:   window.INLINE_ORACLE?.position ?? 0,
    oracleSteps:      window.INLINE_ORACLE?.steps ?? 0,
    oracleState:      window.INLINE_ORACLE?.state ?? 'unknown',
    priorityHits:     Array.from(window.GOLDEN_PRIORITY_HITS || []),
    spawnCoverage:    window.GOLDEN_SPAWN?.coverage?.() ?? 0,
    scoutCoverage:    window.GOLDEN_SCOUT?.coverage?.() ?? 0,
    goldenPairs:      window.resonanceState?.goldenPairs ?? 0,
    totalDPs:         dpSample.length,
    recentDpSample:   dpSample
  };
});

console.log('  DPs captured       :', state.totalDPs);
console.log('  Oracle state       :', state.oracleState);
console.log('  Oracle confidence  :', (state.oracleConfidence * 100).toFixed(1) + '%');
console.log('  Oracle position    :', state.oraclePosition);
console.log('  Oracle steps       :', state.oracleSteps);
console.log('  Priority hits      :', state.priorityHits.join(' · '));
console.log('  Spawn coverage     :', (state.spawnCoverage * 100).toFixed(3) + '%');
console.log('  Scout coverage     :', (state.scoutCoverage * 100).toFixed(3) + '%');
console.log('  Golden pairs       :', state.goldenPairs);

fs.writeFileSync('./cassie-state-extracted.json', JSON.stringify(state, null, 2));
console.log('\n◊ state saved to ./cassie-state-extracted.json');

// Try Oracle 3 if up
console.log('\n◊ attempting Oracle 3 consultation…');
try {
  const r = await fetch(ORACLE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
    signal: AbortSignal.timeout(120000)
  });
  if (r.ok) {
    const advice = await r.json();
    console.log('◊ Oracle 3 responded\n');
    if (advice.orchestrator?.advice_for_simon) {
      console.log('═══════════════════════════════════════════════════════════════════');
      console.log('ORCHESTRATOR ADVICE');
      console.log('═══════════════════════════════════════════════════════════════════');
      console.log(advice.orchestrator.advice_for_simon);
    }
    fs.writeFileSync('./oracle3-advice.json', JSON.stringify(advice, null, 2));
    console.log('\n◊ full advice saved to ./oracle3-advice.json');
  } else {
    const txt = await r.text();
    console.log('  Oracle 3 returned HTTP', r.status, '·', txt.slice(0, 200));
  }
} catch (e) {
  console.log('  Oracle 3 not reachable:', e.message);
}

await browser.close();
console.log('\n◊ done · headless browser closed');
