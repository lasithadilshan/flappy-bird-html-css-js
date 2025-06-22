const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const startBtn = document.getElementById('startBtn');
const gameOverScreen = document.getElementById('gameOver');
const finalScore = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Retro color palette
const COLORS = {
  bg: "#222",
  bird: "#ffcc00",
  pipe: "#00ff70",
  pipeDark: "#00c050",
  ground: "#b97a56",
  text: "#fff",
};

let gameState = "ready"; // ready, running, gameover
let score, bird, pipes, gravity, jumpStrength, pipeGap, pipeWidth, pipeSpeed, groundHeight, frame;

function resetGame() {
  score = 0;
  scoreEl.textContent = score;
  gravity = 0.32;
  jumpStrength = -6;
  pipeGap = 150;
  pipeWidth = 60;
  pipeSpeed = 2.4;
  groundHeight = 80;
  frame = 0;

  bird = {
    x: 80,
    y: HEIGHT / 2,
    w: 32,
    h: 32,
    velocity: 0
  };
  pipes = [];
}

function drawBackground() {
  // Solid bg
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function drawGround() {
  ctx.fillStyle = COLORS.ground;
  ctx.fillRect(0, HEIGHT - groundHeight, WIDTH, groundHeight);

  // Retro lines
  ctx.strokeStyle = "#a05a2c";
  for (let i = 0; i < WIDTH; i += 16) {
    ctx.beginPath();
    ctx.moveTo(i, HEIGHT - groundHeight);
    ctx.lineTo(i + 8, HEIGHT);
    ctx.stroke();
  }
}

function drawBird() {
  // Retro style: pixel square with a beak
  ctx.save();
  ctx.translate(bird.x, bird.y);
  ctx.fillStyle = COLORS.bird;
  ctx.fillRect(-bird.w/2, -bird.h/2, bird.w, bird.h);

  // Eye
  ctx.fillStyle = "#333";
  ctx.fillRect(6, -8, 6, 6);

  // Beak
  ctx.fillStyle = "#ff4444";
  ctx.beginPath();
  ctx.moveTo(bird.w / 2, 0);
  ctx.lineTo(bird.w / 2 + 12, -6);
  ctx.lineTo(bird.w / 2 + 12, 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawPipes() {
  pipes.forEach(pipe => {
    // Top pipe
    ctx.fillStyle = COLORS.pipe;
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
    ctx.fillStyle = COLORS.pipeDark;
    ctx.fillRect(pipe.x, pipe.top - 18, pipeWidth, 18);

    // Bottom pipe
    ctx.fillStyle = COLORS.pipe;
    ctx.fillRect(pipe.x, pipe.top + pipeGap, pipeWidth, HEIGHT - groundHeight - (pipe.top + pipeGap));
    ctx.fillStyle = COLORS.pipeDark;
    ctx.fillRect(pipe.x, pipe.top + pipeGap, pipeWidth, 18);
  });
}

function draw() {
  drawBackground();
  drawPipes();
  drawGround();
  drawBird();
}

function update() {
  frame++;

  // Bird physics
  bird.velocity += gravity;
  bird.y += bird.velocity;

  // Pipes movement
  for (let i = 0; i < pipes.length; i++) {
    pipes[i].x -= pipeSpeed;
  }
  // Remove off-screen pipes
  if (pipes.length && pipes[0].x < -pipeWidth) {
    pipes.shift();
  }

  // Add pipes
  if (frame % 90 === 0) {
    const top = Math.floor(Math.random() * (HEIGHT - groundHeight - pipeGap - 100)) + 40;
    pipes.push({ x: WIDTH, top: top, passed: false });
  }

  // Score update
  pipes.forEach(pipe => {
    if (!pipe.passed && bird.x > pipe.x + pipeWidth) {
      score++;
      scoreEl.textContent = score;
      pipe.passed = true;
    }
  });

  // Collision detection
  if (bird.y + bird.h/2 > HEIGHT - groundHeight) {
    setGameOver();
  }
  if (bird.y - bird.h/2 < 0) {
    setGameOver();
  }
  for (let pipe of pipes) {
    if (
      bird.x + bird.w/2 > pipe.x && bird.x - bird.w/2 < pipe.x + pipeWidth &&
      (bird.y - bird.h/2 < pipe.top || bird.y + bird.h/2 > pipe.top + pipeGap)
    ) {
      setGameOver();
    }
  }
}

function gameLoop() {
  if (gameState === "running") {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }
}

function jump() {
  if (gameState === "running") {
    bird.velocity = jumpStrength;
  } else if (gameState === "ready") {
    startGame();
  }
}

function setGameOver() {
  gameState = "gameover";
  gameOverScreen.classList.remove('hidden');
  finalScore.textContent = `Your Score: ${score}`;
}

function startGame() {
  resetGame();
  gameState = "running";
  startBtn.style.display = "none";
  gameOverScreen.classList.add('hidden');
  requestAnimationFrame(gameLoop);
}

function restartGame() {
  startGame();
}

document.addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code === 'ArrowUp') jump();
});
canvas.addEventListener('mousedown', jump);
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);

// Initial render
drawBackground();
drawGround();
drawBird();
scoreEl.textContent = "0";