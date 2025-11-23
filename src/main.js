import { Game } from './Game.js';

window.addEventListener('error', (e) => {
    const msg = document.getElementById('message-area');
    if (msg) {
        msg.innerText = "Error: " + e.message;
        msg.style.opacity = 1;
        msg.style.color = 'red';
        msg.style.zIndex = 100;
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const game = new Game(canvas);
    game.start();
});
