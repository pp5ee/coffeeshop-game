# Pixel Coffee Shop Game Implementation Plan

## Goal Description
Build a complete browser-based coffee shop management game prototype using plain HTML, CSS, and JavaScript with retro pixel-art styling. The game should feature customer movement, queue management, order handling, and a polished gameplay loop that demonstrates automated coding capabilities.

## Acceptance Criteria

Following TDD philosophy, each criterion includes positive and negative tests for deterministic verification.

- AC-1: Game runs locally without external dependencies
  - Positive Tests (expected to PASS):
    - Opening index.html in browser shows start screen with no console errors
    - Game loads and runs on Chrome, Firefox, and Safari without server requirements
    - All assets (CSS, JS) are embedded or use relative paths without external requests
  - Negative Tests (expected to FAIL):
    - Attempting to load from file:// protocol causes script errors
    - External API calls or module imports break local execution

- AC-2: Core gameplay loop is visible within 10 seconds
  - Positive Tests (expected to PASS):
    - Customers enter shop, join queue, move to counter, display orders, and leave
    - Player can prepare and serve drinks with visible feedback
    - Queue positions update correctly as customers advance
  - Negative Tests (expected to FAIL):
    - Gameplay loop stalls or customers get stuck in states
    - Queue logic desynchronizes causing overlapping customers

- AC-3: Four base drink types with preparation flow
  - Positive Tests (expected to PASS):
    - Espresso, Americano, Latte, and Cappuccino can be prepared and served
    - Drink preparation shows progress/status indicators
    - Correct serves increase money and completed orders
    - Wrong serves show feedback and apply penalties
  - Negative Tests (expected to FAIL):
    - Wrong drinks are accepted as correct orders
    - Preparation system fails to distinguish between drink types

- AC-4: Customer system with patience and timing
  - Positive Tests (expected to PASS):
    - Customers spawn at intervals with visual variation
    - Each customer shows patience meter that depletes over time
    - Timeout causes unhappy departure and increments failure count
    - Movement states (entering, queue, counter, leaving) transition smoothly
  - Negative Tests (expected to FAIL):
    - Customers remain stuck indefinitely in any state
    - Patience system fails to trigger timeout conditions

- AC-5: Game state management and UI
  - Positive Tests (expected to PASS):
    - Start screen with instructions and start button functions
    - Active gameplay shows money, orders, failures, and elapsed time
    - End-of-day summary displays totals with restart option
    - UI elements match pixel-art aesthetic and are responsive
  - Negative Tests (expected to FAIL):
    - Game state transitions fail or get stuck
    - UI elements break layout or become unresponsive

- AC-6: Performance and scalability
  - Positive Tests (expected to PASS):
    - Game runs smoothly at 60 FPS with 4-6 visible customers
    - DOM updates or canvas rendering doesn't cause perceptible stutter
    - Uses requestAnimationFrame with delta time for consistent timing
  - Negative Tests (expected to FAIL):
    - Performance degrades significantly with multiple customers
    - Timing drifts or becomes inconsistent across machines

- AC-7: Audio and feedback system
  - Positive Tests (expected to PASS):
    - Sound effects for key events (arrival, ready, serve, leave)
    - Audio respects browser autoplay policies (starts after user gesture)
    - Mute toggle available in UI for sound control
    - Visual feedback (text, icons) complements audio cues
  - Negative Tests (expected to FAIL):
    - Audio autoplay blocked by browser policies
    - Sound effects fail to play or cause performance issues

- AC-8: Architecture and documentation
  - Positive Tests (expected to PASS):
    - Code organized into logical modules (game state, customers, orders, etc.)
    - README.md includes setup instructions, usage examples, and structure
    - Commit messages use conventional feat: prefix
    - Order system is data-driven for extensibility
  - Negative Tests (expected to FAIL):
    - Code is monolithic without clear separation of concerns
    - Documentation missing or incomplete for running the game

## Path Boundaries

Path boundaries define the acceptable range of implementation quality and choices.

### Upper Bound (Maximum Acceptable Scope)
The implementation includes all core features with polished pixel-art presentation, smooth animations, sound effects, and a complete game loop. Customers have distinct visual variations, queue management is robust, and the UI is fully responsive with all feedback systems working correctly. The architecture is modular and extensible, with data-driven order definitions and comprehensive documentation.

### Lower Bound (Minimum Acceptable Scope)
The implementation includes the core customer flow (enter→queue→counter→serve→leave) with basic visual representation. Four drink types are functional with preparation and serving mechanics. Game states (start, gameplay, end) are implemented with basic UI showing money and counters. The game runs locally without errors and demonstrates the core gameplay loop.

### Allowed Choices
- Can use: DOM-based rendering with CSS transforms, canvas rendering with DOM overlay, or hybrid approach; finite state machines for customer states; data-driven order definitions; Web Audio API for sound; localStorage for high scores
- Cannot use: External frameworks (React, Vue, etc.); build tools or compilation steps; server-side dependencies; external asset loading; third-party libraries for core game logic

> **Note on Deterministic Designs**: The draft specifies a highly deterministic design with fixed technology stack (HTML/CSS/JS) and visual style (pixel-art). The implementation must follow these constraints while allowing flexibility in architectural patterns and rendering approaches.

## Feasibility Hints and Suggestions

> **Note**: This section is for reference and understanding only. These are conceptual suggestions, not prescriptive requirements.

### Conceptual Approach
A hybrid DOM+Canvas approach where the game world uses canvas for smooth pixel-art rendering while UI elements remain in DOM for easy interaction. Customer movement uses discrete grid-based positioning with finite state machines. The game loop runs on requestAnimationFrame with delta time compensation. Order system is data-driven with JSON-like structures for easy extension.

### Relevant References
- index.html - Main entry point with canvas and DOM structure
- style.css - Pixel-art styling with warm color palette and 32px grid system
- script.js - Core game engine with modular systems
- game-state.js - State management for start/gameplay/end screens
- customer-manager.js - Customer spawning, movement, and FSM logic
- order-system.js - Data-driven order definitions and preparation logic

## Dependencies and Sequence

### Milestones
1. Milestone 1: Core Game Engine and Basic Rendering
   - Phase A: Setup HTML structure, CSS styling, and canvas rendering system
   - Phase B: Implement game loop with requestAnimationFrame and timing system
   - Phase C: Create basic customer movement and grid-based positioning

2. Milestone 2: Customer System and Queue Management
   - Step 1: Implement customer spawning and finite state machines
   - Step 2: Build queue logic with position management and transitions
   - Step 3: Add customer patience system and timeout handling

3. Milestone 3: Order and Preparation System
   - Step 1: Create data-driven order definitions for 4 base drinks
   - Step 2: Implement drink preparation flow with UI controls
   - Step 3: Add serving logic with success/failure feedback

4. Milestone 4: Game Systems and UI
   - Step 1: Build game state management (start, gameplay, end)
   - Step 2: Implement UI panels for stats, orders, and feedback
   - Step 3: Add difficulty scaling and session length control

5. Milestone 5: Polish and Audio
   - Step 1: Implement sound effects with Web Audio API
   - Step 2: Add visual polish (animations, effects, pixel-art details)
   - Step 3: Create documentation and final testing

Dependencies: Milestone 2 depends on Milestone 1 (rendering system). Milestone 3 depends on Milestone 2 (customer system). Milestone 4 depends on all previous milestones. Milestone 5 depends on complete game functionality.

## Task Breakdown

Each task must include exactly one routing tag:
- `coding`: implemented by Claude
- `analyze`: executed via Codex (`/humanize:ask-codex`)

| Task ID | Description | Target AC | Tag (`coding`/`analyze`) | Depends On |
|---------|-------------|-----------|----------------------------|------------|
| task1 | Create project structure with HTML/CSS foundation | AC-1 | coding | - |
| task2 | Implement game loop with requestAnimationFrame | AC-6 | coding | task1 |
| task3 | Design customer finite state machine architecture | AC-4 | analyze | task2 |
| task4 | Implement customer spawning and movement system | AC-2, AC-4 | coding | task3 |
| task5 | Build queue management logic | AC-2 | coding | task4 |
| task6 | Create data-driven order system | AC-3 | analyze | task5 |
| task7 | Implement drink preparation UI and logic | AC-3 | coding | task6 |
| task8 | Add serving mechanics with feedback | AC-3 | coding | task7 |
| task9 | Build game state management (start/gameplay/end) | AC-5 | coding | task8 |
| task10 | Implement UI panels for stats and orders | AC-5 | coding | task9 |
| task11 | Add customer patience and timing systems | AC-4 | coding | task10 |
| task12 | Implement difficulty scaling and session control | AC-5 | coding | task11 |
| task13 | Design audio system architecture | AC-7 | analyze | task12 |
| task14 | Add sound effects and audio feedback | AC-7 | coding | task13 |
| task15 | Implement visual polish and pixel-art details | AC-2, AC-5 | coding | task14 |
| task16 | Create comprehensive documentation | AC-8 | coding | task15 |
| task17 | Final testing and performance optimization | AC-6 | coding | task16 |

## Claude-Codex Deliberation

### Agreements
- Core gameplay loop must be visible within 10 seconds for demo purposes
- Four base drink types (Espresso, Americano, Latte, Cappuccino) are sufficient for v1
- Customer system requires finite state machines for reliable state transitions
- Game must run locally without external dependencies or build tools
- Pixel-art aesthetic with warm color palette is essential for the intended atmosphere
- Session length should target 3-5 minutes with gentle difficulty scaling

### Resolved Disagreements
- Rendering approach: Codex suggested canvas-only or DOM-only options, but Claude proposes hybrid approach (canvas for game world, DOM for UI) for best balance of performance and development speed
- Audio implementation: Codex identified autoplay policy risks, Claude resolved by requiring user gesture (start button) to initialize audio system
- Order complexity: Codex suggested starting with base drinks only, Claude aligned with draft preference for light modifiers to demonstrate data-driven architecture

### Convergence Status
- Final Status: `converged`

## Pending User Decisions

- DEC-1: Rendering technology choice
  - Claude Position: Hybrid approach (canvas for game world, DOM for UI) balances performance and development speed
  - Codex Position: Either canvas-only for smooth animations or DOM-only for faster development
  - Tradeoff Summary: Canvas provides better pixel-art rendering but requires more custom code; DOM is easier but may have performance limitations
  - Decision Status: `PENDING`

- DEC-2: Audio implementation strategy
  - Claude Position: Use Web Audio API with user gesture requirement (start button) to avoid autoplay issues
  - Codex Position: Either synthesized sounds or embedded assets, both requiring user gesture
  - Tradeoff Summary: Synthesized sounds are smaller but less polished; embedded assets provide better quality but increase file size
  - Decision Status: `PENDING`

- DEC-3: Order complexity for initial version
  - Claude Position: Include light modifiers (size variations) to demonstrate data-driven architecture
  - Codex Position: Start with base drinks only to ensure core loop stability
  - Tradeoff Summary: More complexity shows extensibility but increases implementation risk; simpler approach is safer for demo
  - Decision Status: `PENDING`

- DEC-4: Target browser compatibility
  - Claude Position: Support Chrome, Firefox, Safari with modern ES6 features
  - Codex Position: Need explicit minimum browser versions for testing
  - Tradeoff Summary: Modern features enable cleaner code but may exclude older browsers
  - Decision Status: `PENDING`

## Implementation Notes

### Code Style Requirements
- Implementation code and comments must NOT contain plan-specific terminology such as "AC-", "Milestone", "Step", "Phase", or similar workflow markers
- These terms are for plan documentation only, not for the resulting codebase
- Use descriptive, domain-appropriate naming in code instead

## Output File Convention

This template is used to produce the main output file (e.g., `plan.md`).

### Translated Language Variant

When `alternative_plan_language` resolves to a supported language name through merged config loading, a translated variant of the output file is also written after the main file. Humanize loads config from merged layers in this order: default config, optional user config, then optional project config; `alternative_plan_language` may be set at any of those layers. The variant filename is constructed by inserting `_<code>` (the ISO 639-1 code from the built-in mapping table) immediately before the file extension:

- `plan.md` becomes `plan_<code>.md` (e.g. `plan_zh.md` for Chinese, `plan_ko.md` for Korean)
- `docs/my-plan.md` becomes `docs/my-plan_<code>.md`
- `output` (no extension) becomes `output_<code>`

The translated variant file contains a full translation of the main plan file's current content in the configured language. All identifiers (`AC-*`, task IDs, file paths, API names, command flags) remain unchanged, as they are language-neutral.

When `alternative_plan_language` is empty, absent, set to `"English"`, or set to an unsupported language, no translated variant is written. Humanize does not auto-create `.humanize/config.json` when no project config file is present.

--- Original Design Draft Start ---

# Requirement

Please build a complete browser-based game prototype called "Pixel Coffee Shop" using plain HTML, CSS, and JavaScript.

This project is for a demo of an automated coding tool, so the result should be visually appealing, clearly structured, and actually playable. The game should feel like a small but polished pixel-art management simulation, with visible customer movement, order handling, queue logic, and coffee shop business interactions.

====================
1. HIGH-LEVEL GOAL
====================

Create a cozy pixel-art coffee shop management game where customers enter the shop, queue up, place orders, wait to be served, pay if served correctly, and then leave. The player manages drink preparation and service through a clear UI.

The game should feel alive and readable at a glance. It should demonstrate:
- NPC movement
- queue management
- order generation
- timing and patience systems
- player interaction
- score / money systems
- modular game architecture
- room for future extensions

====================
2. TECH STACK
====================

Use:
- HTML
- CSS
- JavaScript

Constraints:
- No heavy frameworks
- No build tools required
- Must run locally with minimal setup
- Structure files cleanly, such as:
  - index.html
  - style.css
  - script.js
- If useful, you may split JavaScript into multiple small files, but keep setup simple

====================
3. VISUAL DIRECTION
====================

Use a retro pixel-art inspired style.

Visual requirements:
- Use a 32x32 pixel-art grid mindset for world elements and characters
- The shop should feel warm, cozy, and readable
- Include a visible interior layout with:
  - entrance / door
  - queue area
  - front counter
  - coffee machine or preparation station
  - pickup area
  - optional tables or seating if lightweight enough
- Use simple blocky sprite-like visuals if full sprite sheets are too much
- Different customer types should have different visual colors or sprite variations
- UI panels should match the pixel-art aesthetic
- Keep visuals consistent and polished, but implementation lightweight

====================
4. CORE GAME LOOP
====================

Implement this loop clearly:

1. Customers spawn outside or at the entrance
2. Customers walk into the shop
3. Customers join a visible queue
4. The first customer in line moves to the counter
5. That customer displays a coffee order
6. The player prepares a drink using UI controls
7. The player serves a drink to the current customer
8. If correct:
   - customer is satisfied
   - money increases
   - completed orders increases
   - customer leaves the shop
9. If incorrect:
   - show feedback
   - apply a penalty or wasted time
10. If the player takes too long:
   - customer patience runs out
   - customer leaves unhappy
   - failed customer count increases
11. New customers continue arriving over time

====================
5. CUSTOMER SYSTEM
====================

Implement a lightweight but lively customer system.

Requirements:
- Customers spawn at intervals
- Each customer has:
  - id
  - visual type / color
  - order
  - patience
  - movement state
  - position
- Movement states may include:
  - entering
  - joining_queue
  - waiting_in_queue
  - at_counter
  - leaving_happy
  - leaving_unhappy
- Customers should visibly move through the scene
- Queue positions should update correctly as customers move forward
- Different customers may have small stat variation, such as patience or movement speed

====================
6. ORDER SYSTEM
====================

Implement an order system with increasing complexity.

Base drink types:
- Espresso
- Americano
- Latte
- Cappuccino

Order requirements:
- Start with simple orders
- Support expansion to more complex orders later
- Represent the active customer's order clearly in the UI
- If possible, structure the code so order definitions are data-driven

Optional extension-friendly order attributes:
- size
- extra shot
- milk type
- sweetness

You do not need to fully implement all complex attributes unless it stays manageable, but architect the system so it can be extended later.

====================
7. DRINK PREPARATION SYSTEM
====================

Implement a simple but satisfying drink preparation flow.

Requirements:
- The player can click buttons to prepare drinks
- Preparing a drink should take a short amount of time
- Show preparation progress or status if possible
- A completed drink becomes available to serve
- The player can serve the prepared drink to the active counter customer
- Wrong drinks should trigger feedback and a penalty
- Keep the interaction simple enough to demo easily

Recommended simplified flow:
- Click a drink type button
- Drink enters preparing state
- After a short timer, it becomes ready
- Click "Serve" or click the ready drink to serve it

====================
8. GAME SYSTEMS
====================

Include the following management systems:

- Money counter
- Completed orders counter
- Failed/unhappy customers counter
- Elapsed time or day timer
- Customer patience display for the active counter customer
- Difficulty scaling over time:
  - customers arrive slightly faster as time passes
  - optionally more order variation appears later

Keep the progression gentle so the game remains readable during a demo.

====================
9. GAME STATES
====================

Implement clear game states:

- Start screen
  - title
  - short instructions
  - start button
- Active gameplay
- End-of-day summary or game-over panel
  - total money
  - completed orders
  - failed customers
  - elapsed time
  - restart button

====================
10. USER INTERFACE
====================

The UI should be clean, understandable, and demo-friendly.

Include:
- A top bar or side panel showing:
  - money
  - completed orders
  - failed customers
  - elapsed time
- Active customer order panel
- Patience meter for current customer
- Drink preparation controls
- Current preparation status
- Feedback text such as:
  - "Latte ready"
  - "Wrong order"
  - "Customer left unhappy"
  - "Order served"

The UI should look game-like, not like a plain form.

====================
11. ARCHITECTURE REQUIREMENTS
====================

Organize the code clearly into systems. Even if implemented in one main file, keep the logic separated conceptually.

Suggested modules / sections:
- game state manager
- customer manager
- queue manager
- order definitions
- drink preparation system
- UI renderer / DOM update system
- update loop / timing system
- movement and animation helpers

Use clear function and variable names.
Add comments to important systems.
Avoid writing everything in one giant unstructured block.

====================
12. POLISH REQUIREMENTS
====================

Please make the prototype feel alive:
- visible customer movement
- readable pixel-style layout
- distinct customer visuals
- responsive buttons
- clear feedback states
- smooth enough update loop
- coherent spacing and presentation

Optional if lightweight:
- tiny floating text for payments
- simple happy/unhappy reaction indicators
- subtle screen shake or flash on mistakes
- basic localStorage high score or best-day tracking

====================
13. SIMPLIFICATION RULE
====================

If the full scope becomes too large, prioritize these in order:

1. customer enter / queue / counter / leave flow
2. order generation and serving
3. patience and time pressure
4. money / score systems
5. polished pixel-art presentation
6. extra systems such as upgrades or inventory

It is better to deliver a polished simplified version than a broken oversized one.

====================
14. OUTPUT FORMAT
====================

Please provide:
1. Full runnable code
2. File-by-file explanation
3. Instructions to run locally
4. Short architecture explanation
5. Suggested next-step extensions

====================
15. IMPORTANT IMPLEMENTATION NOTES
====================

- Keep the project lightweight and easy to run
- Preserve extensibility for future features
- Make the customer flow visually obvious
- Make the game easy to understand within 10 seconds of opening it
- Aim for a polished prototype, not a giant unfinished system

Here are my preferences:

1. Visual Style
- Cozy retro pixel-art style
- Warm coffee shop atmosphere
- Clean and readable 32x32-inspired character and environment scale
- Soft warm color palette: browns, cream, muted green, warm yellow
- Cute and simple customer sprites with different colors / minor visual variations
- Pixel-style UI panels and buttons
- The shop should feel lively, charming, and easy to understand at a glance

2. Game Scale
- Small-to-medium scale for demo purposes
- 4 to 6 customers visible at once is ideal
- Usually 1 customer at the counter, 2 to 4 waiting in queue, and 1 entering or leaving
- Keep it readable and manageable rather than overcrowded

3. Session Length
- Around 3 to 5 minutes per play session
- Long enough to show progression and increasing pressure
- Short enough for a live demo and quick restart
- Difficulty should ramp up gradually during the session

Here are my preferences:

1. Customer Types
- 4 distinct customer types is enough
- Each type should have a different color palette and slightly different visual silhouette if possible
- Keep the pixel sprites simple and readable
- Variation should make the shop feel lively without adding too much implementation complexity

2. Order Complexity
- Start with medium complexity
- Base drinks: Espresso, Americano, Latte, Cappuccino
- Add light variation such as size or one extra modifier, but keep it manageable
- The system should be structured so more complex orders can be added later
- For the first version, readability and smooth gameplay matter more than deep simulation

3. Sound & Effects
- Yes, include lightweight sound effects if easy to implement
- Add simple sounds for customer arrival, drink ready, correct serve, wrong serve, and unhappy customer leaving
- Also include clear visual feedback such as floating text, small reaction icons, or simple animations
- Keep effects subtle, charming, and lightweight so the demo stays polished and stable

---

## Standard Deliverables (mandatory for every project)

- **README.md** — must be included at the project root with: project title & description, prerequisites, installation steps, usage examples with code snippets, configuration options, and project structure overview.
- **Git commits** — use conventional commit prefix `feat:` for all commits.

--- Original Design Draft End ---
