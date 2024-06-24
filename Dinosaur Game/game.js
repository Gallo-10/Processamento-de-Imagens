const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let mamaco = {
    x: 50,
    y: canvas.height / 2, // Altura inicial centralizada verticalmente
    width: 50,
    height: 50,
    yVelocity: 0,
    jumpPower: -10,
    gravity: 0.3,
    isJumping: false,
    frame: 0
};

let obstacles = [];
let frames = 0;
let score = 0;
let gameOver = false;

// Carregar sons
const jumpSound = new Audio('sound/pulo.wav');
const collisionSound = new Audio('sound/scurrega.mp3');

// Carregar as imagens do mamaco e leão
const mamacoRun1 = new Image();
mamacoRun1.src = './images/mamaco_andando1.png';

const mamacoRun2 = new Image();
mamacoRun2.src = './images/mamaco_andando2.png';

const mamacoJump = new Image();
mamacoJump.src = './images/mamaco_pulo.png';

const lionImage = new Image();
lionImage.src = './images/leao.png';

// Adicionar listener para eventos de tecla
document.addEventListener('keydown', (event) => {
    if (!gameOver && event.code === 'Space' && !mamaco.isJumping) {
        mamaco.yVelocity = mamaco.jumpPower;
        mamaco.isJumping = true;
        jumpSound.play();
    }
});

// Função para reiniciar o jogo
function restartGame() {
    mamaco = {
        x: 50,
        y: canvas.height / 2, // Altura inicial centralizada verticalmente
        width: 50,
        height: 50,
        yVelocity: 0,
        jumpPower: -10,
        gravity: 0.3,
        isJumping: false,
        frame: 0
    };
    obstacles = [];
    frames = 0;
    score = 0;
    gameOver = false;
    update();
}

// Função principal de atualização do jogo
function update() {
    frames++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Física do mamaco
    mamaco.y += mamaco.yVelocity;
    mamaco.yVelocity += mamaco.gravity;
    if (mamaco.y > 150) {
        mamaco.y = 150;
        mamaco.isJumping = false;
    }

    // Atualizar quadro para a animação do sprite de corrida
    if (!mamaco.isJumping && frames % 10 === 0) {
        mamaco.frame = (mamaco.frame + 1) % 2;
    }

    // Desenhar o mamaco
    if (mamaco.isJumping) {
        ctx.drawImage(mamacoJump, mamaco.x, mamaco.y, mamaco.width, mamaco.height);
    } else {
        if (mamaco.frame === 0) {
            ctx.drawImage(mamacoRun1, mamaco.x, mamaco.y, mamaco.width, mamaco.height);
        } else {
            ctx.drawImage(mamacoRun2, mamaco.x, mamaco.y, mamaco.width, mamaco.height);
        }
    }

    // Gerenciar obstáculos
    if (frames % 100 === 0) {
        obstacles.push({
            x: canvas.width,
            y: canvas.height / 2, // Altura inicial centralizada verticalmente
            width: 100,
            height: 50,
        });
    }

    obstacles.forEach((obstacle, index) => {
        obstacle.x -= 5;
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
            score++;
        }

        // Desenhar obstáculo (leão)
        ctx.drawImage(lionImage, obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        // Detecção de colisão
        if (
            mamaco.x < obstacle.x + obstacle.width &&
            mamaco.x + mamaco.width > obstacle.x &&
            mamaco.y < obstacle.y + obstacle.height &&
            mamaco.y + mamaco.height > obstacle.y
        ) {
            collisionSound.play();
            gameOver = true;
            setTimeout(() => {
                restartGame();
            }, 5000); // Tempo de espera em milissegundos antes de reiniciar
        }
    });

    // Desenhar pontuação
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 700, 20);

    // Verificar se o jogo ainda está em andamento
    if (!gameOver) {
        requestAnimationFrame(update);
    } else {
        // Mostrar tela de Game Over
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.font = '30px Arial';
        ctx.fillText('Game Over! Score: ' + score, canvas.width / 2 - 150, canvas.height / 2);
    }
}

// Iniciar o jogo
update();
