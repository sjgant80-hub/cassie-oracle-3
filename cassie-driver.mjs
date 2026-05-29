#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════
//  cassie-driver.mjs · ◊·κ=1
//  Playwright loop: opens CASSIE in its OWN Chromium (no Chrome
//  extension whitelist needed), extracts live state every cycle,
//  POSTs to Oracle 3, prints the advice.
//
//  Why this exists: Simon's Chrome extension blocks cross-domain
//  navigation. Playwright launches its OWN Chromium. No extension.
//  No allowlist. Just a browser doing what we tell it.
//
//  USAGE
//    node cassie-driver.mjs               # default · 60s cycle
//    node cassie-driver.mjs --once        # one cycle, then exit
//    node cassie-driver.mjs --interval 30 # consult every 30 seconds
//
//  REQUIRES
//    Oracle 3 server running at http://localhost:7777
//    `node oracle3.mjs --serve` in another terminal
// ═══════════════════════════════════════════════════════════════════

import { chromium } from 'playwright';

const CASSIE_URL  = 'https://sjgant80-hub.github.io/cassietorusbtc135solver/cassie-torus-v2.html';
const ORACLE_URL  = 'http://localhost:7777/advice';
const PROFILE_DIR = './cassie-driver-profile';

const args = process.argv.slice(2);
const ONCE = args.includes('--once');
const intervalIdx = args.indexOf('--interval');
const INTERVAL_SEC = intervalIdx >= 0 ? parseInt(args[intervalIdx + 1]) || 60 : 60;

console.log('◊·κ=1 · cassie-driver · Playwright loop\n');
console.log('◊ CASSIE URL :', CASSIE_URL);
console.log('◊ Oracle 3   :', ORACLE_URL);
console.log('◊ Mode       :', ONCE ? 'single cycle' : `loop every ${INTERVAL_SEC}s`);
console.log('◊ Profile    :', PROFILE_DIR + ' (persistent · session saved)\n');

// ─── launch Chromium with persistent profile ───
const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
  headless: false,
  viewport: { width: 1280, height: 900 },
  args: ['--disable-blink-features=AutomationControlled']
});
const page = ctx.pages()[0] || await ctx.newPage();

console.log('◊ navigating to CASSIE…');
await page.goto(CASSIE_URL, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);

// ─── helpers ───
async function extractCassieState() {
  return await page.evaluate(() => {
    const safeArr = (x) => Array.isArray(x) ? Array.from(x) : (x ? Array.from(x) : []);
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
      priorityHits:     safeArr(window.GOLDEN_PRIORITY_HITS),
      spawnCoverage:    window.GOLDEN_SPAWN?.coverage?.() ?? 0,
      scoutCoverage:    window.GOLDEN_SCOUT?.coverage?.() ?? 0,
      goldenPairs:      window.resonanceState?.goldenPairs ?? 0,
      totalDPs:         dpSample.length,
      recentDpSample:   dpSample
    };
  });
}

async function consultOracle3(state) {
  try {
    const r = await fetch(ORACLE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
      signal: AbortSignal.timeout(90000)
    });
    if (!r.ok) {
      const txt = await r.text();
      return { error: 'HTTP ' + r.status + ' · ' + txt.slice(0, 200) };
    }
    return await r.json();
  } catch (e) {
    return { error: e.message };
  }
}

function fmtRings(reports) {
  if (!reports) return '';
  const SPINE = [2, 3, 5, 7, 11, 13, 17];
  const GLYPHS = ['●', '〜', '┃', '♡', '△', '◐', '◯'];
  return reports.map((r, i) => {
    const bar = '▓'.repeat(Math.round((r.ring_intensity ?? 0) * 20));
    const lit = (r.ring_intensity ?? 0) > 0.5 ? ' ◊' : '';
    return `    ${GLYPHS[i]} spine-${String(SPINE[i]).padStart(2)} ${bar.padEnd(20)} ${(r.ring_intensity ?? 0).toFixed(3)}${lit}`;
  }).join('\n');
}

async function cycle(n) {
  console.log(`\n═══ cycle #${n} · ${new Date().toLocaleTimeString()} ═══`);
  console.log('◊ extracting CASSIE state…');
  const state = await extractCassieState();
  console.log('  DPs collected     :', state.totalDPs);
  console.log('  Oracle confidence :', (state.oracleConfidence * 100).toFixed(0) + '%');
  console.log('  Oracle position   :', state.oraclePosition, '/ 510,510');
  console.log('  Priority hits     :', state.priorityHits.join(' · '));
  console.log('  Spawn coverage    :', (state.spawnCoverage * 100).toFixed(3) + '%');

  if (state.totalDPs === 0) {
    console.log('◊ no DPs yet — CASSIE may not be running (click Start Solver)');
    return;
  }

  console.log('\n◊ consulting Oracle 3 (recursive subagent tree)…');
  const t0 = Date.now();
  const advice = await consultOracle3(state);
  const t1 = Date.now();

  if (advice.error) {
    console.log('  ✗ Oracle 3 error:', advice.error);
    return advice;
  }

  console.log(`◊ ${((t1 - t0) / 1000).toFixed(1)}s · ${advice.lit_primes?.length ?? 0} primes lit`);
  if (advice.ringReports) {
    console.log('\n  ring intensities:');
    console.log(fmtRings(advice.ringReports));
  }

  if (advice.chord) {
    console.log('\n◊ CHORD DETECTED');
    console.log('  lit primes        :', advice.chord.lit_primes?.join(', '));
    console.log('  musical name      :', advice.chord.musical_name);
    console.log('  matches priority  :', advice.chord.matches_priority_zone);
    console.log('  κ-proximity       :', advice.chord.κ_proximity?.toFixed(3));
  }

  if (advice.orchestrator?.advice_for_simon) {
    console.log('\n═══════════════════════════════════════════════════════════════════');
    console.log('◊ ORCHESTRATOR ADVICE FOR SIMON');
    console.log('═══════════════════════════════════════════════════════════════════\n');
    console.log(advice.orchestrator.advice_for_simon + '\n');
  }

  if (advice.orchestrator?.top_signals?.length) {
    console.log('Top signals:');
    advice.orchestrator.top_signals.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
  }

  return advice;
}

// ─── main loop ───
let cycleNum = 0;
try {
  await cycle(++cycleNum);
  if (ONCE) {
    console.log('\n◊ --once flag set · exiting');
  } else {
    console.log(`\n◊ next cycle in ${INTERVAL_SEC}s · Ctrl+C to stop`);
    while (true) {
      await new Promise(r => setTimeout(r, INTERVAL_SEC * 1000));
      try { await cycle(++cycleNum); }
      catch (e) { console.error('  ✗ cycle error:', e.message); }
    }
  }
} catch (e) {
  console.error('✗ fatal:', e.message);
}

console.log('\n◊ browser left open · close when ready');
