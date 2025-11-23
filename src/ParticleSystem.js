export class ParticleSystem {
    constructor(game) {
        this.game = game;
        this.petals = [];
    }

    spawnPetal(x, y) {
        this.petals.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 0.5,
            vy: Math.random() * 0.3 + 0.2,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            life: 1.0,
            color: Math.random() > 0.5 ? '#FFB7D5' : '#FFF0F5', // Pink or white
            size: 3 + Math.random() * 2
        });
    }

    update(deltaTime) {
        const windForce = this.game.tree.windForce || 0;

        // Randomly spawn petals from tree
        if (this.game.treeAge > 10 && Math.random() < 0.02) {
            const treeX = this.game.width / 2 + (Math.random() - 0.5) * 60;
            const treeY = this.game.height - 100 - Math.random() * 100;
            this.spawnPetal(treeX, treeY);
        }

        // Update existing petals
        for (let i = this.petals.length - 1; i >= 0; i--) {
            const petal = this.petals[i];

            // Physics
            petal.x += petal.vx + windForce * 20;
            petal.y += petal.vy;
            petal.rotation += petal.rotationSpeed;
            petal.life -= 0.002;

            // Remove dead petals
            if (petal.life <= 0 || petal.y > this.game.height) {
                this.petals.splice(i, 1);
            }
        }
    }

    render(ctx) {
        for (const petal of this.petals) {
            ctx.save();
            ctx.globalAlpha = petal.life;
            ctx.translate(Math.floor(petal.x), Math.floor(petal.y));
            ctx.rotate(petal.rotation);

            // Draw petal shape (simple oval)
            ctx.fillStyle = petal.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, petal.size, petal.size * 1.5, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }
}
