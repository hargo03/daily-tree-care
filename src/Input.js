export class Input {
    constructor(game) {
        this.game = game;
        this.canvas = game.canvas;
        this.activeTool = 'water'; // Default tool

        this.setupEventListeners();
    }

    setupEventListeners() {
        console.log("Input: Setting up event listeners...");
        // Tool selection
        const toolBtns = document.querySelectorAll('.tool-btn');
        console.log(`Input: Found ${toolBtns.length} tool buttons`);
        toolBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all
                toolBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked
                const target = e.currentTarget; // Use currentTarget to get the button, not the icon
                target.classList.add('active');
                this.activeTool = target.dataset.tool;
                console.log('Tool selected:', this.activeTool);
            });
        });

        // Canvas interaction (Pointer Events - handles Mouse & Touch)
        this.canvas.addEventListener('pointerdown', (e) => {
            this.canvas.setPointerCapture(e.pointerId);
            this.handleInputStart(e);
        });
        this.canvas.addEventListener('pointermove', (e) => this.handleInputMove(e));
        this.canvas.addEventListener('pointerup', (e) => {
            this.canvas.releasePointerCapture(e.pointerId);
            this.handleInputEnd(e);
        });
        this.canvas.addEventListener('pointercancel', (e) => {
            this.canvas.releasePointerCapture(e.pointerId);
            this.handleInputEnd(e);
        });

        // Debug Skip Button
        const skipBtn = document.getElementById('debug-skip-btn');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                this.game.skipDay();
            });
        }

        // Debug Jump Button
        const jumpBtn = document.getElementById('debug-jump-btn');
        if (jumpBtn) {
            jumpBtn.addEventListener('click', () => {
                this.game.jumpTwoYears();
            });
        }

        // Debug Reset Button
        const resetBtn = document.getElementById('debug-reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.game.hardReset();
            });
        }

        // Plant Seed Button
        const plantBtn = document.getElementById('plant-seed-btn');
        if (plantBtn) {
            plantBtn.addEventListener('click', () => {
                this.game.plantSeed();
            });
        }
    }

    getCanvasCoordinates(e) {
        const rect = this.canvas.getBoundingClientRect();
        // Pointer events have clientX/Y directly
        const clientX = e.clientX;
        const clientY = e.clientY;

        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    handleInputStart(e) {
        e.preventDefault();
        this.isDown = true;
        const coords = this.getCanvasCoordinates(e);
        this.game.handleInput('start', coords, this.activeTool);
    }

    handleInputMove(e) {
        e.preventDefault();
        if (!this.isDown) return;
        const coords = this.getCanvasCoordinates(e);
        this.game.handleInput('move', coords, this.activeTool);
    }

    handleInputEnd(e) {
        e.preventDefault();
        this.isDown = false;
        this.game.handleInput('end', null, this.activeTool);
    }
}
