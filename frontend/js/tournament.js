'use strict'

const randomInt = function(max) {
    return (Math.floor(Math.random() * max));
}

const shuffleArray = function(array) {
    let i = array.length - 1;

    while (i > 0) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
        i--;
    }
}

let tournamentButton = document.getElementById("tournament-button");

class Tournament {
    constructor(name, competitors) {
        this._name = name;
        this._created_by = JSON.parse(localStorage.getItem('sessionUser')).username;
        this._competitors = competitors;
        shuffleArray(this._competitors);
        if (this._competitors.length % 2) {
            this._competitors.push("Mighty Bot");
        }
    };
}


function renderTournament() {
    let profile = document.getElementById("profile-button");
    profile.addEventListener("click", function() {renderPage("profile");});
    let setting = document.getElementById("setting-button");
    setting.addEventListener("click", function() {renderPage("edit");});
    let home = document.getElementById("btn-home");
    home.addEventListener("click", function() {renderPage("home");});

    getTournament();
};

async function getTournament() {
    const session_user = JSON.parse(localStorage.getItem('sessionUser'))
    try {
        const response = await fetch(`http://localhost:8000/get_tournament/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(session_user)
        })
        if (response.ok) {
            const tournament = await response.json();
            tournamentScreen(tournament);
        }else {
            tournamentCreator();
        }
    } catch (error) {
        tournamentCreator();
    }
}



function tournamentCreator() {
    let tournamentModal = document.getElementById("tournament-modal");

    let createTournament = document.createElement("div");
    createTournament.classList.add("semi-transparent", "col", "w-75", "m-3");
    createTournament.id = "create-tournament";
    tournamentModal.append(createTournament);
    
    let tournamentForm = document.createElement("form");
    tournamentForm.id = "tournament-form";
    createTournament.append(tournamentForm);
    
    let titleLabel = document.createElement("label");
    titleLabel.classList.add("form-label-username", "pt-3");
    titleLabel.for = "tournament-title";
    titleLabel.dataset.translateKey = "Title";
    titleLabel.textContent = "Title";
    tournamentForm.append(titleLabel);

    let tournamentTitle = document.createElement("input");
    tournamentTitle.id = "tournament-title";
    tournamentTitle.type = "text";
    tournamentTitle.maxlength = "32";
    tournamentTitle.required = true;
    titleLabel.after(tournamentTitle);
    
    let sizeLabel = document.createElement("label");
    sizeLabel.classList.add("form-label-username", "pt-3");
    sizeLabel.for = "tournament-size";
    sizeLabel.dataset.translateKey = "Size";
    sizeLabel.textContent = "Size";
    tournamentTitle.after(sizeLabel);
    
    let tournamentSize = document.createElement("input");
    tournamentSize.id = "tournament-size";
    tournamentSize.type = "number";
    tournamentSize.min = "1";
    tournamentSize.max = "8";
    tournamentSize.required = true;
    sizeLabel.after(tournamentSize);
    
    let tournamentTable = document.createElement("table");
    tournamentTable.classList.add("w-100", "container", "mt-5")
    tournamentTable.id = "tournament-table";
    tournamentForm.append(tournamentTable);

    tournamentSize.addEventListener("input", function(event) {
        let max = parseInt(this.max, 10); // Read the max value from the attribute
        let min = parseInt(this.min, 10) || 1; // Default min value
        let value = parseInt(this.value, 10);

        // If value exceeds max or is below min, clamp it
        if (!isNaN(value)) {
            if (value >=1 && value % 10 != 9 && value % 10)
                this.value = value % 10;
            else if (value % 10 == 0)
                this.value = 1;
            else
                this.value = Math.min(Math.max(value, min), max);
        }
        let participants = event.target.value;
        let i = 0;
        tournamentTable.innerHTML = "";
        let tournament = {
            name: "",
            size: 0,
            competitors: []
        }
        while (i < participants && i < 8)
        {
            createCompetitorNode(i, tournamentTable);
            i++;
        }
        if (i > 0)
        {
            let confirm = document.createElement("input");
            confirm.classList.add("vapor-btn");
            confirm.type = "submit"
            confirm.value = "Start Tournament";
            tournamentForm.addEventListener("submit", ft_createTournament);
            tournamentTable.appendChild(confirm);
        }
    })
}


function createCompetitorNode(i, tournamentTable){
    let row = document.createElement("row");
    row.classList.add("competitor-row", "row", "justify-content-start", "mb-1")
    let label = document.createElement("label");
    label.classList.add("competitor-label", "col-4", "w-25");
    label.innerHTML = `P${i + 1}`;
    let input = document.createElement("input");
    input.classList.add("competitor-input", "col-8");
    input.placeholder = `Player ${i + 1}`;
    input.value = `Player ${i + 1}`;
    input.id = `player-${i}`;
    input.type = "text";
    input.setAttribute("maxlength", "12");
    input.required = true;
    row.appendChild(label);
    row.appendChild(input);
    tournamentTable.appendChild(row);
}

async function ft_createTournament(e) {
    e.preventDefault();
    let competitors = document.querySelectorAll(".competitor-input")
    let title = document.getElementById("tournament-title");
    let competitorList = new Array();
    competitors.forEach(id => competitorList.push(id.value));
    let tournament = new Tournament(title.value, competitorList);
    try {
        const response = await fetch("http://localhost:8000/get_tournament_details/", {
            method: "POST",
            headers: { "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('access_token')}`},
                body: JSON.stringify(tournament),
                credentials: "include",
            });
        if (response.ok) {
            console.log("Tournament details sent successfully");
        }
        else {    
            throw ("error");
        }
    }
    catch (error) {
        console.error(new Error(error));
        return ;
    }
    document.getElementById("create-tournament").remove();
    getTournament();
}

async function tournamentScreen(tournament) {
    let tournamentModal = document.getElementById("tournament-modal");
    let tournamentScreen = document.createElement("div");
    tournamentScreen.classList.add("semi-transparent", "col", "w-75", "m-3");
    tournamentScreen.id = "tournament-screen";
    tournamentModal.append(tournamentScreen);

    let title = document.createElement("h2");
    title.textContent = tournament.name;
    title.classList.add("glow", "d-flex", "justify-content-center");
    tournamentScreen.append(title);


    let summarized = await playoffTable(tournament, "tournament-screen");

    let nextMatch = getNextMatch(summarized.matches);
    if (!nextMatch)
        return ;
    let nextPlayers = getNextPlayers(summarized, nextMatch);

    let p1 = nextPlayers[0].nickname;
    let p2 = nextPlayers[1].nickname;
    let vsTitle = document.createElement("h4");
    vsTitle.style.fontFamily = "alien";
    vsTitle.style.textAlign = "center";
    vsTitle.classList.add("mt-3", "glow-red");
    vsTitle.textContent = `${p1} VS. ${p2}`
    tournamentScreen.append(vsTitle);
    let startMatchButton = document.createElement("button");
    startMatchButton.id = "start-match-button";
    startMatchButton.classList.add("vapor-btn");
    startMatchButton.textContent = "Start Match";
    tournamentScreen.append(startMatchButton);
    startMatchButton.addEventListener("click", tournamentGame.bind({tournament, nextMatch, nextPlayers}));
}

function getNextMatch(matches) {
    for (let i = 0; i < matches.length; i++) {
        if (!matches[i].played)
            return (matches[i]);
    }
    return (null);
}

function getNextPlayers(tournament, nextMatch) {
    let i = 0;

    while (i < tournament.matches.length)
    {
        if (nextMatch.id == tournament.matches[i].id)
            return ([tournament.players[(i * 2)], tournament.players[(i * 2) + 1]]);
        i++;
    }

}

async function getMatches(tournament) {
    try {
        const response = await fetch(`http://localhost:8000/get_matches/${tournament.id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('access_token')}`},
        });
        if (response.ok) {
            let matches = await response.json();
            return (matches);
        }
    }
    catch (error) {
        console.error(error);
    }
}

async function getPlayers(match) {
    try {
        const response = await fetch(`http://localhost:8000/get_players/${match.id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('access_token')}`},
        });
        if (response.ok) {
            let {players} = await response.json();
            return (players);
        }
    }
    catch (error) {
        console.error(error)
    }
}

const tSLoader = tournamentScreen;

async function playoffTable(tournament, modal) {
    let cols;
    let tournamentScreen = document.getElementById(modal);
    let pos = 0;

    let {matches} = await getMatches(tournament);
    //matches.sort((a, b) => a.id - b.id);
    matches = [...matches].sort((a, b) => a.id - b.id);
    let players = [];
    for (let i = 0; i < matches.length; i++)
    {
        let p = await getPlayers(matches[i]);
        players.push(...p);
    }
    const uniqueById = players.filter((obj => {
        const seen = new Set();
        return obj => {
          if (seen.has(obj.nickname)) {
            return false;
          }
          seen.add(obj.nickname);
          return true;
        };
      })());
    let size = uniqueById.length;


    if (size == 2)
        cols = 1;
    else if (size <= 4)
        cols = 2;
    else
        cols = 3;

    let playoffTable = document.createElement("div");
    playoffTable.classList.add("playoff-table", "d-flex", "justify-content-center");
    tournamentScreen.append(playoffTable);
    
    let playoffContent = document.createElement("div");
    playoffContent.classList.add("playoff-table-content");
    playoffTable.append(playoffContent);

    for (let i = 0; i < cols; i++) {
        let playoffTour = document.createElement("div");
        playoffTour.classList.add("playoff-table-tour");
        playoffContent.append(playoffTour);

        for (let j = cols - i < 3; j < 2; j++) {
            let playoffGroup = document.createElement("div");
            playoffGroup.classList.add("playoff-table-group");
            playoffTour.append(playoffGroup);
            for (let k = cols - i < 2; k < 2; k++) {
                let playoffPair = document.createElement("div");
                playoffPair.classList.add("playoff-table-pair", "playoff-table-pair-style");
                playoffGroup.append(playoffPair);
                
                let leftPlayer = document.createElement("div");
                leftPlayer.classList.add("playoff-table-left-player");
                if (players[pos])
                    leftPlayer.textContent = players[pos].nickname;
                leftPlayer.id = `player-pos-${pos++}`;
                playoffPair.append(leftPlayer);
                
                let rightPlayer = document.createElement("div");
                rightPlayer.classList.add("playoff-table-right-player");
                if (players[pos])
                    rightPlayer.textContent = players[pos].nickname;
                rightPlayer.id = `player-pos-${pos++}`;
                playoffPair.append(rightPlayer);
                if (i == 0 && j == 1 && k == 1 && size == 6){
                    leftPlayer.textContent = "";
                    pos--;
                    rightPlayer.textContent = "";
                    pos--;
                    playoffGroup.classList.add("hidden");
                }
                if (i == 1 && j == 1 && k == 1 && size == 6) {
                    leftPlayer.textContent = document.getElementById("player-pos-4").textContent;
                    pos--;
                    rightPlayer.textContent = document.getElementById("player-pos-5").textContent;
                    pos--;
                }
            }
        } 
    }
    return ({matches: matches, players: players});
}




















function tournamentGame() {
    let tournament = this.tournament;
    let match = this.nextMatch;
    let players = this.nextPlayers;
    let aiMatch = false;
    if (players[1].nickname === "Mighty Bot") {
        aiMatch = true;
        let aiPlayer = 1;
    }
    else if (players[0].nickname === "Mighty Bot") {
        aiMatch = true;
        let aiPlayer = 0;
    }

    let tournamentScreen = document.getElementById("tournament-screen");
    tournamentScreen.innerHTML = "";
    let homeGamesDiv = document.createElement("div");
    homeGamesDiv.id = "home-games";
    homeGamesDiv.classList.add("home-games");
    homeGamesDiv.innerHTML = `
            <canvas id="board" style="width: 100%; height: 100%; border-top: 5px solid #b700ff; border-bottom: 5px solid #b700ff;"></canvas>
        `;
    tournamentScreen.append(homeGamesDiv);

    // Board configs

    let boardWidth = 1024;
    let boardHeight = 300;
    let context;

    // Default paddle colors
    const defaultPlayerColor = "rgb(3, 255, 3)"; // Green

    // Players configs
    let playerWidth = 10;
    let playerHeight = 45;
    let player1SpeedY = 0;
    let player2SpeedY = player1SpeedY;
    let player1Score;
    let player2Score;
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
    let player1Color = defaultPlayerColor; // Initialize Player 1 color
    let player2Color = defaultPlayerColor; // Initialize Player 2 color

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
    let gameOver;

    // Initialize the game
    async function renderTournamentPong() {
        board = document.getElementById("board");
        gameOver = false;
        player1Score = 0;
        player2Score = 0;

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
            winMessage.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
            winMessage.style.color = "white";
            winMessage.style.padding = "20px";
            winMessage.style.fontSize = "24px";
            winMessage.style.textAlign = "center";
            gameContainer.appendChild(winMessage);
        }
        
        // Start the initial game loop
        document.addEventListener("keyup", stopPlayer);
        document.addEventListener("keydown", movePlayer);
        resetGameStart();
        }
    }

    // Function to create player customization sections
    function createPlayerCustomization(playerName, setColorFunction) {
        const container = document.createElement("div");
        container.style.marginBottom = "10px"; // Add some spacing

        const title = document.createElement("h3");
        title.textContent = playerName + " - Choose Your Paddle Color:";
        container.appendChild(title);

        const colors = ["green", "red", "blue"]; // Green, Red, Blue
        colors.forEach(color => {
        const colorButton = document.createElement("button");
        colorButton.textContent = color;
        colorButton.style.backgroundColor = color;
        colorButton.style.color = "white";
        colorButton.style.padding = "5px 10px";
        colorButton.style.border = "none";
        colorButton.style.margin = "5px";
        colorButton.style.cursor = "pointer";
        colorButton.addEventListener("click", () => setColorFunction(color));
        container.appendChild(colorButton);
        });

        return container;
    }

    // Show customization modal
    function showCustomizationModal() {
        // Create a "Start Game" button
        const startGameButton = document.createElement("button");
        startGameButton.textContent = "Start Game";
        startGameButton.addEventListener("click", () => {
        customizationModal.style.display = "none"; // Hide modal
        document.addEventListener("keyup", stopPlayer);
        document.addEventListener("keydown", movePlayer);
        resetGameStart();
        });
        customizationModal.appendChild(startGameButton);

        customizationModal.style.display = "flex";
    }

    function moveAIHard(pPos) {
        // Predict where the ball will intersect with the paddle's x-position
        let AIplayer;
        if (pPos)
            AIplayer = player2;
        else
            AIplayer = player1;
        const paddleX = AIplayer.x;
        const ballTrajectory =
          ball.y + (ball.speedY / ball.speedX) * (paddleX - ball.x);
      
        // Move the paddle to intercept the ball
        if (AIplayer.y + AIplayer.height / 2 < ballTrajectory - 5) {
          AIplayer.y += 3; // Move down
        } else if (AIplayer.y + AIplayer.height / 2 > ballTrajectory + 5) {
          AIplayer.y -= 3; // Move up
        }
      }

    // Main game loop
    async function update(time) {
        if (!gameOver) {
            requestAnimationFrame(update); // Continue the animation loop
            if (aiMatch)
                moveAIHard();
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
    async function displayWinMessage() {
        const winMessage = document.getElementById("win-message");
        winMessage.innerHTML = ""; // Clear existing content
        let p_win;
        let winnerText = "";
        if (player1Score >= 3) {
            p_win = players[0];
            winnerText = `${players[0].nickname} Wins!`;
        } else {
            p_win = players[1];
            winnerText = `${players[1].nickname} Wins!`;
        }
        try {
            const response = await fetch(`http://localhost:8000/update_match/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({match: match, winner: p_win})
            })
            if (response.ok) {
                const result = await response.json();
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }

        const winnerAnnouncement = document.createElement("div");
        winnerAnnouncement.textContent = winnerText;
        winMessage.appendChild(winnerAnnouncement);

        // Create "Play Again" button
        const playAgainButton = document.createElement("button");
        playAgainButton.textContent = "Continue";
        playAgainButton.addEventListener("click", continueButton);
        winMessage.appendChild(playAgainButton);


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

    function continueButton() {
        tournamentScreen.remove();
        tSLoader(tournament);
    }
    renderTournamentPong();
}