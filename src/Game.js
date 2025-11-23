import { Tree } from './Tree.js';
import { Input } from './Input.js';
import { Weather } from './Weather.js';
import { ParticleSystem } from './ParticleSystem.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Set internal resolution for pixel art look
        this.width = 320;
        this.height = 480;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // Game State
        this.lastTime = 0;
        this.waterLevel = 100;
        this.treeAge = 0;
        this.lastLoginTime = Date.now();

        // Time Scale: 1 minute = 6 months (approx 180 days)
        // msPerDay = (60000ms) / 180 = ~333ms
        this.msPerDay = (1000 * 60) / 180;

        // Components
        this.tree = new Tree(this);
        this.input = new Input(this);
        this.weather = new Weather(this);
        this.particles = new ParticleSystem(this);

        // Bind loop
        this.loop = this.loop.bind(this);
    }

    start() {
        this.loadState();
        this.lastTime = performance.now();
        requestAnimationFrame(this.loop);
    }

    loop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame(this.loop);
    }

    update(deltaTime) {
        // Update logic here
        this.tree.update(deltaTime);
        this.weather.update(deltaTime);
        this.particles.update(deltaTime);
        this.checkGrowth();
    }

    checkGrowth() {
        const now = Date.now();
        const timeDiff = now - this.lastLoginTime;

        if (timeDiff >= this.msPerDay) {
            const daysPassed = Math.floor(timeDiff / this.msPerDay);

            if (daysPassed > 0) {
                // Update lastLoginTime to account for the days passed, keeping the remainder
                this.lastLoginTime += daysPassed * this.msPerDay;

                // Decay water
                const waterLoss = daysPassed * 0.1;
                this.waterLevel = Math.max(0, this.waterLevel - waterLoss);

                // Grow if had water
                if (this.waterLevel > 0) {
                    this.treeAge += daysPassed;
                }

                this.updateHUD();
                this.saveState();
            }
        }
    }

    render() {
        // Clear screen with weather-based background
        this.ctx.fillStyle = this.weather.getBackgroundColor();
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw Ground
        this.ctx.fillStyle = '#8B6F47'; // Earthy brown
        this.ctx.fillRect(0, this.height - 40, this.width, 40);

        // Draw Tree
        this.tree.render(this.ctx);

        // Draw particles (petals)
        this.particles.render(this.ctx);

        // Draw weather effects on top
        this.weather.render(this.ctx);
    }

    handleInput(type, coords, tool) {
        if (type === 'start') {
            if (tool === 'water') {
                this.waterTree();
            } else if (tool === 'trim') {
                this.trimTree(coords);
            } else if (tool === 'shield') {
                this.isShieldActive = true;
            }
        } else if (type === 'move') {
            if (tool === 'trim') {
                this.trimTree(coords);
            }
        } else if (type === 'end') {
            if (tool === 'shield') {
                this.isShieldActive = false;
            }
        }
    }

    loadState() {
        const saved = localStorage.getItem('dailyTreeCare');
        if (saved) {
            const state = JSON.parse(saved);
            this.waterLevel = state.waterLevel;
            this.treeAge = state.treeAge;
            this.lastLoginTime = state.lastLoginTime || Date.now(); // Fallback

            // Immediate catch-up on load
            this.checkGrowth();

        } else {
            // New Game
            this.waterLevel = 50;
            this.treeAge = 0; // Start at 0 (seed)
            this.lastLoginTime = Date.now();
            this.showMessage("Welcome! Plant a seed to start.");
        }

        this.updateHUD();
        this.saveState();
    }

    saveState() {
        const state = {
            waterLevel: this.waterLevel,
            treeAge: this.treeAge,
            lastLoginTime: Date.now()
        };
        localStorage.setItem('dailyTreeCare', JSON.stringify(state));
    }

    waterTree() {
        if (this.waterLevel < 100) {
            this.waterLevel = Math.min(100, this.waterLevel + 10);
            this.updateHUD();
            this.showMessage("Watered!");
            this.saveState();
        }
    }

    trimTree(coords) {
        if (this.tree.tryTrim(coords.x, coords.y)) {
            this.showMessage("Trimmed!");
            // Note: We don't strictly save tree structure in this simple version, 
            // but we could if we wanted persistent cuts. 
            // For now, trimming is just an interaction.
        }
    }

    skipDay() {
        const waterLoss = 10;
        this.waterLevel = Math.max(0, this.waterLevel - waterLoss);

        if (this.waterLevel > 0) {
            this.treeAge += 1;
        }

        this.showMessage("Skipped 1 Day");
        this.updateHUD();
        this.saveState();
    }

    jumpTwoYears() {
        this.treeAge += 730;
        this.waterLevel = 100; // Refill water so it doesn't die instantly
        this.showMessage("Warped 2 Years!");
        this.updateHUD();
        this.saveState();
    }

    hardReset() {
        localStorage.removeItem('dailyTreeCare');
        this.waterLevel = 100;
        this.treeAge = 0;
        this.lastLoginTime = Date.now();
        this.showMessage("Game Reset!");
        this.updateHUD();
        this.saveState();
        // Force tree regeneration
        this.tree.generate();
    }

    plantSeed() {
        this.hardReset();
        this.showMessage("Seed Planted!");
    }

    showMessage(text) {
        const msgEl = document.getElementById('message-area');
        if (msgEl) {
            msgEl.innerText = text;
            msgEl.style.opacity = 1;
            setTimeout(() => {
                msgEl.style.opacity = 0;
            }, 2000);
        }
    }

    updateHUD() {
        document.getElementById('water-level').innerText = Math.floor(this.waterLevel);
        document.getElementById('tree-age').innerText = this.treeAge;
    }
}
