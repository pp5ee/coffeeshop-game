// Pixel Coffee Shop - Core Game Engine

// ---------------------------------------------------------------------------
// Data-driven drink definitions
// ---------------------------------------------------------------------------
const DRINKS = new Map([
    ['espresso',   { label: 'Espresso',   price: 3,  prepTimeMs: 2000 }],
    ['americano',  { label: 'Americano',  price: 4,  prepTimeMs: 3000 }],
    ['latte',      { label: 'Latte',      price: 5,  prepTimeMs: 4500 }],
    ['cappuccino', { label: 'Cappuccino', price: 5,  prepTimeMs: 5000 }],
]);

// How long (ms) a customer waits before leaving without being served
const ORDER_PATIENCE_MS = 20000;

// ---------------------------------------------------------------------------
// Order – represents one customer's request
// ---------------------------------------------------------------------------
class Order {
    constructor(drinkType, customerId) {
        if (!DRINKS.has(drinkType)) {
            throw new Error(`Unknown drink type: ${drinkType}`);
        }
        this.drinkType   = drinkType;
        this.customerId  = customerId;
        this.drink       = DRINKS.get(drinkType);          // convenience ref
        this.createdAt   = performance.now();               // patience clock
        this.patienceMs  = ORDER_PATIENCE_MS;
    }

    /** 0-1 fraction of patience remaining (1 = full patience, 0 = expired) */
    getPatienceFraction(now = performance.now()) {
        const elapsed = now - this.createdAt;
        return Math.max(0, 1 - elapsed / this.patienceMs);
    }

    isExpired(now = performance.now()) {
        return this.getPatienceFraction(now) <= 0;
    }
}

// ---------------------------------------------------------------------------
// DrinkPreparation – tracks in-progress brewing of a single drink
// ---------------------------------------------------------------------------
class DrinkPreparation {
    constructor(drinkType) {
        if (!DRINKS.has(drinkType)) {
            throw new Error(`Unknown drink type: ${drinkType}`);
        }
        this.drinkType  = drinkType;
        this.drink      = DRINKS.get(drinkType);
        this.startedAt  = performance.now();
        this.prepTimeMs = this.drink.prepTimeMs;
        this.done       = false;
    }

    /** 0-1 fraction of preparation completed */
    getProgressFraction(now = performance.now()) {
        return Math.min(1, (now - this.startedAt) / this.prepTimeMs);
    }

    isReady(now = performance.now()) {
        return this.getProgressFraction(now) >= 1;
    }
}

// ---------------------------------------------------------------------------
// Helper: pick a random drink type from DRINKS
// ---------------------------------------------------------------------------
function randomDrinkType() {
    const keys = Array.from(DRINKS.keys());
    return keys[Math.floor(Math.random() * keys.length)];
}

// ---------------------------------------------------------------------------
// Main game class
// ---------------------------------------------------------------------------
class PixelCoffeeShop {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'start'; // start, gameplay, end

        // Game timing
        this.lastTime = 0;
        this.deltaTime = 0;
        this.gameTime = 0;
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;

        // Game state
        this.money = 0;
        this.ordersCompleted = 0;
        this.customersFailed = 0;
        this.dayLength = 180; // 3 minutes in seconds

        // UI elements
        this.moneyCounter = document.getElementById('money-counter');
        this.ordersCounter = document.getElementById('orders-counter');
        this.failedCounter = document.getElementById('failed-counter');
        this.timeCounter = document.getElementById('time-counter');

        // Game objects
        this.customers = [];
        this.queue = [];
        this.currentOrder    = null;  // Order instance – the active customer request
        this.currentPrep     = null;  // DrinkPreparation instance – brew in progress
        this.preparedDrink   = null;  // { drinkType } set when brew finishes

        // Customer spawning
        this._nextCustomerId    = 1;
        this._nextSpawnDelay    = 0;   // seconds until next customer (set in startCustomerSpawning)
        this._spawnAccumulator  = 0;   // seconds elapsed toward next spawn

        this.initializeEventListeners();
        this.initializeGameWorld();
    }

    initializeEventListeners() {
        // Start button
        document.getElementById('start-button').addEventListener('click', () => {
            this.startGame();
        });

        // Restart button
        document.getElementById('restart-button').addEventListener('click', () => {
            this.restartGame();
        });

        // Drink preparation buttons
        document.querySelectorAll('.drink-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const drinkType = e.target.dataset.drink;
                this.prepareDrink(drinkType);
            });
        });

        // Serve button
        document.getElementById('serve-button').addEventListener('click', () => {
            this.serveDrink();
        });

        // Mute button
        document.getElementById('mute-button').addEventListener('click', () => {
            this.toggleMute();
        });
    }

    initializeGameWorld() {
        // Set up canvas rendering context
        this.ctx.imageSmoothingEnabled = false;

        // Define game world layout
        this.worldLayout = {
            width: this.canvas.width,
            height: this.canvas.height,
            entrance: { x: 50, y: 50 },
            queueStart: { x: 150, y: 150 },
            counter: { x: 400, y: 300 },
            exit: { x: 700, y: 50 }
        };

        // Pre-compute queue slot positions (4–6 slots, ~40 px spacing)
        this.queueSlots = this._computeQueueSlots();

        // Initialize audio system (to be implemented)
        this.audioEnabled = true;
        this.audioContext = null;
    }

    /**
     * Compute evenly-spaced queue positions from queueStart toward the counter.
     * Returns an array of {x, y} objects.
     */
    _computeQueueSlots() {
        const { queueStart, counter } = this.worldLayout;
        const NUM_SLOTS  = 5;
        const SLOT_SPACE = 40; // px between slots
        const slots      = [];

        // Direction vector from queueStart toward counter
        const dx  = counter.x - queueStart.x;
        const dy  = counter.y - queueStart.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const ux  = dx / len;
        const uy  = dy / len;

        for (let i = 0; i < NUM_SLOTS; i++) {
            slots.push({
                x: queueStart.x + ux * i * SLOT_SPACE,
                y: queueStart.y + uy * i * SLOT_SPACE,
            });
        }
        return slots;
    }

    startGame() {
        this.gameState = 'gameplay';
        this.gameTime = 0;
        this.money = 0;
        this.ordersCompleted = 0;
        this.customersFailed = 0;

        // Switch to game screen
        this.switchScreen('game-screen');

        // Start game loop using rAF timestamp to avoid negative delta on first frame
        requestAnimationFrame((time) => {
            this.lastTime = time;
            this.gameLoop(time);
        });

        // Start customer spawning
        this.startCustomerSpawning();

        // Initialize audio if not already done
        this.initializeAudio();
    }

    gameLoop(currentTime = 0) {
        if (this.gameState !== 'gameplay') return;

        // Calculate delta time
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Update game time
        this.gameTime += this.deltaTime;

        // Update FPS counter
        this.updateFps(currentTime);

        // Update game state
        this.update();

        // Render game
        this.render();

        // Update UI
        this.updateUI();

        // Check for game end
        if (this.gameTime >= this.dayLength) {
            this.endGame();
            return;
        }

        // Continue game loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update() {
        // Update customers
        this.updateCustomers();

        // Update queue
        this.updateQueue();

        // Update current order
        this.updateCurrentOrder();

        // Update drink preparation
        this.updateDrinkPreparation();
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#D2B48C'; // Cream color
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw game world
        this.drawGameWorld();

        // Draw customers
        this.drawCustomers();

        // Draw UI elements on canvas
        this.drawCanvasUI();
    }

    drawGameWorld() {
        const ctx = this.ctx;
        const layout = this.worldLayout;

        // Draw floor
        ctx.fillStyle = '#E6D6B3'; // Lighter cream
        ctx.fillRect(0, 0, layout.width, layout.height);

        // Draw counter
        ctx.fillStyle = '#8B4513'; // Dark brown
        ctx.fillRect(layout.counter.x - 100, layout.counter.y - 20, 200, 40);

        // Draw queue area
        ctx.strokeStyle = '#A0522D'; // Medium brown
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(layout.queueStart.x, layout.queueStart.y);
        ctx.lineTo(layout.counter.x - 120, layout.counter.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw entrance and exit
        this.drawDoor(layout.entrance.x, layout.entrance.y, 'Entrance');
        this.drawDoor(layout.exit.x, layout.exit.y, 'Exit');
    }

    drawDoor(x, y, label) {
        const ctx = this.ctx;

        // Door frame
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(x - 15, y - 30, 30, 60);

        // Door
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x - 12, y - 27, 24, 54);

        // Label
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(label, x, y + 40);
    }

    drawCustomers() {
        const ctx = this.ctx;
        const now = performance.now();

        this.customers.forEach(customer => {
            const cx = Math.round(customer.x);
            const cy = Math.round(customer.y);

            // ── Body ────────────────────────────────────────────────────────
            // Slightly transparent when leaving so they visually "fade out"
            const isLeaving = customer.state === 'leaving_happy' || customer.state === 'leaving_unhappy';
            ctx.globalAlpha = isLeaving ? 0.6 : 1.0;

            if (customer.sprite) {
                ctx.drawImage(customer.sprite, cx, cy);
            } else {
                // Body square
                ctx.fillStyle = customer.color || '#CD5C5C';
                ctx.fillRect(cx, cy, 32, 32);

                // State-coloured border
                ctx.lineWidth = 2;
                if (customer.state === 'at_counter' || customer.state === 'to_counter') {
                    ctx.strokeStyle = '#FFD700'; // gold – active customer
                } else if (customer.state === 'leaving_happy') {
                    ctx.strokeStyle = '#8FBC8F'; // green – happy
                } else if (customer.state === 'leaving_unhappy') {
                    ctx.strokeStyle = '#CD5C5C'; // red – unhappy
                } else {
                    ctx.strokeStyle = '#FFFFFF';
                }
                ctx.strokeRect(cx, cy, 32, 32);

                // Customer number
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '11px Courier New';
                ctx.textAlign = 'center';
                ctx.fillText(customer.id.toString(), cx + 16, cy + 20);

                // State emoji badge
                let badge = '';
                if (customer.state === 'at_counter') badge = '☕';
                else if (customer.state === 'leaving_happy') badge = '😊';
                else if (customer.state === 'leaving_unhappy') badge = '😠';
                else if (customer.state === 'in_queue' || customer.state === 'entering') badge = '⏳';
                if (badge) {
                    ctx.font = '12px serif';
                    ctx.fillText(badge, cx + 16, cy - 4);
                }
            }

            // ── Patience bar (only for the at_counter customer) ─────────────
            if (customer.state === 'at_counter' && this.currentOrder &&
                this.currentOrder.customerId === customer.id) {
                const fraction = this.currentOrder.getPatienceFraction(now);
                const barW = 32;
                const barH = 4;
                const bx   = cx;
                const by   = cy + 35;
                // Background
                ctx.fillStyle = '#555555';
                ctx.fillRect(bx, by, barW, barH);
                // Fill
                if (fraction > 0.6) {
                    ctx.fillStyle = '#8FBC8F';
                } else if (fraction > 0.3) {
                    ctx.fillStyle = '#DAA520';
                } else {
                    ctx.fillStyle = '#CD5C5C';
                }
                ctx.fillRect(bx, by, Math.round(barW * fraction), barH);
            }

            ctx.globalAlpha = 1.0;
        });
    }

    drawCanvasUI() {
        const ctx = this.ctx;

        // Draw FPS counter (debug)
        ctx.fillStyle = '#000000';
        ctx.font = '14px Courier New';
        ctx.textAlign = 'left';
        ctx.fillText(`FPS: ${Math.round(this.fps)}`, 10, 580);

        // Draw game time
        ctx.fillText(`Time: ${Math.floor(this.gameTime)}s`, 100, 580);
    }

    updateUI() {
        // Update counters
        this.moneyCounter.textContent = `$${this.money}`;
        this.ordersCounter.textContent = this.ordersCompleted.toString();
        this.failedCounter.textContent = this.customersFailed.toString();
        this.timeCounter.textContent = `${Math.floor(this.gameTime)}s`;

        const now = performance.now();

        // ── Current order display ─────────────────────────────────────────
        const orderDisplay = document.getElementById('current-order');
        if (this.currentOrder) {
            const { label, price } = this.currentOrder.drink;
            orderDisplay.textContent = `${label}  ($${price})  – Customer #${this.currentOrder.customerId}`;
        } else if (this.queue.length > 0) {
            orderDisplay.textContent = `${this.queue.length} customer(s) waiting…`;
        } else {
            orderDisplay.textContent = 'Waiting for customer…';
        }

        // ── Patience meter ────────────────────────────────────────────────
        const patienceFill = document.getElementById('patience-fill');
        if (patienceFill) {
            if (this.currentOrder) {
                const pct = this.currentOrder.getPatienceFraction(now) * 100;
                patienceFill.style.width = `${pct}%`;
                // Colour shifts green → yellow → red as patience drains
                if (pct > 60) {
                    patienceFill.style.backgroundColor = '#8FBC8F';
                } else if (pct > 30) {
                    patienceFill.style.backgroundColor = '#DAA520';
                } else {
                    patienceFill.style.backgroundColor = '#CD5C5C';
                }
            } else {
                patienceFill.style.width = '0%';
            }
        }

        // ── Preparation status ────────────────────────────────────────────
        const prepStatus = document.getElementById('preparing-drink');
        const serveBtn   = document.getElementById('serve-button');

        if (this.preparedDrink) {
            const label = DRINKS.get(this.preparedDrink.drinkType).label;
            prepStatus.textContent = `${label} ready! ☕`;
            serveBtn.disabled = false;
        } else if (this.currentPrep) {
            const pct   = Math.round(this.currentPrep.getProgressFraction(now) * 100);
            const label = this.currentPrep.drink.label;
            prepStatus.textContent = `Brewing ${label}… ${pct}%`;
            serveBtn.disabled = true;
        } else {
            prepStatus.textContent = 'Ready to prepare';
            serveBtn.disabled = true;
        }
    }

    updateFps(currentTime) {
        this.frameCount++;

        if (currentTime - this.lastFpsUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
        }
    }

    startCustomerSpawning() {
        // Reset spawn timer so the first customer arrives after a short wait
        this._spawnAccumulator = 0;
        this._nextSpawnDelay   = 3; // first customer in 3 s
        console.log('Customer spawning started');
    }

    updateCustomers() {
        // ── 1. Spawn timer ────────────────────────────────────────────────────
        if (this._nextSpawnDelay > 0) {
            this._spawnAccumulator += this.deltaTime;
            if (this._spawnAccumulator >= this._nextSpawnDelay) {
                this._spawnAccumulator = 0;
                // Progressive difficulty: spawn interval shrinks as the day advances.
                // scale goes from 1.0 at the start down to 0.3 near the end, so
                // customers arrive more frequently as game time increases.
                const baseMin = 8;
                const baseMax = 14;
                const minClamp = 4;
                const scale = Math.min(1, Math.max(0.3, 1 - this.gameTime / this.dayLength));
                const lo = Math.max(minClamp, baseMin * scale);
                const hi = Math.max(minClamp, baseMax * scale);
                this._nextSpawnDelay = lo + Math.random() * (hi - lo);
                this._spawnCustomer();
            }
        }

        // ── 2. Per-customer movement + state transitions ───────────────────
        const ARRIVAL_THRESHOLD = 4; // px – "close enough" to target
        const { counter, exit }  = this.worldLayout;

        for (const customer of this.customers) {
            // ── Move toward target ─────────────────────────────────────────
            const dx   = customer.targetX - customer.x;
            const dy   = customer.targetY - customer.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > ARRIVAL_THRESHOLD) {
                const step = customer.speed * this.deltaTime;
                const move = Math.min(step, dist);
                customer.x += (dx / dist) * move;
                customer.y += (dy / dist) * move;
            } else {
                // Snap exactly to target
                customer.x = customer.targetX;
                customer.y = customer.targetY;
            }

            const atTarget = dist <= ARRIVAL_THRESHOLD;

            // ── State transitions ──────────────────────────────────────────
            switch (customer.state) {
                case 'entering':
                    // Customer walks to their assigned queue slot
                    if (atTarget) {
                        customer.state = 'in_queue';
                    }
                    break;

                case 'in_queue':
                    // Keep drifting to updated slot (queue may compact)
                    // Transition to to_counter is triggered by updateQueue()
                    break;

                case 'to_counter':
                    if (atTarget) {
                        customer.state = 'at_counter';
                        // Create the order when customer is physically at the counter
                        if (!this.currentOrder) {
                            this.currentOrder = new Order(customer.drinkType, customer.id);
                            this.showFeedback(
                                `Customer ${customer.id} wants a ${this.currentOrder.drink.label}!`,
                                'info'
                            );
                            console.log(
                                `Order assigned at counter: Customer ${customer.id} → ${customer.drinkType} ($${this.currentOrder.drink.price})`
                            );
                        }
                    }
                    break;

                case 'at_counter':
                    // Waiting; order management handled in updateCurrentOrder() / serveDrink()
                    break;

                case 'leaving_happy':
                case 'leaving_unhappy':
                    // Already moving toward exit – nothing extra needed; cleanup below
                    break;

                default:
                    break;
            }
        }

        // ── 3. Remove customers that have reached (or passed) the exit ────
        this.customers = this.customers.filter(customer => {
            if (customer.state !== 'leaving_happy' && customer.state !== 'leaving_unhappy') {
                return true; // keep
            }
            const dx = exit.x - customer.x;
            const dy = exit.y - customer.y;
            return Math.sqrt(dx * dx + dy * dy) > ARRIVAL_THRESHOLD;
        });
    }

    _spawnCustomer() {
        const drinkType = randomDrinkType();
        const entrance  = this.worldLayout.entrance;
        const customer  = {
            id:        this._nextCustomerId++,
            drinkType, // what they will order
            color:     this._randomCustomerColor(),
            // Current pixel position (starts at entrance)
            x:         entrance.x,
            y:         entrance.y,
            // Movement target and speed
            targetX:   entrance.x,
            targetY:   entrance.y,
            speed:     80, // pixels per second
            // Queue slot index (-1 = not yet assigned)
            slotIndex: -1,
            // State machine: entering → in_queue → to_counter → at_counter → leaving_happy | leaving_unhappy
            state:     'entering',
        };
        this.customers.push(customer);
        this.queue.push(customer);
        // Assign queue slots (gives this new customer a slot and updates any existing waiters)
        this._assignQueueSlots();
        console.log(`Customer ${customer.id} arrived, wants ${drinkType}`);
        this.playSound('customerArrival');
    }

    /**
     * Re-assign queue slot positions for all customers currently waiting in the
     * queue (state === 'entering' or 'in_queue').  Customers further from the
     * front get higher slot indices and therefore stand further back.
     */
    _assignQueueSlots() {
        let slotIdx = 0;
        for (const customer of this.queue) {
            if (customer.state === 'entering' || customer.state === 'in_queue') {
                customer.slotIndex = slotIdx;
                const slot = this.queueSlots[Math.min(slotIdx, this.queueSlots.length - 1)];
                customer.targetX = slot.x;
                customer.targetY = slot.y;
                slotIdx++;
            }
        }
    }

    _randomCustomerColor() {
        const colors = ['#CD5C5C', '#6495ED', '#2E8B57', '#DAA520', '#9370DB', '#20B2AA'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    updateQueue() {
        // If no active order and there are customers waiting, promote the front
        // customer to walk to the counter – but only once they are physically at
        // slot 0 (in_queue) so the visual matches the game logic.
        if (!this.currentOrder && this.queue.length > 0) {
            const front = this.queue[0];
            if (front.state === 'in_queue') {
                // Remove from waiting queue and send to counter
                this.queue.shift();
                front.state   = 'to_counter';
                front.targetX = this.worldLayout.counter.x;
                front.targetY = this.worldLayout.counter.y - 36; // stand just in front of counter
                // Re-slot the remaining waiters while the promoted customer walks up
                this._assignQueueSlots();
            }
        }
    }

    updateCurrentOrder() {
        if (!this.currentOrder) return;

        // Check if the customer's patience has run out
        if (this.currentOrder.isExpired()) {
            const drinkLabel = this.currentOrder.drink.label;
            const custId     = this.currentOrder.customerId;

            // Find the at_counter customer and send them away unhappy
            const customer = this.customers.find(c => c.id === custId);
            if (customer) {
                customer.state   = 'leaving_unhappy';
                customer.targetX = this.worldLayout.exit.x;
                customer.targetY = this.worldLayout.exit.y;
                customer.speed   = 100; // stomp out a bit faster
            }

            this.customersFailed++;
            this.currentOrder = null;
            // Cancel any in-progress preparation
            this.currentPrep  = null;
            this.showFeedback(`Customer ${custId} left without their ${drinkLabel}! -1 ☹`, 'error');
            console.log(`Customer ${custId} gave up waiting for ${drinkLabel}`);
            this.playSound('customerLeave');
        }
    }

    updateDrinkPreparation() {
        if (!this.currentPrep) return;

        if (this.currentPrep.isReady()) {
            // Brew finished – mark the drink as ready
            this.preparedDrink = { drinkType: this.currentPrep.drinkType };
            this.currentPrep   = null;
            const label = DRINKS.get(this.preparedDrink.drinkType).label;
            this.showFeedback(`${label} ready to serve!`, 'success');
            console.log(`${label} preparation complete`);
            this.playSound('drinkReady');
        }
    }

    prepareDrink(drinkType) {
        if (!DRINKS.has(drinkType)) {
            console.warn(`Unknown drink type: ${drinkType}`);
            return;
        }

        // If a drink is already prepared and waiting, discard it
        if (this.preparedDrink) {
            this.preparedDrink = null;
        }

        // If already brewing something, restart with the new selection
        this.currentPrep = new DrinkPreparation(drinkType);
        const prepSecs   = (this.currentPrep.prepTimeMs / 1000).toFixed(1);
        console.log(`Preparing ${drinkType} (${prepSecs}s)`);
        this.showFeedback(`Brewing ${DRINKS.get(drinkType).label}…`, 'info');
    }

    serveDrink() {
        if (!this.preparedDrink) {
            this.showFeedback('No drink prepared yet!', 'error');
            return;
        }
        if (!this.currentOrder) {
            this.showFeedback('No customer waiting!', 'error');
            return;
        }

        const orderedType  = this.currentOrder.drinkType;
        const servedType   = this.preparedDrink.drinkType;
        const orderedDrink = DRINKS.get(orderedType);
        const servedDrink  = DRINKS.get(servedType);
        const custId       = this.currentOrder.customerId;

        // Find the at_counter customer to animate them out
        const customer = this.customers.find(c => c.id === custId);

        if (servedType === orderedType) {
            // ✅ Correct order – earn the drink's price
            const earned = orderedDrink.price;
            this.money += earned;
            this.ordersCompleted++;
            if (customer) {
                customer.state   = 'leaving_happy';
                customer.targetX = this.worldLayout.exit.x;
                customer.targetY = this.worldLayout.exit.y;
                customer.speed   = 90;
            }
            this.showFeedback(
                `✓ Correct! ${orderedDrink.label} served. +$${earned}`,
                'success'
            );
            console.log(
                `Order fulfilled: ${orderedType} for customer ${custId} (+$${earned})`
            );
            this.playSound('serveSuccess');
        } else {
            // ✗ Wrong drink – small penalty
            const penalty = 2;
            this.money    = Math.max(0, this.money - penalty);
            this.customersFailed++;
            if (customer) {
                customer.state   = 'leaving_unhappy';
                customer.targetX = this.worldLayout.exit.x;
                customer.targetY = this.worldLayout.exit.y;
                customer.speed   = 100;
            }
            this.showFeedback(
                `✗ Wrong drink! Wanted ${orderedDrink.label}, got ${servedDrink.label}. -$${penalty}`,
                'error'
            );
            console.log(
                `Wrong drink: served ${servedType} but customer ${custId} wanted ${orderedType}`
            );
            this.playSound('serveFailure');
        }

        // Clear state ready for the next customer
        this.preparedDrink = null;
        this.currentOrder  = null;
        this.currentPrep   = null;
    }

    showFeedback(message, type) {
        // Create feedback message element
        const feedback = document.createElement('div');
        feedback.className = 'feedback-message';
        feedback.textContent = message;
        feedback.style.color = type === 'success' ? '#8FBC8F' : '#CD5C5C';

        document.getElementById('game-container').appendChild(feedback);

        // Remove after animation
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 2000);
    }

    switchScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        document.getElementById(screenId).classList.add('active');
    }

    endGame() {
        this.gameState = 'end';

        // Update end screen stats
        document.getElementById('end-money').textContent = `$${this.money}`;
        document.getElementById('end-orders').textContent = this.ordersCompleted.toString();
        document.getElementById('end-failed').textContent = this.customersFailed.toString();
        document.getElementById('end-time').textContent = `${Math.floor(this.gameTime)}s`;

        this.switchScreen('end-screen');
    }

    restartGame() {
        // Reset game state
        this.customers          = [];
        this.queue              = [];
        this.currentOrder       = null;
        this.currentPrep        = null;
        this.preparedDrink      = null;
        this._nextCustomerId    = 1;
        this._spawnAccumulator  = 0;
        this._nextSpawnDelay    = 0;

        this.startGame();
    }

    initializeAudio() {
        if (!this.audioEnabled) return;

        try {
            // Initialize Web Audio API context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create sound effects using simple oscillators
            this.sounds = {
                customerArrival: this.createSound(440, 0.1, 'sine'),
                drinkReady: this.createSound(880, 0.2, 'square'),
                serveSuccess: this.createSound(660, 0.3, 'sine'),
                serveFailure: this.createSound(220, 0.4, 'sawtooth'),
                customerLeave: this.createSound(330, 0.2, 'triangle')
            };

            console.log('Audio system initialized with Web Audio API');
        } catch (error) {
            console.warn('Audio system initialization failed:', error);
            this.audioEnabled = false;
        }
    }

    createSound(frequency, duration, type) {
        return () => {
            if (!this.audioEnabled || !this.audioContext) return;
            // Ensure the AudioContext is running (some browsers start suspended)
            if (this.audioContext.state === 'suspended') {
                try { this.audioContext.resume(); } catch (_) {}
            }

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = type;

            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        };
    }

    playSound(soundName) {
        if (!this.audioEnabled || !this.sounds || !this.sounds[soundName]) return;

        try {
            this.sounds[soundName]();
        } catch (error) {
            console.warn('Failed to play sound:', soundName, error);
        }
    }

    toggleMute() {
        this.audioEnabled = !this.audioEnabled;
        const muteButton = document.getElementById('mute-button');
        muteButton.textContent = this.audioEnabled ? '🔊' : '🔇';

        this.showFeedback(this.audioEnabled ? 'Sound on' : 'Sound off', 'info');
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new PixelCoffeeShop();
    console.log('Pixel Coffee Shop initialized!');
});
