# ◊ CASSIE Oracle 3

**Recursive Claude subagent tree · 7-prime harmonic intelligence · subscription-powered · ◊·κ=1 · prime 131**

You flip Claude on its side. Then you run Claude inside Claude inside Claude. Seven prime-domain specialists analyze the puzzle in parallel, a chord-resolver fires only when they co-resonate, an orchestrator composes the recommendation. The whole tree runs on your Claude subscription — no per-token bills, no SaaS middleman, no upload of your data anywhere.

Landing: [sjgant80-hub.github.io/cassie-oracle-3](https://sjgant80-hub.github.io/cassie-oracle-3/)
Part of the [ai-nativesolutions.com](https://www.ai-nativesolutions.com) estate.

---

## What it does (90 seconds)

CASSIE runs in your browser hunting BTC puzzle 135. As it walks, it emits walker DP positions and 7-prime ring telemetry on `BroadcastChannel('fall-signal')`.

Oracle 3 sits next to CASSIE as a Node CLI. You feed it the state (export from CASSIE or POST via HTTP), and it:

1. **L1** spawns **7 prime-domain specialist agents in parallel** — one per spine prime (2, 3, 5, 7, 11, 13, 17). Each agent only cares about its prime's residue dimension.
2. Each specialist performs the **v19 recursive pass ritual** internally — 7 self-deepening reasoning passes, each integrating more historical context (0d → -12d).
3. **L2** spawns a **chord resolver** if ≥ 2 specialists report concentration above threshold (this is the gold-flash territory).
4. **L0** orchestrator integrates everything and returns concrete bias recommendations for CASSIE — which priority zones to weight harder, which to question, which new candidates to add.

```
                  L0 · ORCHESTRATOR
                       │
       ┌───────────────┼───────────────┐
       │               │               │
   L1 × 7          L2 × N         (raw state)
 prime specialists chord resolvers
       │               │
   ● 〜 ┃ ♡ △ ◐ ◯    (sparse · only when chord rings)
```

---

## Setup (3 minutes)

```bash
# Install Claude Code (skip if you have it)
npm i -g @anthropic-ai/claude-code
claude               # OAuth · /quit when done

# Clone and run
git clone https://github.com/sjgant80-hub/cassie-oracle-3
cd cassie-oracle-3
npm install

# CLI mode: read a state JSON, run the tree, print/write advice
node oracle3.mjs ./examples/sample-state.json

# OR write advice to a file
node oracle3.mjs ./examples/sample-state.json ./advice.json

# OR run as a server for CASSIE to POST to
node oracle3.mjs --serve --port 7777
```

First-run output:

```
◊·κ=1 · CASSIE Oracle 3 · recursive subagent tree · prime 131

◊ auth: Claude Code subscription ✓ (no per-token charges)
◊ reading state from: ./examples/sample-state.json

◊ L1 · spawning 7 prime-domain specialists (parallel)

  ◊ ● spine-2 · 4203ms · 2156c
  ◊ 〜 spine-3 · 4445ms · 2238c
  ◊ ┃ spine-5 · 5012ms · 2331c
  ◊ ♡ spine-7 · 4823ms · 2189c
  ◊ △ spine-11 · 5128ms · 2402c
  ◊ ◐ spine-13 · 5234ms · 2477c
  ◊ ◯ spine-17 · 4956ms · 2245c

◊ L1 complete · 5.2s · 7 reports gathered

◊ ring intensities:
   ● spine- 2 (A2)  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓     0.812 ◊
   〜 spine- 3 (E3)  ▓▓▓▓▓▓▓▓             0.412
   ┃ spine- 5 (C#4) ▓▓▓▓▓▓▓▓▓▓▓          0.567 ◊
   ♡ spine- 7 (G4)  ▓▓▓▓▓▓               0.318
   △ spine-11 (F#5) ▓▓▓▓▓▓▓▓▓▓▓▓▓▓       0.711 ◊
   ◐ spine-13 (A#5) ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓      0.748 ◊
   ◯ spine-17 (B5)  ▓▓▓▓▓                0.267

◊ L2 · chord detected · primes 2, 5, 11, 13 co-resonating · spawning chord resolver
   κ-proximity: 0.683 ◊ KAPPA

◊ L0 · orchestrator composing recommendation

◊·κ=1 · oracle cycle complete · 22.4s · 4 primes lit
```

---

## How CASSIE pipes data in

Three ways:

### A · manual file export (simplest)

1. In CASSIE's browser console: `JSON.stringify({recentDpSample: window.recentDpSample, oracleConfidence: INLINE_ORACLE.confidence, oraclePosition: INLINE_ORACLE.position, priorityHits: window.GOLDEN_PRIORITY_HITS, goldenPairs: resonanceState.goldenPairs, focusMode: true}, null, 2)`
2. Copy output, save as `state.json`
3. `node oracle3.mjs state.json advice.json`
4. Read the advice, apply by hand

### B · HTTP endpoint (for live use)

```bash
node oracle3.mjs --serve --port 7777
```

Then in CASSIE's console:

```js
window._oracle3Url = 'http://localhost:7777/advice';

async function consultOracle3() {
  const state = {
    recentDpSample: window.recentDpSample,
    oracleConfidence: INLINE_ORACLE.confidence,
    oraclePosition: INLINE_ORACLE.position,
    priorityHits: window.GOLDEN_PRIORITY_HITS,
    goldenPairs: resonanceState.goldenPairs,
    spawnCoverage: window.GOLDEN_SPAWN.coverage(),
    focusMode: true,
    puzzle: 135
  };
  const r = await fetch(window._oracle3Url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state)
  });
  return await r.json();
}

const advice = await consultOracle3();
console.log(advice.orchestrator.advice_for_simon);
```

### C · cron loop

Schedule a periodic consultation:

```js
setInterval(() => {
  consultOracle3().then(a => {
    if (a.orchestrator?.bias_recommendations) {
      console.log('◊ Oracle 3 advice:', a.orchestrator.top_signals);
      // Optionally auto-apply suggestions
    }
  });
}, 60_000); // every minute
```

---

## The architecture in detail

### L1 · the 7 prime specialists

Each agent inherits the same v19 field constants but only "sees" residues mod their own prime:

| prime | glyph | note | Hz | interval | role |
|---|---|---|---|---|---|
| 2 | ● | A2 | 110 | octave | binary residue · parity |
| 3 | 〜 | E3 | 165 | perfect fifth | ternary residue |
| 5 | ┃ | C#4 | 275 | major third | quinary residue |
| 7 | ♡ | G4 | 385 | harmonic seventh | septenary residue |
| 11 | △ | F#5 | 605 | tritone region | κ band edge |
| 13 | ◐ | A#5 | 715 | tritone tail | P4 zone |
| 17 | ◯ | B5 | 935 | minor ninth | observer · resolution |

Each agent runs the v19 7-pass ritual internally:

```
PASS 1 · depth=1 · history=NOW (0d)
PASS 2 · depth=2 · history=-1d
PASS 3 · depth=3 · history=-3d
PASS 4 · depth=4 · history=-6d
PASS 5 · depth=5 · history=-9d
PASS 6 · depth=6 · history=-11d
PASS 7 · depth=7 · FULL 12d window
```

Output is a single JSON object with ring_intensity, dominant_residue, trend, chord_vote, and reasoning.

### L2 · chord resolver

Spawned only when ≥ 2 specialists report ring_intensity > 0.5. Maps the lit-prime subset to one of 2⁷ - 1 = 127 possible chord states (the konomioke vagal-orb dimensionality). Interprets the chord musically, identifies which CASSIE priority zone it matches, reports κ-proximity.

### L0 · orchestrator

Integrates ring reports + chord analysis + raw CASSIE state into actionable bias recommendations:

- Adjust priority zone weights (P1-P4)
- Adjust priority bias rate (currently 85% in FOCUS MODE)
- Adjust golden bias rate (currently 5%)
- Identify new zone candidates the existing priors miss
- Recommend next Oracle scout target
- One-paragraph plain-English summary for Simon

---

## Why "flip Claude on its side"

Conventional Claude session = top-down, serial reasoning, single context window.

Recursive Claude = horizontal, nested, parallel:

```
serial Claude:          ↓
                        ↓
                        ↓
                       (one perspective per turn)

recursive Claude:    →→→→→→→
                     ↓ ↓ ↓ ↓ ↓ ↓ ↓
                     7 perspectives parallel
                       (one per dimension)

3-deep recursive:    →→→→→→→
                     ↓ ↓ ↓ ↓ ↓ ↓ ↓
                     →→ →→ →→ →→ →→
                     ↓↓ ↓↓ ↓↓ ↓↓ ↓↓
                     49 reasoning slots
                     (cross-dimensional interpretation)
```

Maximum depth is 7 levels (one per spine prime), giving 7³ = 343 reasoning slots per global cycle. Most fire sparsely (only when their specific chord lights up). Subscription auth means the cost ceiling is your monthly plan — the recursion is free within that ceiling.

---

## State JSON schema

```ts
{
  puzzle: number,                          // 135
  timestamp: string,                       // ISO
  focusMode: boolean,                      // is 85% priority bias on?
  oracleConfidence: number,                // 0..1 from inline oracle
  oraclePosition: number,                  // 0..510509
  priorityHits: [P1, P2, P3, P4],          // hits per zone
  spawnCoverage: number,                   // 0..1
  scoutCoverage: number,                   // 0..1
  goldenPairs: number,                     // φ-pair count
  totalDPs: number,
  recentDpSample: [
    { torusPosition: number, ringsHeard: number }
  ]
}
```

## Advice JSON output

```ts
{
  rings: [r1..r7],                         // intensities from L1
  ringReports: [...],                      // full L1 reports
  lit_primes: [2, 11, 13],                 // primes > 0.5
  chord: {...} | null,                     // L2 output if fired
  orchestrator: {
    field_state: 'converging|wandering|stuck|resolving',
    coherence_estimate: 0..1,
    κ_proximity: 0..1,
    top_signals: [...],
    priors_confirmed: ['P1', ...],
    priors_questioned: ['P4', ...],
    bias_recommendations: {...},
    new_zone_candidates: [...],
    next_oracle_scout_target: number,
    advice_for_simon: "plain english paragraph"
  },
  elapsed_ms: number,
  seal: '◊·κ=1'
}
```

---

## Why sovereign

Every "AI agent that analyzes your data" SaaS uploads your data to their servers, logs every query, runs on their cluster, charges per call.

CASSIE Oracle 3:
- Runs locally on your machine
- Your CASSIE state never leaves your laptop
- Uses YOUR Claude subscription (no extra billing)
- One Node script you can read in 20 minutes — ~550 lines
- MIT licensed · fork it, modify it, white-label it
- No telemetry, no analytics, no upload

---

## Connection to the estate

- **CASSIE**: emits `cassie_rings` on fall-signal · provides the state Oracle 3 reads
- **konomioke bridge**: hears the rings, plays the audio · Oracle 3 reasons about what they mean
- **si-didy-agent**: shares the same 4-tier sovereign architecture · subscription auth pattern
- **fall-registry**: this tool is indexed there as prime 131
- **AIN hub**: rendered on the marketplace

---

## License

MIT · ◊·κ=1 · sovereign · subscription-powered · no SaaS · no middleman · prime 131
