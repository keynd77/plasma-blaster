# PlasmaBlaster 🎮

A fullscreen web-based plasma shooting game with falling objects. Defend your position with a plasma gun against incoming threats!

## 🎯 Game Features

- **Fullscreen Gameplay**: Immersive fullscreen experience
- **Dual Controls**: Arrow keys or WASD for movement
- **Plasma Shooting**: Shoot bright green plasma bolts at incoming objects
- **Black & White Design**: Minimalist monochrome aesthetic with colorful plasma
- **Responsive Typography**: Large "PEW" background text that scales with screen size
- **Smart UI**: Controls disappear when you start playing
- **Progressive Difficulty**: Game speed increases as you score more points

## 🎮 How to Play

1. **Movement**: Use Arrow Keys or WASD to move your gun up/down
2. **Shooting**: Press SPACE to fire plasma bolts
3. **Objective**: Destroy objects flying from the right side
4. **Scoring**: 
   - Asteroids: 50 points
   - Enemies: 100 points  
   - Power-ups: 200 points + bonus life
5. **Lives**: You have 3 lives - lose one when objects reach the left side

## 🚀 Getting Started

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/keynd77/plasma-blaster.git
   cd plasma-blaster
   ```

2. **Start a local server**:
   ```bash
   # Using Python
   python3 -m http.server 8000
   
   # Or using Node.js (if you have live-server installed)
   npx live-server
   ```

3. **Open in browser**: Navigate to `http://localhost:8000`

### Direct File Access

Simply open `index.html` in your web browser (though some features may not work due to CORS restrictions).

## 🎨 Game Design

- **Background**: Pure black with subtle white "PEW" typography
- **Gun**: Dark gray with white details (or custom gun.png image)
- **Objects**: Various gray tones for asteroids and enemies
- **Plasma**: Bright green (#00ff88) with glow effects
- **UI**: Clean white text and borders

## 🛠️ Technical Details

- **Pure HTML/CSS/JavaScript**: No external dependencies
- **Canvas-based rendering**: Smooth 60fps gameplay
- **Responsive design**: Adapts to any screen size
- **Collision detection**: Precise hit detection
- **Particle effects**: Explosion animations
- **Sound ready**: Structure in place for audio integration

## 📁 Project Structure

```
plasma-blaster/
├── index.html          # Main game page
├── style.css           # Game styling
├── script.js           # Game logic
├── gun.png            # Gun image (optional)
├── test-image.html     # Image loading test
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## 🎯 Game Mechanics

- **Object Spawning**: Objects appear from the right side at random intervals
- **Collision System**: Only lose lives when objects are near your gun's vertical position
- **Power-ups**: White objects with black borders that give bonus lives
- **Progressive Difficulty**: Spawn rate and speed increase with score
- **Life System**: Start with 3 lives, gain bonus lives from power-ups

## 🚀 Deployment

The game can be deployed to any static hosting service:

- **GitHub Pages**: Enable in repository settings
- **Netlify**: Drag and drop the folder
- **Vercel**: Connect your GitHub repository
- **Any web server**: Upload files to your hosting provider

## 🎮 Controls

| Key | Action |
|-----|--------|
| ↑ / W | Move gun up |
| ↓ / S | Move gun down |
| Space | Shoot plasma |

## 🏆 Scoring System

- **Asteroids** (Gray): 50 points
- **Enemies** (Dark gray with white eyes): 100 points
- **Power-ups** (White with black border): 200 points + bonus life

## 🎨 Customization

- Replace `gun.png` with your own gun image
- Modify colors in `style.css` and `script.js`
- Adjust game speed and spawn rates in `script.js`
- Add sound effects by extending the audio system

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests to improve the game!

---

**Enjoy defending your position with PlasmaBlaster!** 🎮⚡
