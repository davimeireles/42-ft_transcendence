// Board configs
let board;
let boardWidth = 1024;
let boardHeight = 300;
let context;

// Default paddle colors
const defaultPlayer1Color = "rgb(57, 255, 20)"; // Green
const defaultPlayer2Color = "rgb(57, 255, 20)"; // Green

// Players configs
let playerWidth = 10;
let playerHeight = 45;
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

// Define player colors
let player1Color = defaultPlayer1Color; // Initialize Player 1 color
let player2Color = defaultPlayer2Color; // Initialize Player 2 color

// Ball config
let ballWidth = 10;
let ballHeight = 10;
const ballBaseSpeed = 5; // Increased for more emphasis
const maxBallSpeed = 15; // Maximum speed of the ball

let ball = {
  x: boardWidth / 2,
  y: boardHeight / 2,
  width: ballWidth,
  height: ballHeight,
  speedX: ballBaseSpeed,
  speedY: ballBaseSpeed,
};

let lastTime = 0;
let customizationModal;
let gameContainer;
let winMessage;

// Initialize the game
async function renderPongGame() {
  gameButton = document.getElementById("gamesDropdown");
  profileButton = document.getElementById("profile-button")
  settingsButton = document.getElementById("setting-button")
  tournamentButton = document.getElementById("tournament-button")

  profileButton.style.display = "none";
  gameButton.style.display = "none";
  settingsButton.style.display = "none";
  tournamentButton.style.display = "none";

  board = document.getElementById("board");
  gameOver = false;

  if (board) {
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // Ensure the game container exists and is a direct parent
    gameContainer = document.getElementById("game-container");
    if (!gameContainer) {
      gameContainer = document.createElement("div");
      gameContainer.id = "game-container";
      board.parentNode.insertBefore(gameContainer, board);
      gameContainer.appendChild(board);
      gameContainer.style.position = "relative"; // Required for positioning
    }

    // Create a win message element
    winMessage = document.getElementById("win-message");
    if (!winMessage) {
      winMessage = document.createElement("div");
      winMessage.id = "win-message";
      winMessage.style.display = "none"; // Initially hidden
      winMessage.style.position = "absolute";
      winMessage.style.top = "50%";
      winMessage.style.left = "50%";
      winMessage.style.transform = "translate(-50%, -50%)";
      winMessage.style.backgroundColor = "rgba(0, 0, 0, 0)";
      winMessage.style.color = "#E3DCE6";
      winMessage.style.padding = "20px";
      winMessage.style.fontSize = "24px";
      winMessage.style.textAlign = "center";
      gameContainer.appendChild(winMessage);
    }

    // Create customization modal (color picker)
    customizationModal = document.createElement("div");
    customizationModal.id = "customization-modal";
    customizationModal.classList.add("semi-transparent", "rounded-3");
    customizationModal.style.display = "flex"; // Initially hidden
    customizationModal.style.position = "absolute";
    customizationModal.style.top = "50%";
    customizationModal.style.left = "50%";
    customizationModal.style.transform = "translate(-50%, -50%)";
    customizationModal.style.backgroundColor = "rgba(0, 0, 0, 0)";
    customizationModal.style.color = "#E3DCE6";
    customizationModal.style.padding = "20px";
    customizationModal.style.fontSize = "16px";
    customizationModal.style.textAlign = "center";
    gameContainer.appendChild(customizationModal);

    // Player 1 customization
    const p1Customization = createPlayerCustomization("Player 1", setPlayer1Color);
    customizationModal.appendChild(p1Customization);

    // Player 2 customization
    const p2Customization = createPlayerCustomization("Player 2", setPlayer2Color);
    customizationModal.appendChild(p2Customization);

    // Start the initial game loop
    showCustomizationModal();
  }
}

// Function to create player customization sections
function createPlayerCustomization(playerName, setColorFunction) {
  const container = document.createElement("div");
  container.style.marginBottom = "10px"; // Add some spacing

  const title = document.createElement("h3");
  title.textContent = playerName + " - Choose Your Paddle Color:";
  container.appendChild(title);

  const colors = [{name: "green", hex: "#39FF14"}, {name: 
     "red", hex: "#FC1723"}, {name: "blue", hex: "#0d6efd"}]; // Green, Red, Blue
  colors.forEach(color => {
    const colorButton = document.createElement("button");
    colorButton.textContent = color.name;
    if (color.name == 'green') colorButton.classList.add("color-selected");
    colorButton.style.backgroundColor = color.hex;
    colorButton.style.color = "#151314";
    colorButton.style.padding = "5px 10px";
    colorButton.style.width = "70px";
    colorButton.style.border = "none";
    colorButton.style.filter = "brightness(75%)";
    colorButton.style.margin = "5px";
    colorButton.style.cursor = "pointer";
    colorButton.style.borderRadius = "5px";
    colorButton.style.transition = "all 0.3s ease-in-out";
    colorButton.addEventListener("click", (e) => {
        [...e.target.parentNode.children].forEach(node => node.classList.remove("color-selected"));
        e.target.classList.add("color-selected");
        setColorFunction(color.hex);
    })
    container.appendChild(colorButton);
  });

  return container;
}

// Set player 1 color
function setPlayer1Color(color) {
  player1Color = color;
}

// Set player 2 color
function setPlayer2Color(color) {
  player2Color = color;
}

// Show customization modal
function showCustomizationModal() {
  // Create a "Start Game" button
  const startGameButton = document.createElement("button");
  startGameButton.textContent = "Start Game";
  startGameButton.classList.add("button-clicked");
  startGameButton.addEventListener("click", () => {
    customizationModal.style.display = "none"; // Hide modal
    document.addEventListener("keyup", stopPlayer);
    document.addEventListener("keydown", movePlayer);
    resetGameStart();
  });
  customizationModal.appendChild(startGameButton);

  customizationModal.style.display = "flex";
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
  context.fillStyle = player1Color; // Use Player 1 color
  context.fillRect(player1.x, player1.y, player1.width, player1.height);
  context.fillStyle = player2Color; // Use Player 2 color
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
    else winner = "LocalPlayer";

    const data = {
      game_type_id: 1,
      match_winner: winner,
      p1_score: player1Score,
      p2_score: player2Score,
      p1_username: session_user.username,
      p2_username: "LocalPlayer",
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
    const minSpeedY = 2; // Minimum absolute value for speedY
    const minVelocityAfterHit = ballBaseSpeed * 1.2; // Minimum overall speed
  
    if (player === player1 && ball.x <= player1.x + player1.width) {
      ball.x = player1.x + player1.width;
      ball.speedX = Math.abs(ball.speedX) * 1.1; // Ensure always moving right
      ball.speedY = (ball.y - (player1.y + player1.height / 2)) / 10;
  
      if (Math.abs(ball.speedY) < minSpeedY) {
        ball.speedY = (ball.speedY >= 0) ? minSpeedY : -minSpeedY;
      }
  
    } else if (player === player2 && ball.x + ball.width >= player2.x) {
      ball.x = player2.x - ball.width;
      ball.speedX = -Math.abs(ball.speedX) * 1.1; // Ensure always moving left
      ball.speedY = (ball.y - (player2.y + player2.height / 2)) / 10;
  
      if (Math.abs(ball.speedY) < minSpeedY) {
        ball.speedY = (ball.speedY >= 0) ? minSpeedY : -minSpeedY;
      }
    }
  
    // Adjust to ensure minimum velocity after the hit
    const currentVelocity = Math.sqrt(ball.speedX * ball.speedX + ball.speedY * ball.speedY);
    if (currentVelocity < minVelocityAfterHit) {
      const scaleFactor = minVelocityAfterHit / currentVelocity;
      ball.speedX *= scaleFactor;
      ball.speedY *= scaleFactor;
    }
  
    // Cap the speed
    ball.speedX = Math.max(Math.min(ball.speedX, maxBallSpeed), -maxBallSpeed);
    ball.speedY = Math.max(Math.min(ball.speedY, maxBallSpeed), -maxBallSpeed);
  }

// Reset game after a score
function resetBall(direction) {
    ball = {
        x: boardWidth / 2, // Corrected
        y: boardHeight / 2, // Corrected
        width: ballWidth,
        height: ballHeight,
        speedX: direction * ballBaseSpeed, // Start moving in the given direction
        speedY: ballBaseSpeed
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
  exitHomeButton.addEventListener("click", function(event) {renderPage("home");});
  winMessage.appendChild(exitHomeButton);

  winMessage.style.display = "block";
}

// Reset the game
function resetGameStart() {
    gameOver = false;
    player1Score = 0;
    player2Score = 0;
    player1SpeedY = 0;
    player2SpeedY = 0;
  
    const winMessage = document.getElementById("win-message");
    if (winMessage)
        winMessage.style.display = "none";
  
    resetBall(0); // Reset ball to the center - do not assign points
    lastTime = 0; // Reset lastTime to avoid large deltaTime on restart
      setTimeout(() => {
          resetBall(1); // After a brief delay, set ball direction
      }, 200);
  
    // Restart the animation loop
    requestAnimationFrame(update);
  }