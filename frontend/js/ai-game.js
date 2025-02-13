// AIboard configs
let AIboard;
let AIboardWidth = 600;
let AIboardHeight = 300;
let AIcontext;

// Players configs
let AIplayerWidth = 10;
let AIplayerHeight = 50;
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
const AIballBaseSpeed = 2;
const AImaxBallSpeed = 10; // Maximum speed of the ball

let AIball = {
  x: AIboardWidth / 2,
  y: AIboardHeight / 2,
  width: AIballWidth,
  height: AIballHeight,
  speedX: AIballBaseSpeed,
  speedY: AIballBaseSpeed,
};

let AIlastTime = 0;

// Difficulty settings
const DIFFICULTY = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
};

let currentDifficulty = DIFFICULTY.MEDIUM; // Default difficulty

// Initialize the game
function renderAIgame() {
    
  AIboard = document.getElementById("ai-board");

  if (AIboard)
  {
      AIboard.height = AIboardHeight;
      AIboard.width = AIboardWidth;
      AIcontext = AIboard.getContext("2d"); // Used for drawing on the AIboard
    
      requestAnimationFrame(updateAI);
      document.addEventListener("keyup", AIstopPlayer);
      document.addEventListener("keydown", AImovePlayer);
  }
}

// Main game loop
function updateAI(time) {
  requestAnimationFrame(updateAI);

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

  // Draw ball
  AIcontext.fillStyle = "white";
  AIball.x += AIball.speedX * (deltaTime / 16);
  AIball.y += AIball.speedY * (deltaTime / 16);
  AIcontext.fillRect(AIball.x, AIball.y, AIball.width, AIball.height);

  // AIball collision with top and bottom walls
  if (AIball.y <= 0 || AIball.y + AIball.height >= AIboardHeight) {
    AIball.speedY *= -1;
  }

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
      break;
    case DIFFICULTY.MEDIUM:
      moveAIMedium();
      break;
    case DIFFICULTY.HARD:
      moveAIHard();
      break;
    default:
      moveAIMedium(); // Default to medium
  }
}

// Easy mode: Slow reaction time
function moveAIEasy() {
  const reactionTime = 30; // Slower reaction time
  if (Math.abs(AIplayer2.y + AIplayer2.height / 2 - ball.y) > reactionTime) {
    if (AIplayer2.y + AIplayer2.height / 2 < ball.y) {
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
    // Collision with AIplayer1 (left paddle)
    AIball.x = AIplayer1.x + AIplayer1.width; // Correct the AIball's position
    AIball.speedX *= -1; // Reverse X direction
    AIball.speedY = (AIball.y - (AIplayer1.y + AIplayer1.height / 2)) / 10; // Adjust Y direction based on where it hits the paddle
  } else if (player === AIplayer2 && AIball.x + AIball.width >= AIplayer2.x) {
    // Collision with AIplayer2 (right paddle)
    AIball.x = AIplayer2.x - AIball.width; // Correct the AIball's position
    AIball.speedX *= -1; // Reverse X direction
    AIball.speedY = (AIball.y - (AIplayer2.y + AIplayer2.height / 2)) / 10; // Adjust Y direction based on where it hits the paddle
  }

  // Increase speed after collision (capped at AImaxBallSpeed)
  AIball.speedX = Math.min(
    Math.max(AIball.speedX * 1.1, -AImaxBallSpeed),
    AImaxBallSpeed
  );
  ball.speedY = Math.min(
    Math.max(AIball.speedY * 1.1, -AImaxBallSpeed),
    AImaxBallSpeed
  );
}

// Reset game after a score
function AIresetGame(direction) {
  AIball = {
    x: AIboardWidth / 2,
    y: AIboardHeight / 2,
    width: AIballWidth,
    height: AIballHeight,
    speedX: direction * AIballBaseSpeed,
    speedY: AIballBaseSpeed,
  };
}