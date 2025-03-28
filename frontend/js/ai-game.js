// AIboard configs
let AIboard;
let AIboardWidth = 1024;
let AIboardHeight = 300;
let AIcontext;
let isResetting = false;

// Players configs
let AIplayerWidth = 10;
let AIplayerHeight = 45;
let AIplayerSpeedY = 0;
const AIPlayerMaxSpeed = 3;

let AIplayer1 = {
  x: 10,
  y: AIboardHeight / 2,
  width: AIplayerWidth,
  height: AIplayerHeight,
};

let AIplayer2 = {
  x: AIboardWidth - AIplayerWidth - 10,
  y: AIboardHeight / 2,
  width: AIplayerWidth,
  height: AIplayerHeight,
};

let AIplayer1Score = 0;
let AIplayer2Score = 0;

// Ball config
let AIballWidth = 10;
let AIballHeight = 10;
const AIballBaseSpeed = 5;
const AImaxBallSpeed = 15; // Maximum speed of the ball

let AIball = {
  x: AIboardWidth / 2,
  y: AIboardHeight / 2,
  width: AIballWidth,
  height: AIballHeight,
  speedX: AIballBaseSpeed,
  speedY: AIballBaseSpeed,
};

let AIlastTime = 0;
let AIanimationFrameId; // To store the animation frame ID
let AIGameOver = false;

// Difficulty settings
const DIFFICULTY = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
};

let currentDifficulty = DIFFICULTY.MEDIUM; // Default difficulty

let AIname;

// Initialize the game
async function startGame(difficulty) {
  currentDifficulty = difficulty;

  // Hide the difficulty overlay
  const overlay = document.getElementById("difficulty-overlay");
  overlay.classList.add("hidden");

  // Show the game board
  const board = document.getElementById("ai-board");
  board.classList.add("visible");

  // Set the resetting flag
  isResetting = true;

  AIresetGameState();

  renderAIgame();

  setTimeout(() => {
    isResetting = false;
  }, 100);
}

function renderAIgame() {
  AIboard = document.getElementById("ai-board");
  gameButton = document.getElementById("gamesDropdown");
  profileButton = document.getElementById("profile-button")
  settingsButton = document.getElementById("setting-button")
  tournamentButton = document.getElementById("tournament-button")

  profileButton.style.display = "none";
  gameButton.style.display = "none";
  settingsButton.style.display = "none";
  tournamentButton.style.display = "none";

  if (AIboard) {
    AIboard.height = AIboardHeight;
    AIboard.width = AIboardWidth;
    AIcontext = AIboard.getContext("2d");

    // Ensure the game container exists and is a direct parent
    let gameContainer = document.getElementById("game-container");
    if (!gameContainer) {
      gameContainer = document.createElement("div");
      gameContainer.id = "game-container";
      AIboard.parentNode.insertBefore(gameContainer, AIboard);
      gameContainer.appendChild(AIboard);
      gameContainer.style.position = 'relative'; // Required for positioning
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
      winMessage.style.backgroundColor = "rgba(0, 0, 0, 0.0)";
      winMessage.style.color = "#E3DCE6";
      winMessage.style.padding = "20px";
      winMessage.style.fontSize = "24px";
      winMessage.style.textAlign = "center";
      gameContainer.appendChild(winMessage);
    }

    // Cancel previous animation frame if it exists
    if (AIanimationFrameId) {
      cancelAnimationFrame(AIanimationFrameId);
    }

    AIresetGameState(); // Reset the game state
    document.addEventListener("keyup", AIstopPlayer);
    document.addEventListener("keydown", AImovePlayer);
    updateAI(); // Start the game loop
  }
}

function AIresetGameState() {
  // Reset player positions
  AIplayer1.y = AIboardHeight / 2 - AIplayer1.height / 2;
  AIplayer2.y = AIboardHeight / 2 - AIplayer2.height / 2;

  // Reset scores
  AIplayer1Score = 0;
  AIplayer2Score = 0;
  AIGameOver = false;

  // Reset ball position and speed
  AIball.x = AIboardWidth / 2 - AIballWidth / 2;
  AIball.y = AIboardHeight / 2 - AIballHeight / 2;
  AIball.speedX = AIballBaseSpeed * (Math.random() > 0.5 ? 1 : -1); // Randomize initial direction
  AIball.speedY = AIballBaseSpeed * (Math.random() > 0.5 ? 1 : -1); // Randomize initial direction
}

// Main game loop
async function updateAI(time) {
  if (!AIGameOver) {
    AIanimationFrameId = requestAnimationFrame(updateAI);
  }

  if (!time) {
    time = 0;
  }

  const deltaTime = time - AIlastTime;
  AIlastTime = time;

  AIcontext.clearRect(0, 0, AIboard.width, AIboard.height);

  // Draw players
  AIcontext.fillStyle = "rgb(3, 255, 3)";
  AIcontext.fillRect(
    AIplayer1.x,
    AIplayer1.y,
    AIplayer1.width,
    AIplayer1.height
  );
  AIcontext.fillRect(
    AIplayer2.x,
    AIplayer2.y,
    AIplayer2.width,
    AIplayer2.height
  );

  if (!AIGameOver) {
    // Move player 1
    AIplayer1.y += AIplayerSpeedY * (deltaTime / 16);

    // Move player 2 (AI) based on difficulty
    moveAI();

    // Ensure players stay within bounds
    AIplayer1.y = Math.max(
      0,
      Math.min(AIplayer1.y, AIboardHeight - AIplayer1.height)
    );
    AIplayer2.y = Math.max(
      0,
      Math.min(AIplayer2.y, AIboardHeight - AIplayer2.height)
    );

    // If the game is resetting, do not move the ball or check for collisions
    if (isResetting) {
      return;
    }

    // Move ball
    AIball.x += AIball.speedX * (deltaTime / 16);
    AIball.y += AIball.speedY * (deltaTime / 16);

    // Ball collision with top and bottom walls
    if (AIball.y <= 0) {
      AIball.y = 0;
      AIball.speedY *= -1;
    } else if (AIball.y + AIball.height >= AIboardHeight) {
      AIball.y = AIboardHeight - AIball.height;
      AIball.speedY *= -1;
    }

    // Draw ball
    AIcontext.fillStyle = "white";
    AIcontext.fillRect(AIball.x, AIball.y, AIball.width, AIball.height);

    // AIball collision with players
    if (AIDetectCollision(AIball, AIplayer1)) {
      AIhandleCollision(AIball, AIplayer1);
    } else if (AIDetectCollision(AIball, AIplayer2)) {
      AIhandleCollision(AIball, AIplayer2);
    }

    // AIball out of bounds (score)
    if (AIball.x < 0) {
      AIplayer2Score++;
      AIresetGame(1);
    } else if (AIball.x + AIballWidth > AIboardWidth) {
      AIplayer1Score++;
      AIresetGame(-1);
    }
  }

  // Check for win condition
  if ((AIplayer1Score >= 3 || AIplayer2Score >= 3) && !AIGameOver) {
    AIGameOver = true;

    const session_user = JSON.parse(localStorage.getItem('sessionUser'))

    let winner;

    if (AIplayer1Score >= 3)
        winner = session_user.username
    else
        winner = AIname


    const data = {
        game_type_id: 2,
        match_winner: winner,
        p1_score: AIplayer1Score,
        p2_score: AIplayer2Score,
        p1_username: session_user.username,
        p2_username: AIname,
    };

    try {
        const response = await fetch("http://localhost:8000/get_match_details/", {
            method: "POST",
            headers: { "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem('access_token')}`},
            body: JSON.stringify(data),
            credentials: "include",
        });
        if (response.ok) {
        }
    } catch (error) {
        console.error('Error:', error);
    }
    AIDisplayWinMessage();
  }
  // Draw scores
  AIcontext.font = "42px sans-serif";
  AIcontext.fillText(AIplayer1Score, AIboardWidth / 5, 45);
  AIcontext.fillText(AIplayer2Score, (AIboardWidth * 4) / 5 - 45, 45);
}

// Handle player 1 movement
function AImovePlayer(e) {
  // Player 1
  if (e.code == "KeyW") AIplayerSpeedY = -AIPlayerMaxSpeed;
  else if (e.code == "KeyS") AIplayerSpeedY = AIPlayerMaxSpeed;
}

// Stop player 1 movement
function AIstopPlayer(e) {
  // Player 1
  if (e.code == "KeyW" || e.code == "KeyS") AIplayerSpeedY = 0;
}

// AI logic for player 2
function moveAI() {
  switch (currentDifficulty) {
    case DIFFICULTY.EASY:
      moveAIEasy();
      AIname = 'EasyAI'
      break;
    case DIFFICULTY.MEDIUM:
      moveAIMedium();
      AIname = 'MediumAI'
      break;
    case DIFFICULTY.HARD:
      moveAIHard();
      AIname = 'HardAI'
      break;
    default:
      moveAIMedium(); // Default to medium
  }
}

// Easy mode: Slow reaction time
function moveAIEasy() {
  const reactionTime = 30; // Slower reaction time
  if (Math.abs(AIplayer2.y + AIplayer2.height / 2 - AIball.y) > reactionTime) {
    if (AIplayer2.y + AIplayer2.height / 2 < AIball.y) {
      AIplayer2.y += AIPlayerMaxSpeed * 0.5; // Move down slowly
    } else {
      AIplayer2.y -= AIPlayerMaxSpeed * 0.5; // Move up slowly
    }
  }
}

// Medium mode: Faster reaction time
function moveAIMedium() {
  const reactionTime = 10; // Faster reaction time
  if (Math.abs(AIplayer2.y + AIplayer2.height / 2 - AIball.y) > reactionTime) {
    if (AIplayer2.y + AIplayer2.height / 2 < AIball.y) {
      AIplayer2.y += AIPlayerMaxSpeed; // Move down
    } else {
      AIplayer2.y -= AIPlayerMaxSpeed; // Move up
    }
  }
}

// Hard mode: Predictive AI
function moveAIHard() {
  // Predict where the ball will intersect with the paddle's x-position
  const paddleX = AIplayer2.x;
  const ballTrajectory =
    AIball.y + (AIball.speedY / AIball.speedX) * (paddleX - AIball.x);

  // Move the paddle to intercept the ball
  if (AIplayer2.y + AIplayer2.height / 2 < ballTrajectory - 5) {
    AIplayer2.y += AIPlayerMaxSpeed; // Move down
  } else if (AIplayer2.y + AIplayer2.height / 2 > ballTrajectory + 5) {
    AIplayer2.y -= AIPlayerMaxSpeed; // Move up
  }
}

// Detect collision between two objects
function AIDetectCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// Handle ball collision with players
function AIhandleCollision(AIball, player) {
  if (player === AIplayer1 && AIball.x <= AIplayer1.x + AIplayer1.width) {
    AIball.x = AIplayer1.x + AIplayer1.width;
    AIball.speedX *= -1;
    AIball.speedY = (AIball.y - (AIplayer1.y + AIplayer1.height / 2)) / 10;
  } else if (player === AIplayer2 && AIball.x + AIball.width >= AIplayer2.x) {
    AIball.x = AIplayer2.x - AIball.width;
    AIball.speedX *= -1;
    AIball.speedY = (AIball.y - (AIplayer2.y + AIplayer2.height / 2)) / 10;
  }

  AIball.speedX = Math.min(
    Math.max(AIball.speedX * 1.1, -AImaxBallSpeed),
    AImaxBallSpeed
  );
  AIball.speedY = Math.min(
    Math.max(AIball.speedY * 1.1, -AImaxBallSpeed),
    AImaxBallSpeed
  );
}

// Reset game after a score
function AIresetGame(direction) {
  AIball.x = AIboardWidth / 2 - AIballWidth / 2;
  AIball.y = AIboardHeight / 2 - AIballHeight / 2;
  AIball.speedX = direction * AIballBaseSpeed;
  AIball.speedY = AIballBaseSpeed * (Math.random() > 0.5 ? 1 : -1); // Randomize initial direction
}

function AIDisplayWinMessage() {
  const winMessage = document.getElementById("win-message");
  winMessage.innerHTML = ""; // Clear existing content

  let winnerText = "";
  if (AIplayer1Score >= 3) {
    winnerText = `Player 1 Wins!`;
  } else {
    winnerText = `AI Wins!`;
  }

  const winnerAnnouncement = document.createElement("div");
  winnerAnnouncement.textContent = winnerText;
  winMessage.appendChild(winnerAnnouncement);

  // Create "Play Again" button
  const playAgainButton = document.createElement("button");
  playAgainButton.textContent = "Play Again";
  playAgainButton.addEventListener("click", AIresetGameStart);
  winMessage.appendChild(playAgainButton);

  // Create "Exit to Home" button
  const exitHomeButton = document.createElement("button");
  exitHomeButton.textContent = "Exit to Home";
  exitHomeButton.addEventListener("click", function(event) {renderPage("home");});
  winMessage.appendChild(exitHomeButton);

  winMessage.style.display = "block";
}

// Reset the game
function AIresetGameStart() {
  AIGameOver = false;
  AIplayer1Score = -1;
  AIplayer2Score = -1;

  const winMessage = document.getElementById("win-message");
  winMessage.style.display = "none";

  AIresetGame(1); // Reset ball to the center

  // Start the game loop again
  updateAI();
}