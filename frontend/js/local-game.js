// Board configs
let board;
let boardWidth = 600;
let boardHeight = 300;
let context;

// Players configs
let playerWidth = 10;
let playerHeight = 50;
let player1SpeedY = 0;
let player2SpeedY = 0;
const playerMaxSpeed = 3;

let player1 = {
  x: 10,
  y: boardHeight / 2,
  width: playerWidth,
  height: playerHeight,
};

let player2 = {
  x: boardWidth - playerWidth - 10,
  y: boardHeight / 2,
  width: playerWidth,
  height: playerHeight,
};

let player1Score = 0;
let player2Score = 0;

// Ball config
let ballWidth = 10;
let ballHeight = 10;
const ballBaseSpeed = 2;
const maxBallSpeed = 10; // Maximum speed of the ball

let ball = {
  x: boardWidth / 2,
  y: boardHeight / 2,
  width: ballWidth,
  height: ballHeight,
  speedX: ballBaseSpeed,
  speedY: ballBaseSpeed,
};

let lastTime = 0;

// Initialize the game
function renderPongGame() {
  board = document.getElementById("board");

  if (board)
  {
      board.height = boardHeight;
      board.width = boardWidth;
      context = board.getContext("2d"); // Used for drawing on the board
    
      requestAnimationFrame(update);
      document.addEventListener("keyup", stopPlayer);
      document.addEventListener("keydown", movePlayer);
  }
}

// Main game loop
function update(time) {
  requestAnimationFrame(update);

  const deltaTime = time - lastTime;
  lastTime = time;

  context.clearRect(0, 0, board.width, board.height);

  // Draw players
  context.fillStyle = "rgb(3, 255, 3)";
  context.fillRect(player1.x, player1.y, player1.width, player1.height);
  context.fillRect(player2.x, player2.y, player2.width, player2.height);

  // Move players
  player1.y += player1SpeedY * (deltaTime / 16);
  player2.y += player2SpeedY * (deltaTime / 16);

  // Ensure players stay within bounds
  player1.y = Math.max(0, Math.min(player1.y, boardHeight - player1.height));
  player2.y = Math.max(0, Math.min(player2.y, boardHeight - player2.height));

  // Draw ball
  context.fillStyle = "white";
  ball.x += ball.speedX * (deltaTime / 16);
  ball.y += ball.speedY * (deltaTime / 16);
  context.fillRect(ball.x, ball.y, ball.width, ball.height);

  // Ball collision with top and bottom walls
  if (ball.y <= 0 || ball.y + ball.height >= boardHeight) {
    ball.speedY *= -1;
  }

  // Ball collision with players
  if (detectCollision(ball, player1)) {
    handleCollision(ball, player1);
  } else if (detectCollision(ball, player2)) {
    handleCollision(ball, player2);
  }

  // Ball out of bounds (score)
  if (ball.x < 0) {
    player2Score++;
    resetGame(1);
  } else if (ball.x + ballWidth > boardWidth) {
    player1Score++;
    resetGame(-1);
  }

  // Draw scores
  context.font = "42px sans-serif";
  context.fillText(player1Score, boardWidth / 5, 45);
  context.fillText(player2Score, (boardWidth * 4) / 5 - 45, 45);
}

// Handle player movement
function movePlayer(e) {
  // Player 1
  if (e.code == "KeyW") player1SpeedY = -playerMaxSpeed;
  else if (e.code == "KeyS") player1SpeedY = playerMaxSpeed;

  // Player 2
  if (e.code == "ArrowUp") player2SpeedY = -playerMaxSpeed;
  else if (e.code == "ArrowDown") player2SpeedY = playerMaxSpeed;
}

// Stop player movement
function stopPlayer(e) {
  // Player 1
  if (e.code == "KeyW" || e.code == "KeyS") player1SpeedY = 0;

  // Player 2
  if (e.code == "ArrowUp" || e.code == "ArrowDown") player2SpeedY = 0;
}

// Detect collision between two objects
function detectCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// Handle ball collision with players
function handleCollision(ball, player) {
  if (player === player1 && ball.x <= player1.x + player1.width) {
    // Collision with player1 (left paddle)
    ball.x = player1.x + player1.width; // Correct the ball's position
    ball.speedX *= -1; // Reverse X direction
    ball.speedY = (ball.y - (player1.y + player1.height / 2)) / 10; // Adjust Y direction based on where it hits the paddle
  } else if (player === player2 && ball.x + ball.width >= player2.x) {
    // Collision with player2 (right paddle)
    ball.x = player2.x - ball.width; // Correct the ball's position
    ball.speedX *= -1; // Reverse X direction
    ball.speedY = (ball.y - (player2.y + player2.height / 2)) / 10; // Adjust Y direction based on where it hits the paddle
  }

  // Increase speed after collision (capped at maxBallSpeed)
  ball.speedX = Math.min(Math.max(ball.speedX * 1.1, -maxBallSpeed), maxBallSpeed);
  ball.speedY = Math.min(Math.max(ball.speedY * 1.1, -maxBallSpeed), maxBallSpeed);
}

// Reset game after a score
function resetGame(direction) {
  ball = {
    x: boardWidth / 2,
    y: boardHeight / 2,
    width: ballWidth,
    height: ballHeight,
    speedX: direction * ballBaseSpeed,
    speedY: ballBaseSpeed,
  };
}