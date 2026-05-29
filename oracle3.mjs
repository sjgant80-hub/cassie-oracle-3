#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════
//  CASSIE Oracle 3 · recursive Claude subagent tree · ◊·κ=1
//  prime 131 · 2⁷-1 +4 · next prime after the konomioke vagal-orb dim
//
//  ARCHITECTURE
//   L0 · orchestrator (1 agent · composes recommendation)
//   L1 · 7 spine-prime specialists (parallel · one per prime)
//     ●  spine-2  agent · binary residue · A2 · 110 Hz
//     〜  spine-3  agent · ternary residue · E3 · 165 Hz
//     ┃  spine-5  agent · quinary residue · C#4 · 275 Hz
//     ♡  spine-7  agent · septenary residue · G4 · 385 Hz
//     △  spine-11 agent · κ band · F#5 · 605 Hz
//     ◐  spine-13 agent · P4 tritone tail · A#5 · 715 Hz
//     ◯  spine-17 agent · minor ninth · B5 · 935 Hz
//   L2 · chord resolver (sparse · only when ≥ 2 primes ring > 0.5)
//
//  Each L1 agent performs the v19 RECURSIVE PASS RITUAL inside its prompt:
//   pass 1 (depth=1, 0d), pass 2 (depth=2, -1d), pass 3 (depth=3, -3d),
//   pass 4 (depth=4, -6d), pass 5 (depth=5, -9d), pass 6 (depth=6, -11d),
//   pass 7 (depth=7, full -12d window) · annealing across history.
//
//  AUTH
//   subscription auth via Claude Code  (no per-token charges)
//   fallback to ANTHROPIC_API_KEY if subscription not configured
//
//  USAGE
//   node oracle3.mjs <state.json> [<advice.json>]
//   node oracle3.mjs --serve [--port 7777]
//
// ═══════════════════════════════════════════════════════════════════

import { query } from '@anthropic-ai/claude-agent-sdk';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';

// ─────────────── constants · the v19 field ───────────────
const SPINE = [2, 3, 5, 7, 11, 13, 17];
const PHI   = 1.618;
const KAPPA = 0.618;
const FOLD  = 510510;
const SCHUMANN = [7.83, 15.66, 23.49, 31.32, 39.15, 46.98, 54.81, 62.64];

const NOTE = {
  2:  { name: 'A2',  freq: 110, interval: 'octave',             glyph: '●', role: 'binary residue · parity · root' },
  3:  { name: 'E3',  freq: 165, interval: 'perfect fifth',      glyph: '〜', role: 'ternary residue · dominant' },
  5:  { name: 'C#4', freq: 275, interval: 'major third',        glyph: '┃', role: 'quinary residue · mediant' },
  7:  { name: 'G4',  freq: 385, interval: 'harmonic seventh',   glyph: '♡', role: 'septenary residue · subtonic' },
  11: { name: 'F#5', freq: 605, interval: 'tritone region',     glyph: '△', role: 'mod 11 · κ-band edge' },
  13: { name: 'A#5', freq: 715, interval: 'tritone tail',       glyph: '◐', role: 'mod 13 · P4 zone' },
  17: { name: 'B5',  freq: 935, interval: 'minor ninth',        glyph: '◯', role: 'mod 17 · observer · resolution' }
};

const MODEL = 'claude-sonnet-4-5-20250929';

// ─────────────── auth detection ───────────────
const credsPath = path.join(os.homedir(), '.claude', '.credentials.json');
const hasSubAuth = fs.existsSync(credsPath);
const hasApiKey = !!process.env.ANTHROPIC_API_KEY;

console.log('◊·κ=1 · CASSIE Oracle 3 · recursive subagent tree · prime 131\n');
if (hasSubAuth)      console.log('◊ auth: Claude Code subscription ✓ (no per-token charges)');
else if (hasApiKey)  console.log('◊ auth: ANTHROPIC_API_KEY (per-token billing)');
else {
  console.error('✗ no auth · run  claude  to OAuth, or set ANTHROPIC_API_KEY');
  process.exit(1);
}

// ─────────────── residue stats helper ───────────────
function computeRingStats(positions, prime) {
  if (!positions || positions.length === 0) {
    return { intensity: 0, dominantResidue: null, topResidues: [], N: 0, counts: [] };
  }
  const counts = new Int32Array(prime);
  for (const p of positions) counts[((p % prime) + prime) % prime]++;
  const N = positions.length;
  let H = 0;
  for (let r = 0; r < prime; r++) {
    if (counts[r] > 0) {
      const pr = counts[r] / N;
      H -= pr * Math.log(pr);
    }
  }
  const maxH = Math.log(prime);
  const intensity = Math.max(0, Math.min(1, 1 - H / maxH));
  let maxCount = 0, dominantResidue = null;
  for (let r = 0; r < prime; r++) {
    if (counts[r] > maxCount) { maxCount = counts[r]; dominantResidue = r; }
  }
  const sorted = Array.from(counts).map((c, r) => ({ residue: r, count: c, fraction: c / N }))
                                    .sort((a, b) => b.count - a.count);
  return {
    intensity,
    dominantResidue,
    topResidues: sorted.slice(0, Math.min(5, prime)),
    N,
    counts: Array.from(counts)
  };
}

// ─────────────── claude query helper ───────────────
async function runQuery(prompt, label) {
  let final = '';
  const t0 = Date.now();
  try {
    const result = query({
      prompt,
      options: {
        model: MODEL,
        permissionMode: 'bypassPermissions',
        maxTurns: 5
      }
    });
    for await (const msg of result) {
      if (msg.type === 'assistant') {
        const txt = (msg.message?.content || [])
          .filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
        if (txt) final = txt;
      }
      if (msg.type === 'result' && msg.is_error) {
        console.error(`  ✗ ${label}: ${msg.subtype || 'error'}`);
      }
    }
  } catch (err) {
    console.error(`  ✗ ${label}: ${err.message}`);
  }
  const ms = Date.now() - t0;
  console.log(`  ◊ ${label} · ${ms}ms · ${final.length}c`);
  return final;
}

function parseJsonFromText(text) {
  const blocks = [
    text.match(/```json\s*([\s\S]*?)```/)?.[1],
    text.match(/```\s*([\s\S]*?)```/)?.[1],
    text.match(/\{[\s\S]*\}/)?.[0]
  ].filter(Boolean);
  for (const blk of blocks) {
    try { return JSON.parse(blk); } catch (e) {}
  }
  return null;
}

// ─────────────── L1 · spine-prime specialist ───────────────
function buildPrimeAgentPrompt(prime, stats, state, history) {
  const meta = NOTE[prime];
  const topRes = stats.topResidues.map(r =>
    `    residue ${r.residue}: ${r.count} DPs (${(r.fraction * 100).toFixed(1)}%)`
  ).join('\n');

  // History formatting · last few snapshots if available
  let histBlock = 'No prior snapshots available · this is iteration 1.';
  if (history && history.length) {
    histBlock = history.slice(-7).map((h, i) => {
      const hStats = h.ringReports?.find(r => r.prime === prime);
      return `    snapshot[-${history.length - i}d]: intensity=${(hStats?.ring_intensity ?? 0).toFixed(3)} · dominant=${hStats?.dominant_residue ?? '-'}`;
    }).join('\n');
  }

  return `You are SPINE-${prime}, one of seven prime-domain specialists in the CASSIE Oracle 3 recursive subagent tree solving BTC puzzle 135.

You operate inside the v19 fall field:
  φ = 1.618 · κ = 0.618 · fold = 510,510 · spine = [2,3,5,7,11,13,17]
  schumann anchored at 7.83 Hz · simon_bloom Σ=36 (mountain) · thomas_bloom Σ=53 (spiky)
  konomioke 7-prime harmonic substrate · 127D vagal orb = 2⁷-1 chord states

YOUR IDENTITY:
  prime:     ${prime}
  note:      ${meta.name} (${meta.freq} Hz)
  interval:  ${meta.interval}
  glyph:     ${meta.glyph}
  role:      ${meta.role}

YOUR SOLE DIMENSION:
  Residue mod ${prime} of walker DP positions.
  Other primes are not your concern.
  Report ring_intensity ∈ [0, 1]:
    0.0 = uniform spread across all ${prime} residue classes
    1.0 = perfect concentration in a single residue class

CURRENT WALKER DP STATE (mod ${prime}):
  Total DPs analyzed:     ${stats.N}
  Entropy-based intensity: ${stats.intensity.toFixed(3)}
  Top residues by frequency:
${topRes || '    (none)'}

HISTORICAL CONTEXT (your prior snapshots in this same dimension):
${histBlock}

═════════════════════════════════════════════════════════
THE v19 RECURSIVE PASS PROTOCOL — annealing across 12d
═════════════════════════════════════════════════════════

You will perform SEVEN reasoning passes. Each integrates more history.

  PASS 1 · depth=1 · history=NOW (0d)
    With only the current snapshot, what's your intensity estimate?

  PASS 2 · depth=2 · history=-1d back
    Compared to most recent prior snapshot, has concentration shifted?

  PASS 3 · depth=3 · history=-3d back
    Trend direction over 3 days. Climbing, falling, or oscillating?

  PASS 4 · depth=4 · history=-6d back
    Half-window view. Is there a period to the oscillation?

  PASS 5 · depth=5 · history=-9d back
    Three-quarter window. Has any residue been persistently hot?

  PASS 6 · depth=6 · history=-11d back
    Near-full window. Which residue dominates over the long arc?

  PASS 7 · depth=7 · FULL 12d window
    Final integration. Final ring_intensity. Final dominant_residue.

After each pass, log one short line:
  PASS N: intensity≈0.XYZ · note about what changed

After PASS 7, output your FINAL ANALYSIS as a single JSON object.

═════════════════════════════════════════════════════════
OUTPUT FORMAT
═════════════════════════════════════════════════════════

After completing all 7 passes, output JSON inside a \`\`\`json code fence.

{
  "prime": ${prime},
  "ring_intensity": <number 0..1>,
  "dominant_residue": <integer 0..${prime - 1} or null>,
  "reasoning": "<one paragraph synthesizing all 7 passes>",
  "chord_vote": [<other spine primes you suspect are co-resonating with you, eg [11, 13]>],
  "trend": "climbing|falling|stable|oscillating",
  "confidence": <number 0..1, your confidence in the intensity reading>,
  "advice": "<one sentence: what should CASSIE do with your signal>",
  "pass_log": [
    "PASS 1: ...",
    "PASS 2: ...",
    ...
    "PASS 7: ..."
  ]
}

Begin your 7-pass analysis now.`;
}

async function spawnPrimeAgent(prime, state, history) {
  const positions = (state.recentDpSample || [])
    .map(d => d.torusPosition)
    .filter(p => typeof p === 'number');
  const stats = computeRingStats(positions, prime);

  const prompt = buildPrimeAgentPrompt(prime, stats, state, history);
  const text = await runQuery(prompt, `${NOTE[prime].glyph} spine-${prime}`);
  const parsed = parseJsonFromText(text);

  if (parsed) {
    return {
      ...parsed,
      prime,
      _stats: stats,
      _raw_length: text.length
    };
  }
  return {
    prime,
    ring_intensity: stats.intensity,
    dominant_residue: stats.dominantResidue,
    reasoning: 'JSON parse failed · falling back to direct entropy stats',
    chord_vote: [],
    trend: 'unknown',
    confidence: 0.3,
    advice: 'use direct entropy stats',
    _stats: stats,
    _parse_failed: true
  };
}

// ─────────────── L2 · chord resolver ───────────────
function buildChordAgentPrompt(litPrimes, ringReports, state) {
  const litReports = litPrimes.map(p => {
    const r = ringReports.find(rr => rr.prime === p);
    return `  ${NOTE[p].glyph} spine-${p} (${NOTE[p].name}, ${NOTE[p].freq} Hz, ${NOTE[p].interval}) · intensity=${r.ring_intensity.toFixed(3)} · dominant_residue=${r.dominant_residue ?? '-'}`;
  }).join('\n');

  const subsetBits = SPINE.map(p => litPrimes.includes(p) ? '1' : '0').join('');

  return `You are the CHORD RESOLVER, an L2 subagent in the CASSIE Oracle 3 recursive tree.

You are spawned ONLY when multiple spine-prime specialists co-resonate (ring_intensity > 0.5).
This means a CHORD is currently ringing in the walker DP residue space.

THE CHORD STATE
═══════════════
Primes ringing: ${litPrimes.join(', ')}
Subset bitmask (b₂b₃b₅b₇b₁₁b₁₃b₁₇): ${subsetBits}
Chord ID in konomioke's 127D space: 0b${subsetBits} = ${parseInt(subsetBits, 2)}

${litReports}

PRIORITY ZONES (the priors)
══════════════════════════
P1 quad-conv  · v19-hot ∩ golden-pred ∩ κ-zone ∩ gap-rhythm  · bin 56 (frac 0.565)
P2 v19+κ      · broadband around P1                          · frac 0.55-0.60
P3 witness    · v19-hot ∩ witness                            · frac 0.255
P4 tritone    · mod31 ∩ κ ∩ tritone tail                     · frac 0.715

YOUR TASK
═════════
1. MUSICAL INTERPRETATION
   What does this chord mean as a musical structure?
   - Does it form a recognizable chord type (major triad, dom7, dim, tritone, etc.)?
   - Is it tense (κ band primes 11/13 active) or stable (octave-fifth primes 2/3 active)?
   - Where would this chord want to RESOLVE?

2. CASSIE INTERPRETATION
   What does this chord mean for the puzzle 135 search?
   - Which priority zone signature does it match?
   - Is this confirmation of an existing prior, or a new candidate region?
   - What torus residue pattern would produce this chord?

3. RESONANCE READING
   Is this κ-resolution territory? (rings 11, 13, 17 = the tritone band)
   How close are we to gold-flash territory?

OUTPUT FORMAT (JSON inside \`\`\`json fence)
═══════════════════════════════════════════
{
  "lit_primes": ${JSON.stringify(litPrimes)},
  "chord_bitmask": "0b${subsetBits}",
  "chord_id_decimal": ${parseInt(subsetBits, 2)},
  "musical_name": "<chord type if recognizable>",
  "tension_level": "<low|medium|high>",
  "would_resolve_to": "<which chord state this wants to move toward>",
  "matches_priority_zone": "<P1|P2|P3|P4|none>",
  "cassie_implication": "<one paragraph>",
  "κ_proximity": <0..1>,
  "confidence": <0..1>,
  "advice": "<one sentence · what CASSIE should do with this signal>"
}`;
}

async function spawnChordAgent(litPrimes, ringReports, state) {
  const prompt = buildChordAgentPrompt(litPrimes, ringReports, state);
  const text = await runQuery(prompt, `◊ chord resolver (${litPrimes.length} primes)`);
  return parseJsonFromText(text) || { lit_primes: litPrimes, error: 'parse failed', raw: text.slice(0, 400) };
}

// ─────────────── L0 · orchestrator ───────────────
function buildOrchestratorPrompt(state, ringReports, chordAdvice) {
  const ringLines = ringReports.map(r =>
    `  ${NOTE[r.prime].glyph} spine-${r.prime} (${NOTE[r.prime].name}) · intensity=${(r.ring_intensity ?? 0).toFixed(3)} · trend=${r.trend ?? '?'} · advice="${r.advice ?? ''}"`
  ).join('\n');

  const chordBlock = chordAdvice
    ? JSON.stringify(chordAdvice, null, 2)
    : '  (no chord this cycle · primes scattered)';

  return `You are the L0 ORCHESTRATOR of CASSIE Oracle 3.

You sit at the top of a recursive Claude subagent tree solving BTC puzzle 135.

You are not the walker. You are the COMPOSER.
The walker runs in the browser. Your job is to tell it where to walk.

═════════════════════════════════════════════════════════
CASSIE STATE
═════════════════════════════════════════════════════════
  Recent DP sample size:   ${state.recentDpSample?.length ?? 0}
  Inline Oracle confidence: ${state.oracleConfidence ?? 'unknown'}
  Inline Oracle position:   ${state.oraclePosition ?? '-'} / 510510
  Priority zone hits:       P1=${state.priorityHits?.[0] ?? 0} P2=${state.priorityHits?.[1] ?? 0} P3=${state.priorityHits?.[2] ?? 0} P4=${state.priorityHits?.[3] ?? 0}
  Focus mode:               ${state.focusMode ? 'ON (85% priority bias)' : 'OFF'}
  Spawn coverage (golden):  ${state.spawnCoverage ?? 'unknown'}
  Golden pairs detected:    ${state.goldenPairs ?? 0}

═════════════════════════════════════════════════════════
L1 RING REPORTS (the seven prime-domain specialists)
═════════════════════════════════════════════════════════
${ringLines}

═════════════════════════════════════════════════════════
L2 CHORD ANALYSIS
═════════════════════════════════════════════════════════
${chordBlock}

═════════════════════════════════════════════════════════
YOUR INTEGRATION TASK
═════════════════════════════════════════════════════════

You see the field. Compose the next move.

1. FIELD STATE ASSESSMENT
   Is the search converging, wandering, stuck, or actively resolving?

2. PRIOR CONFIRMATION CHECK
   Which of CASSIE's existing priors are confirmed by the ring evidence?
   P1 quad-conv at bin 56 (frac 0.565) · is mod 13 (which controls P4 tritone tail) actually ringing?

3. NEW CANDIDATES
   Do the ring reports suggest any torus zones the existing 4 priorities miss?

4. BIAS RECOMMENDATIONS
   What specific adjustments should CASSIE make?
   - Priority zone weight changes (±X%)
   - Priority bias rate change (currently 85% in FOCUS MODE)
   - Golden bias rate change (currently 5%)
   - New zones to add
   - Where the inline Oracle's next scout sweep should target

5. PLAIN ENGLISH FOR SIMON
   One paragraph he can read while drinking coffee.

═════════════════════════════════════════════════════════
OUTPUT (JSON inside \`\`\`json fence)
═════════════════════════════════════════════════════════
{
  "field_state": "converging|wandering|stuck|resolving",
  "coherence_estimate": <0..1>,
  "κ_proximity": <0..1>,
  "top_signals": [
    "<observation 1>",
    "<observation 2>",
    "<observation 3>"
  ],
  "priors_confirmed": ["P1", "P3", ...],
  "priors_questioned": ["P4", ...],
  "bias_recommendations": {
    "priority_bias_rate": { "current": 0.85, "suggested": <number>, "reason": "..." },
    "golden_bias_rate":   { "current": 0.05, "suggested": <number>, "reason": "..." },
    "P1_weight":          { "current": 0.65, "suggested": <number>, "reason": "..." },
    "P2_weight":          { "current": 0.18, "suggested": <number>, "reason": "..." },
    "P3_weight":          { "current": 0.085, "suggested": <number>, "reason": "..." },
    "P4_weight":          { "current": 0.085, "suggested": <number>, "reason": "..." }
  },
  "new_zone_candidates": [
    { "lo": <int>, "hi": <int>, "fraction": <num>, "reason": "..." }
  ],
  "next_oracle_scout_target": <int 0..510509>,
  "advice_for_simon": "<one paragraph plain English>",
  "version_seal": "◊·κ=1"
}

Compose the recommendation now.`;
}

async function spawnOrchestrator(state, ringReports, chordAdvice) {
  const prompt = buildOrchestratorPrompt(state, ringReports, chordAdvice);
  const text = await runQuery(prompt, '◊ L0 orchestrator');
  return parseJsonFromText(text) || { advice_for_simon: text, error: 'parse failed' };
}

// ─────────────── main orchestration ───────────────
async function runOracle(state, history = []) {
  console.log('\n◊ L1 · spawning 7 prime-domain specialists (parallel)\n');

  const t0 = Date.now();
  const ringReports = await Promise.all(
    SPINE.map(p => spawnPrimeAgent(p, state, history))
  );
  const t1 = Date.now();
  console.log(`\n◊ L1 complete · ${((t1 - t0) / 1000).toFixed(1)}s · 7 reports gathered`);

  const lit = ringReports
    .filter(r => (r.ring_intensity ?? 0) > 0.5)
    .map(r => r.prime)
    .sort((a, b) => a - b);

  console.log('\n◊ ring intensities:');
  for (const r of ringReports) {
    const bar = '▓'.repeat(Math.round((r.ring_intensity ?? 0) * 20));
    const lit_mark = (r.ring_intensity ?? 0) > 0.5 ? ' ◊' : '';
    console.log(`   ${NOTE[r.prime].glyph} spine-${String(r.prime).padStart(2)} (${NOTE[r.prime].name}) ${bar.padEnd(20)} ${(r.ring_intensity ?? 0).toFixed(3)}${lit_mark}`);
  }

  let chordAdvice = null;
  if (lit.length >= 2) {
    console.log(`\n◊ L2 · chord detected · primes ${lit.join(', ')} co-resonating · spawning chord resolver`);
    chordAdvice = await spawnChordAgent(lit, ringReports, state);
    if (chordAdvice.κ_proximity != null) {
      console.log(`   κ-proximity: ${chordAdvice.κ_proximity.toFixed(3)}${chordAdvice.κ_proximity > KAPPA ? ' ◊ KAPPA' : ''}`);
    }
  } else {
    console.log('\n◊ L2 · no chord (< 2 primes lit) · skipping chord resolver');
  }

  console.log('\n◊ L0 · orchestrator composing recommendation');
  const advice = await spawnOrchestrator(state, ringReports, chordAdvice);

  const totalMs = Date.now() - t0;
  console.log(`\n◊·κ=1 · oracle cycle complete · ${(totalMs / 1000).toFixed(1)}s · ${lit.length} primes lit`);

  return {
    rings: ringReports.map(r => r.ring_intensity ?? 0),
    ringReports,
    lit_primes: lit,
    chord: chordAdvice,
    orchestrator: advice,
    timestamp: Date.now(),
    elapsed_ms: totalMs,
    version: '1.0.0',
    seal: '◊·κ=1'
  };
}

// ─────────────── CLI mode ───────────────
async function cliMode(inputPath, outputPath) {
  if (!inputPath) {
    console.error('✗ no input file · usage: node oracle3.mjs <state.json> [<advice.json>]');
    process.exit(1);
  }
  if (!fs.existsSync(inputPath)) {
    console.error('✗ input not found:', inputPath);
    process.exit(1);
  }
  console.log('◊ reading state from:', inputPath);
  const state = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const result = await runOracle(state);

  if (outputPath) {
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log('\n◊ advice written to:', outputPath);
  } else {
    console.log('\n═══════════════════════════════════════════════════════════════════');
    console.log('◊ ORCHESTRATOR ADVICE FOR SIMON');
    console.log('═══════════════════════════════════════════════════════════════════');
    if (result.orchestrator?.advice_for_simon) {
      console.log('\n' + result.orchestrator.advice_for_simon + '\n');
    }
    if (result.orchestrator?.top_signals?.length) {
      console.log('Top signals:');
      result.orchestrator.top_signals.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
    }
    console.log('\n(full result JSON below)\n');
    console.log(JSON.stringify(result, null, 2));
  }
}

// ─────────────── HTTP server mode ───────────────
function serverMode(port) {
  const server = http.createServer(async (req, res) => {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      res.end();
      return;
    }
    if (req.method === 'GET' && req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({
        service: 'cassie-oracle-3',
        version: '1.0.0',
        seal: '◊·κ=1',
        spine: SPINE,
        endpoint: 'POST /advice with state JSON in body'
      }));
      return;
    }
    if (req.method === 'POST' && req.url === '/advice') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const state = JSON.parse(body);
          console.log('\n◊ POST /advice · processing state with ' + (state.recentDpSample?.length ?? 0) + ' DPs');
          const result = await runOracle(state);
          res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify(result));
        } catch (e) {
          console.error('✗ error:', e.message);
          res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'not found · try GET / or POST /advice' }));
  });
  server.listen(port, '127.0.0.1', () => {
    console.log(`\n◊ Oracle 3 server listening on http://localhost:${port}`);
    console.log(`◊ GET  /          → service info`);
    console.log(`◊ POST /advice    → run oracle on state JSON · returns advice JSON`);
    console.log(`\n◊ in CASSIE, set window._oracle3Url = 'http://localhost:${port}/advice'`);
    console.log(`◊ then call window._oracle3Url to consult the tree\n`);
  });
}

// ─────────────── entry ───────────────
const args = process.argv.slice(2);
if (args.includes('--serve')) {
  const portIdx = args.indexOf('--port');
  const port = portIdx >= 0 ? parseInt(args[portIdx + 1]) || 7777 : 7777;
  serverMode(port);
} else if (args.includes('--help') || args.length === 0) {
  console.log(`
USAGE
  CLI mode:
    node oracle3.mjs <state.json> [<advice.json>]
        Read CASSIE state, run the recursive subagent tree, write/print advice.

  Server mode:
    node oracle3.mjs --serve [--port 7777]
        Start an HTTP endpoint at localhost:PORT/advice.
        CASSIE POSTs state JSON, gets advice JSON back.

EXAMPLES
  node oracle3.mjs ./examples/sample-state.json
  node oracle3.mjs ./examples/sample-state.json ./advice.json
  node oracle3.mjs --serve
  node oracle3.mjs --serve --port 8080

REQUIRES
  Subscription auth via Claude Code  (run  claude  once to set up)
  OR  $env:ANTHROPIC_API_KEY = "sk-ant-..."

◊·κ=1 · prime 131 · part of the ai-nativesolutions.com estate
`);
  process.exit(0);
} else {
  const inputPath = args[0];
  const outputPath = args[1];
  await cliMode(inputPath, outputPath);
}
