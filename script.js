class PlasmaBlaster {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('Canvas element not found!');
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('Could not get 2D context!');
            return;
        }
        this.gameRunning = false;
        this.score = 0;
        this.gameSpeed = 1;
        this.playerHasMoved = false;
        
        // Set canvas to fullscreen first
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Load gun image
        this.gunImage = new Image();
        this.gunImageLoaded = false;
        this.gunImage.onload = () => {
            console.log('Gun image loaded successfully');
            this.gunImageLoaded = true;
        };
        this.gunImage.onerror = (error) => {
            console.log('Gun image failed to load:', error);
            this.gunImageLoaded = false;
        };
        this.gunImage.src = 'gun.png';
        
        // Load pew sound - create multiple instances for rapid fire
        this.pewSounds = [];
        this.currentPewIndex = 0;
        this.maxPewSounds = 5; // Create 5 sound instances for rapid fire
        
        for (let i = 0; i < this.maxPewSounds; i++) {
            const sound = new Audio('pew.mp3');
            sound.volume = 0.5; // Set volume to 50%
            sound.preload = 'auto';
            this.pewSounds.push(sound);
        }
        
        // Game objects - initialize after canvas is set up
        this.gun = {
            x: 50, // Position on left side
            y: this.canvas.height / 2,
            width: 80,
            height: 60,
            speed: 5
        };
        
        this.plasmaShots = [];
        this.fallingObjects = [];
        this.particles = [];
        
        // Game timing
        this.lastTime = 0;
        this.objectSpawnRate = 0.05; // Increased probability per frame
        this.maxObjects = 8;
        
        this.setupEventListeners();
        this.gameLoop();
        
        // Start the game immediately
        this.gameRunning = true;
        this.updateUI();
        console.log('Game started! Canvas size:', this.canvas.width, 'x', this.canvas.height);
        console.log('Gun position:', this.gun.x, this.gun.y);
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        // Update gun position when canvas resizes (only if gun exists)
        if (this.gun) {
            this.gun.y = this.canvas.height / 2;
        }
    }
    
    setupEventListeners() {
        const keys = {};
        
        document.addEventListener('keydown', (e) => {
            keys[e.code] = true;
            e.preventDefault();
            
        });
        
        document.addEventListener('keyup', (e) => {
            keys[e.code] = false;
        });
        
        // Handle key presses
        setInterval(() => {
            if (!this.gameRunning || !this.gun) return;
            
            let moved = false;
            
            // Arrow keys and WASD movement
            if ((keys['ArrowUp'] || keys['KeyW']) && this.gun.y > 0) {
                this.gun.y -= this.gun.speed;
                moved = true;
            }
            if ((keys['ArrowDown'] || keys['KeyS']) && this.gun.y < this.canvas.height - this.gun.height) {
                this.gun.y += this.gun.speed;
                moved = true;
            }
            
            // Hide controls when player moves
            if (moved && !this.playerHasMoved) {
                this.playerHasMoved = true;
                this.hideControls();
            }
            
            if (keys['Space']) {
                this.shootPlasma();
            }
        }, 16); // ~60fps
        
        // Restart button
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });
        
        // Mouse click to shoot
        this.canvas.addEventListener('click', (e) => {
            if (this.gameRunning) {
                this.shootPlasma();
            }
        });
    }
    
    shootPlasma() {
        if (!this.gameRunning || !this.gun) return;
        
        // Play pew sound for each shot (works for both mouse and keyboard)
        if (this.pewSounds && this.pewSounds.length > 0) {
            const currentSound = this.pewSounds[this.currentPewIndex];
            currentSound.currentTime = 0; // Reset to beginning
            currentSound.play().catch(error => {
                console.log('Could not play pew sound:', error);
            });
            
            // Move to next sound instance for next shot
            this.currentPewIndex = (this.currentPewIndex + 1) % this.maxPewSounds;
        }
        
        this.plasmaShots.push({
            x: this.gun.x + this.gun.width, // Shoot from the right side of the gun
            y: this.gun.y + this.gun.height / 2 - 2 - 15, // Move up 15 pixels
            width: 8,
            height: 4,
            speed: 8
        });
    }
    
    spawnFallingObject() {
        if (this.fallingObjects.length >= this.maxObjects) return;
        
        const types = ['asteroid', 'enemy', 'powerup'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        this.fallingObjects.push({
            x: this.canvas.width + 40, // Start from right side
            y: Math.random() * (this.canvas.height - 40),
            width: 30 + Math.random() * 20,
            height: 30 + Math.random() * 20,
            speed: 2 + Math.random() * 3,
            type: type,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.1
        });
    }
    
    updateGameObjects(deltaTime) {
        // Update plasma shots (now moving horizontally to the right)
        this.plasmaShots = this.plasmaShots.filter(shot => {
            shot.x += shot.speed;
            return shot.x < this.canvas.width + shot.width;
        });
        
        // Update falling objects (now moving horizontally to the left)
        this.fallingObjects = this.fallingObjects.filter(obj => {
            obj.x -= obj.speed * this.gameSpeed;
            obj.rotation += obj.rotationSpeed;
            
            // Check if object hit the left side - just remove it, no lives lost
            if (obj.x < -obj.width) {
                console.log('Object escaped off screen');
                return false;
            }
            return true;
        });
        
        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            particle.alpha = particle.life / particle.maxLife;
            return particle.life > 0;
        });
        
        // Spawn new objects
        if (Math.random() < this.objectSpawnRate) {
            this.spawnFallingObject();
            console.log('Spawned object, total objects:', this.fallingObjects.length);
        }
        
        // Increase difficulty over time
        this.gameSpeed = Math.min(3, 1 + this.score * 0.001);
        this.objectSpawnRate = Math.min(0.05, 0.02 + this.score * 0.00001);
    }
    
    checkCollisions() {
        // Check plasma shots vs falling objects
        this.plasmaShots.forEach((shot, shotIndex) => {
            this.fallingObjects.forEach((obj, objIndex) => {
                if (this.isColliding(shot, obj)) {
                    // Remove shot and object
                    this.plasmaShots.splice(shotIndex, 1);
                    this.fallingObjects.splice(objIndex, 1);
                    
                    // Create explosion particles
                    this.createExplosion(obj.x + obj.width/2, obj.y + obj.height/2);
                    
                    // Update score based on object type
                    if (obj.type === 'enemy') {
                        this.score += 100;
                    } else if (obj.type === 'asteroid') {
                        this.score += 50;
                    } else if (obj.type === 'powerup') {
                        this.score += 200;
                        // Power-ups still give bonus points but no lives
                    }
                    
                    this.updateUI();
                }
            });
        });
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    createExplosion(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 30,
                maxLife: 30,
                alpha: 1,
                color: `hsl(${Math.random() * 60 + 20}, 100%, 60%)`
            });
        }
    }
    
    draw() {
        // Clear canvas with black background
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        
        // Draw typographic background
        this.drawPEWBackground();
        
        // Draw gun
        this.drawGun();
        
        // Draw plasma shots
        this.plasmaShots.forEach(shot => {
            this.ctx.fillStyle = '#00ff88';
            this.ctx.fillRect(shot.x, shot.y, shot.width, shot.height);
            
            // Add glow effect
            this.ctx.shadowColor = '#00ff88';
            this.ctx.shadowBlur = 10;
            this.ctx.fillRect(shot.x, shot.y, shot.width, shot.height);
            this.ctx.shadowBlur = 0;
        });
        
        // Draw falling objects
        this.fallingObjects.forEach(obj => {
            this.ctx.save();
            this.ctx.translate(obj.x + obj.width/2, obj.y + obj.height/2);
            this.ctx.rotate(obj.rotation);
            
            // Add warning glow if object is close to left side
            if (obj.x < 100) {
                this.ctx.shadowColor = '#ff0000';
                this.ctx.shadowBlur = 20;
            }
            
            if (obj.type === 'asteroid') {
                this.drawAsteroid(-obj.width/2, -obj.height/2, obj.width, obj.height);
            } else if (obj.type === 'enemy') {
                this.drawEnemy(-obj.width/2, -obj.height/2, obj.width, obj.height);
            } else if (obj.type === 'powerup') {
                this.drawPowerup(-obj.width/2, -obj.height/2, obj.width, obj.height);
            }
            
            this.ctx.shadowBlur = 0;
            this.ctx.restore();
        });
        
        // Draw particles
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
            this.ctx.restore();
        });
    }
    
    drawPEWBackground() {
        // Calculate responsive font size based on canvas dimensions
        const fontSize = Math.min(this.canvas.width, this.canvas.height) * 0.3;
        
        // Set up the text styling - white text
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'; // Very subtle white tint
        this.ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Calculate position to center the text
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Draw the main "$PEW" text
        this.ctx.fillText('$PEW', centerX, centerY);
        
        // Add some subtle glow effect
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.2)';
        this.ctx.shadowBlur = 20;
        this.ctx.fillText('$PEW', centerX, centerY);
        this.ctx.shadowBlur = 0;
        
        // Add smaller "$PEW" text in corners for more coverage
        const smallFontSize = fontSize * 0.3;
        this.ctx.font = `bold ${smallFontSize}px Arial, sans-serif`;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        
        // Top-left
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText('$PEW', 20, 20);
        
        // Top-right
        this.ctx.textAlign = 'right';
        this.ctx.fillText('$PEW', this.canvas.width - 20, 20);
        
        // Bottom-left
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'bottom';
        this.ctx.fillText('$PEW', 20, this.canvas.height - 20);
        
        // Bottom-right
        this.ctx.textAlign = 'right';
        this.ctx.fillText('$PEW', this.canvas.width - 20, this.canvas.height - 20);
        
        // Reset text alignment
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'alphabetic';
    }
    
    drawGun() {
        if (!this.gun) return;
        
        // Draw gun image if loaded, otherwise draw placeholder
        if (this.gunImageLoaded && this.gunImage.complete && this.gunImage.naturalWidth !== 0) {
            try {
                this.ctx.drawImage(this.gunImage, this.gun.x, this.gun.y, this.gun.width, this.gun.height);
                console.log('Drawing gun image at:', this.gun.x, this.gun.y, this.gun.width, this.gun.height);
            } catch (error) {
                console.log('Error drawing gun image:', error);
                this.drawFallbackGun();
            }
        } else {
            console.log('Using fallback gun - image loaded:', this.gunImageLoaded, 'complete:', this.gunImage.complete, 'naturalWidth:', this.gunImage.naturalWidth);
            this.drawFallbackGun();
        }
    }
    
    drawFallbackGun() {
        if (!this.gun) return;
        
        // Fallback gun drawing - black and white
        this.ctx.fillStyle = '#333333'; // Dark gray gun body
        this.ctx.fillRect(this.gun.x, this.gun.y, this.gun.width, this.gun.height);
        
        // Gun barrel
        this.ctx.fillStyle = '#666666';
        this.ctx.fillRect(this.gun.x + this.gun.width - 10, this.gun.y + this.gun.height/2 - 5, 15, 10);
        
        // Gun details
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(this.gun.x + 5, this.gun.y + 5, this.gun.width - 15, this.gun.height - 10);
        
        console.log('Drawing fallback gun at:', this.gun.x, this.gun.y);
    }
    
    drawAsteroid(x, y, width, height) {
        this.ctx.fillStyle = '#666666'; // Gray asteroid
        this.ctx.fillRect(x, y, width, height);
        
        // Add some detail
        this.ctx.fillStyle = '#888888';
        this.ctx.fillRect(x + 5, y + 5, width - 10, height - 10);
    }
    
    drawEnemy(x, y, width, height) {
        this.ctx.fillStyle = '#333333'; // Dark gray enemy
        this.ctx.fillRect(x, y, width, height);
        
        // Enemy details
        this.ctx.fillStyle = '#555555';
        this.ctx.fillRect(x + 5, y + 5, width - 10, height - 10);
        
        // Eyes
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(x + width/4, y + height/4, 3, 3);
        this.ctx.fillRect(x + 3*width/4 - 3, y + height/4, 3, 3);
    }
    
    drawPowerup(x, y, width, height) {
        this.ctx.fillStyle = '#ffffff'; // White powerup
        this.ctx.fillRect(x, y, width, height);
        
        // Border
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x, y, width, 2); // Top border
        this.ctx.fillRect(x, y + height - 2, width, 2); // Bottom border
        this.ctx.fillRect(x, y, 2, height); // Left border
        this.ctx.fillRect(x + width - 2, y, 2, height); // Right border
        
        // Plus sign
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x + width/2 - 2, y + height/4, 4, height/2);
        this.ctx.fillRect(x + width/4, y + height/2 - 2, width/2, 4);
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
    }
    
    hideControls() {
        const controlsElement = document.querySelector('.controls');
        if (controlsElement) {
            controlsElement.style.opacity = '0';
            controlsElement.style.transition = 'opacity 0.5s ease-out';
            setTimeout(() => {
                controlsElement.style.display = 'none';
            }, 500);
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').style.display = 'block';
    }
    
    restartGame() {
        this.gameRunning = true;
        this.score = 0;
        this.gameSpeed = 1;
        this.playerHasMoved = false;
        this.plasmaShots = [];
        this.fallingObjects = [];
        this.particles = [];
        this.gun.x = 50; // Reset to left side
        this.gun.y = this.canvas.height / 2;
        
        document.getElementById('gameOver').style.display = 'none';
        
        // Show controls again
        const controlsElement = document.querySelector('.controls');
        if (controlsElement) {
            controlsElement.style.display = 'block';
            controlsElement.style.opacity = '1';
        }
        
        this.updateUI();
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        if (this.gameRunning) {
            this.updateGameObjects(deltaTime);
            this.checkCollisions();
        }
        
        this.draw();
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    const game = new PlasmaBlaster();
});
