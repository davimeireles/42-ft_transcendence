// board configs

let board;
let boardWidth = 600;
let boardHeight = 300;
let context;

// players configs

let playerWidth = 10;
let playerHeight = 50;
let playerSpeedY = 0;

let player1 = {
  x: 10,
  y: boardHeight / 2,
  width: playerWidth,
  height: playerHeight,
  speedY: playerSpeedY,
};

let player2 = {
  x: boardWidth - playerWidth - 10,
  y: boardHeight / 2,
  width: playerWidth,
  height: playerHeight,
  speedY: playerSpeedY,
};

let player1Score = 0;
let player2Score = 0;

// Ball config

let ballWidth = 10;
let ballHeight = 10;

let ball = {
  x: boardWidth / 2,
  y: boardHeight / 2,
  width: ballWidth,
  height: ballHeight,
  speedX: 2,
  speedY: 2,
};

function renderPongGame() {
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d"); // used for drawning on the board;

  // draw initial player1

  context.fillStyle = "skyblue";
  context.fillRect(player1.x, player1.y, player1.width, player1.height);
  context.fillRect(player2.x, player2.y, player2.width, player2.height);

  requestAnimationFrame(update);
  document.addEventListener("keyup", stopPlayer);
  document.addEventListener("keydown", movePlayer);
}

function update() {
  requestAnimationFrame(update);
  context.clearRect(0, 0, board.width, board.height);
  context.fillStyle = "skyblue";

  let nextPlayer1Y = player1.y + player1.speedY;
  let nextPlayer2Y = player2.y + player2.speedY;

  // Player 1
  if (!outOfBounds(nextPlayer1Y)) player1.y = nextPlayer1Y;

  context.fillRect(player1.x, player1.y, player1.width, player1.height);

  // Player 2
  if (!outOfBounds(nextPlayer2Y)) player2.y = nextPlayer2Y;

  context.fillRect(player2.x, player2.y, player2.width, player2.height);

  // Ball
  context.fillStyle = "white";
  ball.x += ball.speedX;
  ball.y += ball.speedY;

  context.fillRect(ball.x, ball.y, ball.width, ball.height);

  if (ball.y <= 0 || ball.y + ball.height >= boardHeight) ball.speedY *= -1; // Reverse direction if touchs the wall

  if (detectCollision(ball, player1)) {
    if (ball.x <= player1.x + player1.width + 1) {
      // left side of ball touches right side of player1
      ball.speedX *= -1; // Flip X direction
      ball.speedY = (ball.y - (player1.y + player1.height / 2)) / 10; // Adjust Y direction based on where it hits the player
      ball.speedX *= 1.1; // Increase speed
      ball.speedY *= 1.1; // Increase speed
    }
  } else if (detectCollision(ball, player2)) {
    if (ball.x + ballWidth + 1 >= player2.x) {
      // right side of ball touches left side of player2
      ball.speedX *= -1; // Flip X direction
      ball.speedY = (ball.y - (player2.y + player2.height / 2)) / 10; // Adjust Y direction based on where it hits the player
      ball.speedX *= 1.1; // Increase speed
      ball.speedY *= 1.1; // Increase speed
    }
  }

  // Increase Points
  if (ball.x < 0) {
    player2Score++;
    resetGame(1);
  } else if (ball.x + ballWidth > boardWidth) {
    player1Score++;
    resetGame(-1);
  }

  // Draw Scores
  context.font = "42px sans-serif";
  context.fillText(player1Score, boardWidth / 5, 45);
  context.fillText(player2Score, (boardWidth * 4) / 5 - 45, 45);
}

function outOfBounds(yPosition) {
  return yPosition < 0 || yPosition + playerHeight > boardHeight;
}

function movePlayer(e) {
  // Player 1
  if (e.code == "KeyW") player1.speedY = -3;
  else if (e.code == "KeyS") player1.speedY = 3;

  // Player 2
  if (e.code == "ArrowUp") player2.speedY = -3;
  else if (e.code == "ArrowDown") player2.speedY = 3;
}

function stopPlayer(e) {
  // Player 1
  if (e.code == "KeyW" || e.code == "KeyS") player1.speedY = 0;

  // Player 2
  if (e.code == "ArrowUp" || e.code == "ArrowDown") player2.speedY = 0;
}

function detectCollision(a, b) {
  return (
    a.x < b.x + b.width && //a's top left corner doesn't reach b's top right corner
    a.x + a.width > b.x && // a's top right corner passes b's top left corner
    a.y < b.y + b.height && // a's top left corner doesn't reach b's bottom left corner
    a.y + a.height > b.y // a's bottom left corner passes b's top left corner
  );
}

function resetGame(direction) {
  ball = {
    x: boardWidth / 2,
    y: boardHeight / 2,
    width: ballWidth,
    height: ballHeight,
    speedX: direction * 1.1,
    speedY: 2 * 1.1,
  };
}
