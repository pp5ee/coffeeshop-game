// Pixel Coffee Shop - Core Game Engine

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

        // Game objects (to be implemented)
        this.customers = [];
        this.queue = [];
        this.currentOrder = null;
        this.preparedDrink = null;

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

        // Initialize audio system (to be implemented)
        this.audioEnabled = true;
        this.audioContext = null;
    }

    startGame() {
        this.gameState = 'gameplay';
        this.gameTime = 0;
        this.money = 0;
        this.ordersCompleted = 0;
        this.customersFailed = 0;

        // Switch to game screen
        this.switchScreen('game-screen');

        // Start game loop
        this.lastTime = performance.now();
        this.gameLoop();

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
        // Placeholder for customer rendering
        // Will be implemented in customer system
        this.customers.forEach(customer => {
            if (customer.sprite) {
                this.ctx.drawImage(customer.sprite, customer.x, customer.y);
            } else {
                // Fallback: draw colored squares
                this.ctx.fillStyle = customer.color || '#CD5C5C';
                this.ctx.fillRect(customer.x, customer.y, 32, 32);

                // Draw customer number
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.font = '12px Courier New';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(customer.id.toString(), customer.x + 16, customer.y + 20);
            }
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

        // Update current order display
        const orderDisplay = document.getElementById('current-order');
        if (this.currentOrder) {
            orderDisplay.textContent = this.currentOrder.type || 'Unknown Order';
        } else {
            orderDisplay.textContent = 'Waiting for customer...';
        }

        // Update preparation status
        const prepStatus = document.getElementById('preparing-drink');
        if (this.preparedDrink) {
            prepStatus.textContent = `${this.preparedDrink.type} ready!`;
            document.getElementById('serve-button').disabled = false;
        } else {
            prepStatus.textContent = 'Ready to prepare';
            document.getElementById('serve-button').disabled = true;
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
        // Placeholder - will be implemented in customer system
        console.log('Customer spawning started');
    }

    updateCustomers() {
        // Placeholder - will be implemented in customer system
    }

    updateQueue() {
        // Placeholder - will be implemented in queue system
    }

    updateCurrentOrder() {
        // Placeholder - will be implemented in order system
    }

    updateDrinkPreparation() {
        // Placeholder - will be implemented in preparation system
    }

    prepareDrink(drinkType) {
        // Placeholder - will be implemented in preparation system
        console.log(`Preparing ${drinkType}`);

        // Simulate preparation time
        setTimeout(() => {
            this.preparedDrink = { type: drinkType };
            this.showFeedback(`${drinkType} ready!`, 'success');
        }, 1000);
    }

    serveDrink() {
        if (!this.preparedDrink || !this.currentOrder) {
            this.showFeedback('No drink prepared or no customer!', 'error');
            return;
        }

        // Placeholder - will implement proper order matching
        if (this.preparedDrink.type === this.currentOrder.type) {
            this.money += 5;
            this.ordersCompleted++;
            this.showFeedback('Order served correctly! +$5', 'success');
        } else {
            this.money -= 2;
            this.showFeedback('Wrong order! -$2', 'error');
        }

        this.preparedDrink = null;
        this.currentOrder = null;
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
        this.customers = [];
        this.queue = [];
        this.currentOrder = null;
        this.preparedDrink = null;

        this.startGame();
    }

    initializeAudio() {
        if (!this.audioEnabled) return;

        // Placeholder for audio initialization
        // Will use Web Audio API with user gesture requirement
        console.log('Audio system initialized');
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