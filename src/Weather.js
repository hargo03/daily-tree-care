export class Weather {
    constructor(game) {
        this.game = game;
        this.types = ['clear', 'rain', 'snow', 'heavyWind'];
        this.current = 'clear';
        this.nextChangeTime = Date.now() + this.getRandomInterval();
        this.raindrops = [];
        this.snowflakes = [];
    }

    getRandomInterval() {
        return 30000 + Math.random() * 30000; // 30-60 seconds
    }

    update(deltaTime) {
        // Check for weather change
        if (Date.now() >= this.nextChangeTime) {
            this.changeWeather();
        }

        // Update weather particles
        if (this.current === 'rain') {
            this.updateRain(deltaTime);
        } else if (this.current === 'snow') {
            this.updateSnow(deltaTime);
        }
    }

    changeWeather() {
        const oldWeather = this.current;
        this.current = this.types[Math.floor(Math.random() * this.types.length)];
        this.nextChangeTime = Date.now() + this.getRandomInterval();

        console.log(`Weather changed: ${oldWeather} -> ${this.current}`);

        // Reset particles
        this.raindrops = [];
        this.snowflakes = [];
    }

    updateRain(deltaTime) {
        // Add new raindrops
        if (Math.random() < 0.3) {
            this.raindrops.push({
                x: Math.random() * this.game.width,
                y: -5,
                speed: 3 + Math.random() * 2
            });
        }

        // Update existing raindrops
        for (let i = this.raindrops.length - 1; i >= 0; i--) {
            this.raindrops[i].y += this.raindrops[i].speed;
            if (this.raindrops[i].y > this.game.height) {
                this.raindrops.splice(i, 1);
            }
        }
    }

    updateSnow(deltaTime) {
        // Add new snowflakes
        if (Math.random() < 0.2) {
            this.snowflakes.push({
                x: Math.random() * this.game.width,
                y: -5,
                speed: 0.5 + Math.random() * 1,
                drift: (Math.random() - 0.5) * 0.5
            });
        }

        // Update existing snowflakes
        for (let i = this.snowflakes.length - 1; i >= 0; i--) {
            this.snowflakes[i].y += this.snowflakes[i].speed;
            this.snowflakes[i].x += this.snowflakes[i].drift;
            if (this.snowflakes[i].y > this.game.height) {
                this.snowflakes.splice(i, 1);
            }
        }
    }

    getWindMultiplier() {
        switch (this.current) {
            case 'heavyWind': return 3.0;
            case 'rain': return 1.5;
            case 'snow': return 0.5;
            default: return 1.0;
        }
    }

    getBackgroundColor() {
        switch (this.current) {
            case 'rain': return '#6B8E99'; // Darker blue-grey
            case 'snow': return '#E8F4F8'; // Light blue-white
            case 'heavyWind': return '#A8C5D1'; // Windy grey-blue
            default: return '#FFE5F0'; // Cherry blossom pink sky
        }
    }

    render(ctx) {
        // Render rain
        if (this.current === 'rain') {
            ctx.strokeStyle = 'rgba(200, 220, 255, 0.6)';
            ctx.lineWidth = 1;
            for (const drop of this.raindrops) {
                ctx.beginPath();
                ctx.moveTo(Math.floor(drop.x), Math.floor(drop.y));
                ctx.lineTo(Math.floor(drop.x), Math.floor(drop.y + 5));
                ctx.stroke();
            }
        }

        // Render snow
        if (this.current === 'snow') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            for (const flake of this.snowflakes) {
                ctx.fillRect(Math.floor(flake.x), Math.floor(flake.y), 2, 2);
            }
        }
    }
}
