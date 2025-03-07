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
async function renderPongGame() {
  gameButton = document.getElementById("gamesDropdown");
  gameButton.style.display = "none";
  board = document.getElementById("board");
  gameOver = false;
  player1Score = 0;
  player2Score = 0;

  if (board) {
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // Ensure the game container exists and is a direct parent
    let gameContainer = document.getElementById("game-container");
    if (!gameContainer) {
      gameContainer = document.createElement("div");
      gameContainer.id = "game-container";
      board.parentNode.insertBefore(gameContainer, board);
      gameContainer.appendChild(board);
      gameContainer.style.position = "relative"; // Required for positioning
    }

    // Create a win message element
    let winMessage = document.getElementById("win-message");
    if (!winMessage) {
      winMessage = document.createElement("div");
      winMessage.id = "win-message";
      winMessage.style.display = "none"; // Initially hidden
      winMessage.style.position = "absolute";
      winMessage.style.top = "50%";
      winMessage.style.left = "50%";
      winMessage.style.transform = "translate(-50%, -50%)";
      winMessage.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
      winMessage.style.color = "white";
      winMessage.style.padding = "20px";
      winMessage.style.fontSize = "24px";
      winMessage.style.textAlign = "center";
      gameContainer.appendChild(winMessage);
    }

    // Start the initial game loop
    resetGameStart();
    document.addEventListener("keyup", stopPlayer);
    document.addEventListener("keydown", movePlayer);
  }
}

// Main game loop
async function update(time) {
  if (!gameOver) {
    requestAnimationFrame(update); // Continue the animation loop
  }

  const deltaTime = time - lastTime;
  lastTime = time;

  context.clearRect(0, 0, board.width, board.height);

  // Draw players
  context.fillStyle = "rgb(3, 255, 3)";
  context.fillRect(player1.x, player1.y, player1.width, player1.height);
  context.fillRect(player2.x, player2.y, player2.width, player2.height);

  if (!gameOver) {
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
      resetBall(1);
    } else if (ball.x + ballWidth > boardWidth) {
      player1Score++;
      resetBall(-1);
    }
  }

  // Draw scores
  context.font = "42px sans-serif";
  context.fillText(player1Score, boardWidth / 5, 45);
  context.fillText(player2Score, (boardWidth * 4) / 5 - 45, 45);

  // Check for win condition
  if ((player1Score >= 3 || player2Score >= 3) && !gameOver) {
    gameOver = true;

    const session_user = JSON.parse(localStorage.getItem("sessionUser"));

    let winner;

    if (player1Score >= 3) winner = session_user.username;
    else winner = "Player2";

    const data = {
      game_type_id: 1,
      match_winner: winner,
      p1_score: player1Score,
      p2_score: player2Score,
      p1_username: session_user.username,
      p2_username: "Player2",
    };

    try {
      const response = await fetch("http://localhost:8000/get_match_details/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (response.ok) {
        console.log("Match details sent successfully");
      }
    } catch (error) {
      console.error("Error:", error);
    }
    displayWinMessage();
  }
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
  ball.speedX = Math.min(
    Math.max(ball.speedX * 1.1, -maxBallSpeed),
    maxBallSpeed
  );
  ball.speedY = Math.min(
    Math.max(ball.speedY * 1.1, -maxBallSpeed),
    maxBallSpeed
  );
}

// Reset game after a score
function resetBall(direction) {
  ball = {
    x: boardWidth / 2 + 1, // Add a small offset
    y: boardHeight / 2 + 1, // Add a small offset
    width: ballWidth,
    height: ballHeight,
    speedX: direction * ballBaseSpeed,
    speedY: ballBaseSpeed,
  };
}

// Display win message
function displayWinMessage() {
  const winMessage = document.getElementById("win-message");
  winMessage.innerHTML = ""; // Clear existing content

  let winnerText = "";
  if (player1Score >= 3) {
    winnerText = `Player 1 Wins!`;
  } else {
    winnerText = `Player 2 Wins!`;
  }

  const winnerAnnouncement = document.createElement("div");
  winnerAnnouncement.textContent = winnerText;
  winMessage.appendChild(winnerAnnouncement);

  // Create "Play Again" button
  const playAgainButton = document.createElement("button");
  playAgainButton.textContent = "Play Again";
  playAgainButton.addEventListener("click", resetGameStart);
  winMessage.appendChild(playAgainButton);

  // Create "Exit to Home" button
  const exitHomeButton = document.createElement("button");
  exitHomeButton.textContent = "Exit to Home";
  exitHomeButton.addEventListener("click", exitToHome);
  winMessage.appendChild(exitHomeButton);

  winMessage.style.display = "block";
}

function exitToHome() {
  window.location.href = "/home"; // Redirect to the home page
}

// Reset the game
function resetGameStart() {
  gameOver = false;
  player1Score = 0;
  player2Score = 0;
  player1SpeedY = 0;
  player2SpeedY = 0;

  const winMessage = document.getElementById("win-message");
  winMessage.style.display = "none";

  resetBall(1); // Reset ball to the center
  lastTime = 0; // Reset lastTime to avoid large deltaTime on restart

  // Restart the animation loop
  requestAnimationFrame(update);
}
