# Pixel Coffee Shop

A cozy pixel-art coffee shop management game built with plain HTML, CSS, and JavaScript. Manage your coffee shop by serving customers, preparing drinks, and earning money while keeping customers happy.

## Features

- **Pixel-Art Style**: Retro-inspired visuals with warm, cozy colors
- **Customer Management**: Customers arrive, join queues, place orders, and wait patiently
- **Drink Preparation**: Prepare espresso, americano, latte, and cappuccino with different preparation times
- **Order System**: Data-driven order management with patience tracking
- **Audio Feedback**: Web Audio API sound effects for key game events
- **Game States**: Start screen, active gameplay, and end-of-day summary
- **Progressive Difficulty**: Customers arrive faster as time progresses

## Gameplay

### Core Loop
1. **Customers Arrive**: New customers enter the shop at regular intervals
2. **Queue Management**: Customers wait in line for their turn at the counter
3. **Order Placement**: The front customer places an order and shows their patience meter
4. **Drink Preparation**: Click drink buttons to start preparing the ordered beverage
5. **Serving**: Serve the prepared drink to the customer
6. **Success/Failure**: Correct orders earn money, wrong orders incur penalties
7. **Customer Departure**: Happy customers leave, impatient customers leave unhappy

### Drink Types

| Drink | Price | Preparation Time | Description |
|-------|-------|------------------|-------------|
| Espresso | $3 | 2 seconds | Strong black coffee |
| Americano | $4 | 3 seconds | Espresso with hot water |
| Latte | $5 | 4.5 seconds | Espresso with steamed milk |
| Cappuccino | $5 | 5 seconds | Espresso with equal parts milk foam |

### Scoring
- **Money**: Earn money by serving correct orders
- **Completed Orders**: Track successful serves
- **Failed Customers**: Customers who leave due to impatience or wrong orders

## Setup and Installation

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No additional software or dependencies required

### Running the Game
1. **Download the files**: Ensure you have all project files:
   - `index.html`
   - `style.css` 
   - `script.js`

2. **Open in browser**: Double-click `index.html` or open it in your web browser

3. **Start playing**: Click the "Start Game" button to begin

### File Structure
```
pixel-coffee-shop/
├── index.html          # Main HTML file with game structure
├── style.css           # CSS styling and pixel-art design
├── script.js           # Core game logic and systems
└── README.md           # This documentation file
```

## How to Play

### Controls
- **Drink Buttons**: Click to start preparing a specific drink
- **Serve Button**: Click when a drink is ready to serve to the current customer
- **Mute Button**: Toggle sound effects on/off
- **Start/Restart**: Begin a new game session

### Game Mechanics

#### Customer Flow
1. Customers spawn at the entrance every 5-13 seconds
2. They join the queue and wait their turn
3. When they reach the counter, they place an order
4. A patience meter starts counting down (20 seconds total)
5. Serve the correct drink before patience runs out

#### Preparation System
- Each drink has a specific preparation time
- Progress is shown as a percentage
- Only one drink can be prepared at a time
- Prepared drinks remain ready until served

#### Scoring System
- **Correct Order**: Earn the drink's price
- **Wrong Order**: Lose $2 and count as failed customer
- **Impatient Customer**: Count as failed customer

### Strategy Tips
- Prioritize faster drinks when customers are impatient
- Pay attention to the patience meter color (green→yellow→red)
- Don't start preparing until you see the order
- Keep an eye on the queue length to anticipate busy periods

## Technical Details

### Architecture

The game is built with a modular JavaScript architecture:

#### Core Systems
- **Game Loop**: `requestAnimationFrame` with delta time compensation
- **State Management**: Finite state machine for game states (start, gameplay, end)
- **Customer System**: FSM for customer states (walking, queued, at_counter, leaving)
- **Order System**: Data-driven drink definitions with patience tracking
- **Audio System**: Web Audio API with oscillator-based sound effects

#### Key Classes
- **PixelCoffeeShop**: Main game controller
- **Order**: Represents customer drink requests with patience
- **DrinkPreparation**: Tracks in-progress drink preparation

### Browser Compatibility
- **Supported**: Chrome 60+, Firefox 55+, Safari 11+, Edge 79+
- **Audio**: Requires Web Audio API support
- **Performance**: Optimized for 60 FPS with 4-6 customers

### File Descriptions

#### index.html
- Main HTML structure with game screens
- Canvas element for game world rendering
- UI elements for stats, controls, and feedback

#### style.css  
- Pixel-art styling with warm color palette
- Responsive layout with 32px grid mindset
- CSS animations for feedback messages

#### script.js
- Complete game engine implementation
- Customer spawning and movement logic
- Order and preparation system
- Audio system with Web Audio API
- UI updates and game state management

## Development

### Code Organization

The JavaScript code is organized into logical sections:

```javascript
// Data-driven drink definitions
const DRINKS = new Map([...]);

// Order class with patience system
class Order { ... }

// Drink preparation tracking
class DrinkPreparation { ... }

// Main game controller
class PixelCoffeeShop { ... }
```

### Key Features Implemented

- ✅ Customer spawning with random intervals
- ✅ Queue management with position tracking
- ✅ Order system with four base drink types
- ✅ Patience system with visual meter
- ✅ Preparation system with progress tracking
- ✅ Serving mechanics with success/failure feedback
- ✅ Audio system with Web Audio API
- ✅ Game state management (start/gameplay/end)
- ✅ Progressive difficulty scaling

## Future Enhancements

Potential extensions for the game:

### Gameplay Features
- More drink types and modifiers (size, milk type, sweetness)
- Customer preferences and special orders
- Shop upgrades and equipment improvements
- Multiple difficulty levels
- High score tracking with localStorage

### Visual Enhancements
- Animated customer sprites
- Particle effects for serving and preparation
- Day/night cycle with lighting changes
- Seasonal themes and decorations

### Technical Improvements
- Modular code splitting for better organization
- Performance optimizations for larger customer counts
- Touch screen support for mobile devices
- Progressive Web App (PWA) capabilities

## Troubleshooting

### Common Issues

**Game won't start:**
- Ensure all files are in the same directory
- Check browser console for error messages
- Try refreshing the page

**No sound effects:**
- Click the start button first (audio requires user gesture)
- Check if your browser supports Web Audio API
- Try enabling audio in browser settings

**Performance issues:**
- Close other browser tabs
- Ensure you're using a modern browser
- The game is optimized for 4-6 customers simultaneously

### Browser Console

If you encounter issues, check the browser console (F12 → Console) for error messages. The game includes comprehensive logging to help diagnose problems.

## License

This project is open source and available for educational and personal use. Feel free to modify and extend the game as needed.

## Credits

Built with vanilla HTML, CSS, and JavaScript. No external frameworks or libraries used.

---

**Enjoy managing your pixel coffee shop! ☕**