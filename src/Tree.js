export class Tree {
    constructor(game) {
        this.game = game;
        this.branches = [];
        this.leaves = [];
        this.maxDepth = 0;
        this.seed = Math.random(); // For deterministic randomness if needed later

        this.generate();
    }

    generate() {
        this.branches = [];
        this.leaves = [];
        // Base trunk
        const startX = this.game.width / 2;
        const startY = this.game.height - 40;
        const length = 60;
        const angle = -Math.PI / 2; // Upwards
        const depth = 1;

        this.growBranch(startX, startY, length, angle, depth);
    }

    growBranch(x, y, length, angle, depth) {
        const endX = x + Math.cos(angle) * length;
        const endY = y + Math.sin(angle) * length;

        this.branches.push({
            x: x,
            y: y,
            endX: endX,
            endY: endY,
            thickness: Math.max(1, 6 - depth), // Thinner as it goes up
            depth: depth
        });

        // Recursion limit based on tree age
        // Adjusted for long-term growth:
        // Age 0-30: Depth 2
        // Age 30-90: Depth 3
        // ...
        // Age 700+: Depth 7 (Max)
        const maxGenDepth = Math.min(7, Math.floor(this.game.treeAge / 120) + 2);

        if (depth < maxGenDepth) {
            // Two branches
            const subLength = length * 0.75;
            const angleOffset = 0.3 + (Math.random() * 0.2); // Random spread

            this.growBranch(endX, endY, subLength, angle - angleOffset, depth + 1);
            this.growBranch(endX, endY, subLength, angle + angleOffset, depth + 1);
        } else {
            // Add leaves at the tips
            const blossomColors = [
                '#FFB7D5', // Light pink
                '#FF69B4', // Hot pink
                '#FFF0F5', // Lavender blush (white)
                '#FFE4E1', // Misty rose
                '#FADADD'  // Light pink
            ];
            this.leaves.push({
                x: endX,
                y: endY,
                size: 4,
                id: Math.random().toString(36).substr(2, 9),
                color: blossomColors[Math.floor(Math.random() * blossomColors.length)]
            });
        }
    }

    update(deltaTime) {
        // Wind animation with weather influence
        this.windTime = (this.windTime || 0) + deltaTime * 0.001;
        const baseWind = Math.sin(this.windTime) * 0.1;
        const weatherMultiplier = this.game.weather ? this.game.weather.getWindMultiplier() : 1.0;
        this.windForce = baseWind * weatherMultiplier;
        if (isNaN(this.windForce)) this.windForce = 0;

        // If shield is active (passed from game), reduce wind
        if (this.game.isShieldActive) {
            this.windForce *= 0.1;
        }

        if (this.game.treeAge !== this.lastAge) {
            this.lastAge = this.game.treeAge;
            this.generate();
        }
    }

    render(ctx) {
        // Special case for seed state
        if (this.game.treeAge === 0) {
            const startX = this.game.width / 2;
            const startY = this.game.height - 40;

            // Draw Seed
            ctx.fillStyle = '#8B4513'; // Brown
            ctx.beginPath();
            ctx.arc(startX, startY + 5, 5, 0, Math.PI * 2);
            ctx.fill();

            // Draw small sprout
            ctx.strokeStyle = '#32CD32'; // Lime Green
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(startX, startY - 10);
            ctx.stroke();

            // Debug log
            if (Math.random() < 0.01) {
                console.log(`Rendering Seed: Age=${this.game.treeAge}`);
            }
            return;
        }

        // Re-generate to apply wind (expensive but simple for this scale)
        // In a real optimized game, we'd just transform the existing structure
        // But for < 100 branches, re-generating is fine and allows for dynamic wind
        this.branches = [];
        this.leaves = [];
        const startX = this.game.width / 2;
        const startY = this.game.height - 40;
        const length = 60;
        const angle = -Math.PI / 2;
        this.growBranch(startX, startY, length, angle, 1);

        // Debug log (throttle to once per second roughly)
        if (Math.random() < 0.01) {
            console.log(`Rendering Tree: Age=${this.game.treeAge}, Branches=${this.branches.length}, Leaves=${this.leaves.length}`);
        }

        // Draw Branches with darker bark
        ctx.strokeStyle = '#4A3728'; // Dark brown bark
        ctx.lineCap = 'square'; // Pixel feel

        for (const branch of this.branches) {
            ctx.lineWidth = branch.thickness;
            ctx.beginPath();
            ctx.moveTo(Math.floor(branch.x), Math.floor(branch.y));
            ctx.lineTo(Math.floor(branch.endX), Math.floor(branch.endY));
            ctx.stroke();
        }

        // Draw Cherry Blossoms as clusters
        const blossomColors = [
            '#FFB7D5', // Light pink
            '#FF69B4', // Hot pink
            '#FFF0F5', // Lavender blush (white)
            '#FFE4E1', // Misty rose
            '#FADADD'  // Light pink
        ];

        for (const leaf of this.leaves) {
            const color = blossomColors[Math.floor(Math.random() * blossomColors.length)];
            ctx.fillStyle = color;

            // Draw cluster of 3-5 small blossoms
            const clusterSize = 2 + Math.floor(Math.random() * 3);
            for (let i = 0; i < clusterSize; i++) {
                const offsetX = (Math.random() - 0.5) * 4;
                const offsetY = (Math.random() - 0.5) * 4;
                ctx.fillRect(
                    Math.floor(leaf.x + offsetX),
                    Math.floor(leaf.y + offsetY),
                    2,
                    2
                );
            }
        }
    }

    tryTrim(x, y) {
        // Simple distance check for leaves
        for (let i = this.leaves.length - 1; i >= 0; i--) {
            const leaf = this.leaves[i];
            const dx = x - leaf.x;
            const dy = y - leaf.y;
            if (dx * dx + dy * dy < 100) { // 10px radius
                this.leaves.splice(i, 1);
                return true;
            }
        }
        return false;
    }
}
