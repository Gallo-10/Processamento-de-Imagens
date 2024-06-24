const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const ambientSound = document.getElementById('ambientSound');
const failSound = document.getElementById('failSound');

// Variáveis do jogo
let dino = {
    x: 50,
    y: 150,
    width: 20,
    height: 40,
    dy: 0,
    jumpStrength: 10,
    gravity: 0.5,
    grounded: false
};

let obstacles = [];
let gameSpeed = 5;
let score = 0;

// Função para desenhar o dinossauro
function drawDino() {
    ctx.fillStyle = 'green';
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
}

// Função para desenhar obstáculos
function drawObstacles() {
    ctx.fillStyle = 'red';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

function randomIntFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// Função para atualizar obstáculos
function updateObstacles() {
    obstacles.forEach(obstacle => {
        obstacle.x -= gameSpeed;
    });

    if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvas.width - 200) {
        let obstacle = {
            x: canvas.width,
            y: 160,
            width: randomIntFromRange(20, 40),
            height: randomIntFromRange(20, 40)
        };
        obstacles.push(obstacle);
    }

    if (obstacles[0].x + obstacles[0].width < 0) {
        obstacles.shift();
        score++;
    }
}

// Função para detectar colisão
function detectCollision() {
    obstacles.forEach(obstacle => {
        if (
            dino.x < obstacle.x + obstacle.width &&
            dino.x + dino.width > obstacle.x &&
            dino.y < obstacle.y + obstacle.height &&
            dino.y + dino.height > obstacle.y
        ) {
            // Colisão detectada
            ambientSound.pause();
            failSound.play();
            alert('Game Over! Score: ' + score);
            document.location.reload();
        }
    });
}

// Função para atualizar o dinossauro
function updateDino() {
    if (dino.grounded && dino.dy === 0 && isJumping) {
        dino.dy = -dino.jumpStrength;
        dino.grounded = false;
    }

    dino.dy += dino.gravity;
    dino.y += dino.dy;

    if (dino.y + dino.height > canvas.height - 10) {
        dino.y = canvas.height - 10 - dino.height;
        dino.dy = 0;
        dino.grounded = true;
    }
}

// Variável para detectar se o jogador está tentando pular
let isJumping = false;
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        isJumping = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        isJumping = false;
    }
});

// Função para desenhar o jogo
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawDino();
    drawObstacles();
}

// Função para atualizar o jogo
function update() {
    updateDino();
    updateObstacles();
    detectCollision();
}

// Função principal do jogo
function gameLoop() {
    draw();
    update();
    requestAnimationFrame(gameLoop);
}

// Iniciar o loop do jogo
gameLoop();
