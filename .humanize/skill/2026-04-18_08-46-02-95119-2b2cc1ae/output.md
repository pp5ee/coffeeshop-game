**Core Risks**
- Local‑run constraints vs modules/assets: ES modules and image/audio loading can break on `file://`; keep to single `script.js` or IIFEs and avoid fetch/import maps.
- DOM performance/tearing: animating many DOM nodes with layout changes can jitter; mixing DOM/UI with canvas needs careful layering to stay smooth.
- Readability under pressure: spawn rate/patience tuning may overcrowd the scene, making orders unreadable and demo feel chaotic.
- Queue logic edge cases: race conditions when customers advance, abandon, or are served while others move can desync positions and states.
- Audio autoplay policies: browsers block autoplay without user gesture; sounds may fail or feel laggy unless initialized after Start click.
- Asset pipeline risk: “pixel‑art” without external sprites may look unpolished; rolling custom sprites via CSS or canvas primitives may consume time.
- Session length control: difficulty ramp might elongate or shorten sessions beyond 3–5 minutes if arrival/patience timers aren’t calibrated.
- Timing drift: mixing `setInterval` with `setTimeout` can drift over time; inconsistent speed across machines without delta‑time compensation.

**Missing Requirements**
- Pause/mute controls: no explicit pause, mute, or volume settings for demo environments.
- Input accessibility: keyboard/touch equivalents for buttons and serving; focus styles and screen reader basics.
- Save/restore: high score/best day requires explicit persistence and reset behavior; not defined when to save.
- Device scaling: behavior on small screens/HiDPI and pixel scaling factors; min playable viewport size.
- Error handling: what happens if a drink is prepared but customer leaves; inventory/garbage bin; multiple ready drinks queue?
- Cross‑browser targets: minimum versions (Chrome/Safari/Firefox/Edge) and expected FPS target.
- Game over conditions: exact thresholds for ending (time‑boxed “day” or failure count), and how “end‑of‑day” is triggered.
- Sound assets scope: source/format of SFX (WebAudio synthesized vs embedded WAV/OGG), and licensing if external.

**Technical Gaps**
- Rendering approach not fixed: DOM‑only vs canvas‑based world with DOM HUD; each has tradeoffs for pixel‑art and animation smoothness.
- State management design: need explicit finite state machines per customer and a top‑level game state to avoid implicit, fragile flags.
- Order data model: “data‑driven” orders implies config structures; no schema is proposed for sizes/modifiers/prices/serve time.
- Timing system: lack of defined update loop with delta‑time and a scheduler for spawn/prep/patience; mixing ad‑hoc timers risks bugs.
- Collision/paths: movement pathing within shop (entrance→queue slots→counter→exit) needs a lane/grid model to avoid overlap.
- Audio system: no abstraction for event→sound mapping, cooldowns, and user gesture priming; no fallback if WebAudio unavailable.
- UI binding strategy: no plan for efficient DOM updates (diffing vs direct writes) and batching to avoid layout thrash.
- Asset strategy for pixel look: no decision on using drawn rectangles, spritesheets, or inline pixel patterns; impacts polish and scope.

**Alternative Directions**
- Canvas world + DOM HUD
  - Pros: smooth animations with `requestAnimationFrame`, easy pixel scaling via integer zoom, crisp visuals with `image-rendering: pixelated`.
  - Cons: more custom rendering code; hit‑testing and layout for UI require DOM overlay.
- DOM grid + CSS transforms
  - Pros: faster to build; easy clickable buttons and panels; no rendering boilerplate.
  - Cons: layout jank and performance at higher entity counts; harder to get true pixel‑art crispness.
- Lane‑based queue vs free pathing
  - Lane‑based: discrete queue slots simplify movement/state logic and avoid overlap; less lively but reliable.
  - Free pathing: more organic feel; needs simple steering/avoidance or waypoint system; higher complexity.
- Single ready‑drink slot vs drink queue
  - Single slot: simpler interactions and fewer edge cases; clear feedback.
  - Queue of prepared drinks: more depth and forgiveness; requires selection/serving logic and UI for multiple items.
- Data‑only orders v1 vs modifier rollout
  - Data‑only base types at launch; add modifiers later when the core loop is rock solid to avoid combinatorial complexity.

**Questions For User**
- Rendering choice: prefer canvas world with DOM HUD, or DOM‑only grid for faster build?
- Assets: should we avoid external image/audio files and synthesize visuals/SFX (WebAudio oscillators, canvas rectangles), or are tiny embedded/base64 assets acceptable?
- Audio: is a Start click to unlock audio acceptable, and do you want a mute toggle in the HUD?
- Session model: fixed “day length” (e.g., 180–300s) or failure‑based game over? Which do you prefer for demos?
- Orders v1: stick to base four drinks without modifiers, or include a single modifier (e.g., size S/M/L) for demo?
- Controls: mouse‑only okay, or must support keyboard shortcuts and mobile touch?
- Target browsers and minimum viewport: any constraints for demo machines/displays?
- Visual priority: invest time in hand‑crafted simple pixel sprites, or accept blocky color avatars to prioritize gameplay polish?

**Candidate Criteria**
- Runs locally by opening `index.html` with no server; no external requests; no console errors.
- Clear loop visible in 10 seconds: customers enter→queue→counter→order→serve→leave with movement and state transitions.
- Four base drinks implemented with a simple prepare→ready→serve flow; wrong serve produces feedback and penalty.
- Queue is stable: first‑in‑line advances correctly; no overlapping or ghost customers; max 6 visible entities renders smoothly at 60 FPS on a typical laptop.
- Patience and timing: each customer shows a patience meter; timeouts cause unhappy leave and increment failure count.
- Economy/UI: money, completed, failed, and elapsed time update live in a pixel‑styled HUD; feedback messages and “drink ready” status visible.
- Game states: start screen with instructions and Start button; in‑game; end‑of‑day summary with totals and Restart.
- Difficulty ramp: spawn interval decreases gently over session; session length tunes to ~3–5 minutes under average performance.
- Audio/feedback: lightweight SFX for arrival, drink ready, correct/incorrect serve, unhappy leave; must be user‑gesture gated with a mute toggle.
- Architecture: separated systems (game state manager, customer manager with FSM, queue manager, order data, prep system, UI renderer, audio, timing loop); functions and names are clear with comments on main systems.
- Visuals: consistent pixel‑art feel (32×32 scale mindset), warm color palette, at least 4 customer color variants with distinct silhouettes/tones; UI buttons styled to match.
- Extensibility: orders defined via a data object structure (type, price, prep time, optional modifiers); adding a new drink requires data change and minimal code.
- Performance: uses `requestAnimationFrame` with delta time; batched DOM updates or canvas draw ensures no perceptible stutter for 4–6 customers.
- Controls: mouse‑friendly controls with clear hit targets; basic keyboard shortcuts for prepare/serve if feasible; touch works for primary actions.
- Documentation: `README.md` at root with prerequisites, run instructions, usage examples, configuration knobs (e.g., spawn rate), and project structure; commit messages prefixed with `feat:`.

If you want, I can propose a lean architecture diagram and a concrete file layout next, aligned to your choice of canvas vs DOM.
