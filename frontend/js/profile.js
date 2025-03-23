'use strict'

<<<<<<< HEAD
let total_tourney_entries;
let currentTourneyPage;
let TOTAL_TOURNEY_PAGES;

let total_entries;
let currentPage;
let TOTAL_PAGES;

const ITEMS_PER_PAGE = 2;

const renderProfile =  function(){
=======
const renderProfile = async function(){
    let setting = document.getElementById("setting-button");
    setting.addEventListener("click", function() {renderPage("edit");});
    let twoFA = document.getElementById("twoFA-button");
    twoFA.addEventListener("click", function() {renderPage("enable2FA");});

    let home = document.getElementById("btn-home");
    home.addEventListener("click", function() {renderPage("home");});
>>>>>>> dev
    const session_user = JSON.parse(localStorage.getItem('sessionUser'))
    const imageTag = document.getElementById("profileImage")
    const online = document.getElementById("online")
    if (online && session_user.online){
        online.innerHTML = 'Online'
    }
    else{
        online.innerHTML = 'Offline'
    }
    if (imageTag && session_user.photo){
      const response = await fetch(`http://localhost:8000/media/${session_user.username}.jpg`);
      if (!response.ok)
        throw new Error("Failed to fetch image");
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
          localStorage.setItem(`userPhoto_${session_user.username}`, reader.result);
          imageTag.src = reader.result;
      };
    }else{
      imageTag.src = 'media/default.jpg'
    }
    const friends = session_user.friends
    if (friends && friends.length > 0) {
        friends.forEach(friend => {
            const friends_list = document.getElementById('friends-list');
            const friendItem = document.createElement("li");
            friendItem.textContent = `${friend.username}`;
            friends_list.appendChild(friendItem);
     });
    }
    const text = document.getElementById("text-text")
    const text_user = document.getElementById("text-user")
    if (text_user){
        text_user.innerHTML = `${session_user.nickname}`
    }
}

async function add_remove_friend(){
    const token = localStorage.getItem("access_token")
    if (!token)
    {
        console.log("Token not found !")
        return ;
    }
    const session_user = JSON.parse(localStorage.getItem('sessionUser'))
    const btn_friend = document.getElementById('btn-friend')
    const user_text = document.getElementById('text-user');
    const profileUsername = user_text.innerHTML;
    if (!btn_friend){
        return ;
    }
    if (btn_friend.innerHTML === 'Add Friend'){
        try{
            const response_add_user = await fetch("http://localhost:8000/add_user/", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({profileUsername})
                });
            if (!response_add_user.ok) {
                throw new Error("Failed to fetch user");
            }
            const user = await response_add_user.json();
            console.log(user.message)
            btn_friend.innerHTML = 'Friends';
        }catch(error){
            console.log('Cannot get add_user')
            return;
        }
    }else if (btn_friend.innerHTML === 'Friends'){
        try{
            const response_remove_user = await fetch("http://localhost:8000/remove_user/", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({profileUsername})
            });
            if (!response_remove_user.ok) {
                throw new Error("Failed to fetch user");
            }
            const user = await response_remove_user.json();
            console.log(user.message)
            console.log(user.user)
            btn_friend.innerHTML = 'Add Friend';
        }catch(error){
            console.log('Cannot get remove_user')
            return;
        }
    }
    try {
        const token = localStorage.getItem("access_token")
        if (!token)
        {
          console.log("Token not found !")
          return ;
        }
        else{
            const response = await fetch("http://localhost:8000/session_user/", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,  // Send token in headers
                }
            });
            if (!response.ok) {
              throw new Error("Failed to fetch user");
            }
            const user = await response.json();
              const sessionUser = {username: user.username, 
                email: user.email, nickiname: user.nickname, 
                friends: user.friends, online: user.online, photo: user.photo}
              localStorage.setItem('sessionUser', JSON.stringify(sessionUser));
            }
          } catch (error) {
            console.log("Error:", error);
        }
}

async function makeTourney()
{
    const session_user = JSON.parse(localStorage.getItem('sessionUser'));
    const token = localStorage.getItem("access_token")
    if (!token){
        console.log("Token not found !")
        return ;
    }
	try{
        const response = await fetch(`http://localhost:8000/make_tourney/${session_user.userId}/`,{
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`,
            }
        })
        if(response.ok){

        }
        else{
            console.log("not work :( @ makeTourney", response.status);
        };
    }
    catch(error){
        console.error("Error caught @makeTourney: ", error);
    }
}

async function getUserGameInfo(page)
{
    const session_user = JSON.parse(localStorage.getItem('sessionUser'));
    const token = localStorage.getItem("access_token")
    if (!token){
        console.log("Token not found !")
        return ;
    }
	try{
        const response = await fetch(`http://localhost:8000/count_user_games/${session_user.userId}`,{
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`,
            }
        })
        if(response.ok){
            const gameInfo = await response.json();
            total_entries = gameInfo.total_games;
            TOTAL_PAGES = Math.ceil(total_entries / ITEMS_PER_PAGE);
            total_tourney_entries = gameInfo.total_tournaments;
            TOTAL_TOURNEY_PAGES = total_tourney_entries / ITEMS_PER_PAGE;

            currentTourneyPage = 1;
            currentPage = 1;

            renderTourneyPagination();
            renderPagination();
            drawCharts(gameInfo);
            console.log(gameInfo)
        }
        else{
            console.log("not work :( @ count_user_games", response.status);
        };
    }
    catch(error){
        console.error("Error caught @count_user_games: ", error);
    }
}

function drawCharts(gameInfo)
{
    new Chart(document.getElementById("newcanvas"), {
        type: "pie",
        data: {
            labels: ["Games Won", "Games Lost"],
            datasets: [{
                data: [gameInfo.total_wins, (gameInfo.total_games - gameInfo.total_wins)],
                backgroundColor: [
                    "#0d6efd", // Bootstrap primary color
                    "#198754", // Bootstrap success color
                    "#ffc107", // Bootstrap warning color
                    "#dee2e6"  // Light gray
                ],
                    borderColor: "transparent"
                }]
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
        }
    })
}


async function getTournamentHistory(page)
{
    const session_user = JSON.parse(localStorage.getItem('sessionUser'));
    const token = localStorage.getItem("access_token")
    if (!token)
    {
        console.log("Token not found !")
        return ;
    }
    try
    {
        const response = await fetch(`http://localhost:8000/tournament_history_page/${session_user.userId}/${page}/`,
        {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`,
            }
        })
        if(response.ok)
        {
            const match_history = await response.json();
            displayTournamentHistory(match_history.history);
        }
        else
        {
            console.log("not work :( @ getMatchHistory", response.status);
        };
    }
    catch(error)
    {
        console.error("Error caught @getMatchHistory: ", error);
    }
}

function displayTournamentHistory(matchHistory) {
    const session_user = JSON.parse(localStorage.getItem('sessionUser'));
    const historyContainer = document.getElementById("HistoryTournament");
    historyContainer.innerHTML = ""; // Clear existing content

    // Check if there are any matches
    if (!matchHistory || matchHistory.length === 0) {
        historyContainer.innerHTML = "<p>No previous Tournaments available</p>";
        return; 
    }

    matchHistory.forEach(entry => {
        console.log("Tournament ID:", entry.tournament.id);
        console.log("Created By:", entry.tournament.createdBy);
        console.log("Winner:", entry.tournament.winner);
        console.log("Created At:", entry.tournament.created_at);
    
        console.log("----");
    });
     matchHistory.forEach(match => {
        const matchElement = document.createElement("div");
        matchElement.className = "tournament-entry"; // Optional: for styling
        matchElement.setAttribute("tournament-id", match.tournament.id)

        if (match.tournament.winner === session_user.nickname) {
            matchElement.style.backgroundColor = "green";
        } else {
            matchElement.style.backgroundColor = "red";
        }

        matchElement.innerHTML = `
            <p>Tournament: ${match.tournament.name}</p>
        `;
        historyContainer.appendChild(matchElement);
    });
}


async function getMatchHistory(page)
{
    const session_user = JSON.parse(localStorage.getItem('sessionUser'));
    const token = localStorage.getItem("access_token")
    if (!token)
    {
        console.log("Token not found !")
        return ;
    }
    try
    {
        const response = await fetch(`http://localhost:8000/match_history_page/${session_user.userId}/${page}/`,
        {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`,
            }
        })
        if(response.ok)
        {
            const match_history = await response.json();
            displayMatchHistory(match_history.history);
        }
        else
        {
            console.log("not work :( @ getMatchHistory", response.status);
        };
    }
    catch(error)
    {
        console.error("Error caught @getMatchHistory: ", error);
    }
}

function displayMatchHistory(matchHistory) {
    const session_user = JSON.parse(localStorage.getItem('sessionUser'));
    const historyContainer = document.getElementById("HistoryGames");
    historyContainer.innerHTML = ""; // Clear existing content

    // Check if there are any matches
    if (!matchHistory || matchHistory.length === 0) {
        historyContainer.innerHTML = "<p>No match history available</p>";
        return; 
    }


    // Create and append match entries
    matchHistory.forEach(match => {
        const matchElement = document.createElement("div");
        matchElement.className = "match-entry"; // Optional: for styling
        matchElement.setAttribute("match-id", match.matchId)

        if (match.Winner === session_user.userId) {
            matchElement.style.backgroundColor = "green";
        } else {
            matchElement.style.backgroundColor = "red";
        }

        matchElement.innerHTML = `
            <p>${match.User1} ${match.User1Score} - ${match.User2Score} ${match.User2}</p>
        `;
        historyContainer.appendChild(matchElement);
    });
}



// Function to fetch match details
function fetchMatchDetails(matchID) {
    fetch(`http://localhost:8000/get_match_info/${matchID}`)
        .then(response => response.json())
        .then(game => {
            const matchDetailsList = document.getElementById("matchDetails");
            const match = game.game_info;
            matchDetailsList.innerHTML = ""; // Clear previous list items
            // Create list items dynamically
            const details = [
                `Player 1: ${match.User1}`,
                `Player 2: ${match.User2}`,
                `Final Score:  ${match.User1Score} - ${match.User2Score}`,
                `Date: ${new Date(match.matchDate).toLocaleString()}`,
            ];
            details.forEach(detail => {
                const li = document.createElement("li");
                li.textContent = detail;
                matchDetailsList.appendChild(li);
            });
        })
        .catch(error => console.error("Error fetching match details:", error));
}

function fetchTournamentDetails(tournamentID) {
    fetch(`http://localhost:8000/get_tournament_info/${tournamentID}`)
        .then(response => response.json())
        .then(game => {
            const tournamentDetailsList = document.getElementById("matchDetails");
            const tournament = game.game_info;
            tournamentDetailsList.innerHTML = ""; // Clear previous list items
            // Create list items dynamically
            console.log(tournament)
            tournament.forEach(player => {
                const li = document.createElement("li");
                li.textContent = `${player.name} - ${player.standing}`;
                tournamentDetailsList.appendChild(li);
            });
            const li = document.createElement("li");
            li.textContent = new Date(game.creation_date).toLocaleString();
            tournamentDetailsList.appendChild(li);
        })
        .catch(error => console.error("Error fetching match details:", error));
}

document.addEventListener("click", function (event) {
    if (event.target.closest(".match-entry")) {
        const matchElement = event.target.closest(".match-entry");
        const matchID = matchElement.getAttribute("match-id");

        // Store match ID in modal
        const modalElement = document.getElementById("matchModal");
        modalElement.setAttribute("data-match-id", matchID);
        fetchMatchDetails(matchID)
        // Open modal using Bootstrap API (ensures event fires)
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
});

document.addEventListener("click", function (event) {
    if (event.target.closest(".tournament-entry")) {
        const matchElement = event.target.closest(".tournament-entry");
        const tournamentID = matchElement.getAttribute("tournament-id");
    
        // Store tournament ID in modal
        const modalElement = document.getElementById("matchModal");
        modalElement.setAttribute("data-match-id", tournamentID);
        console.log(tournamentID)
        fetchTournamentDetails(tournamentID)
        // Open modal using Bootstrap API (ensures event fires)
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
});z


function renderTourneyPagination() {
    const pagination = document.getElementById("tournament-pages");
    pagination.innerHTML = "";  
    

    if(currentTourneyPage != 1)
    {
        pagination.innerHTML += `<li class="page-item ${currentTourneyPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeTourneyPage(1)">First</a>
        </li>`;
    }

    
    // Previous Button
    pagination.innerHTML += `<li class="page-item ${currentTourneyPage === 1 ? 'disabled' : ''}">
    <a class="page-link" href="#" onclick="changeTourneyPage(${currentTourneyPage - 1})"><</a>
    </li>`;
    
    if(currentTourneyPage > 1)
    {
        pagination.innerHTML += `<li class="page-item disabled">
            <a class="page-link">...</a>
        </li>`;
    }

    // Page Numbers
    for (let i = currentTourneyPage; i <= TOTAL_TOURNEY_PAGES && i < currentTourneyPage + 3; i++) {
        pagination.innerHTML += `<li class="page-item ${i === currentTourneyPage ? 'active' : ''}">
            <a class="page-link" href="#" onclick="changeTourneyPage(${i})">${i}</a>
        </li>`;
    }
    
    if(currentTourneyPage < TOTAL_TOURNEY_PAGES - 2)
    {
        pagination.innerHTML += `<li class="page-item disabled">
            <a class="page-link">...</a>
        </li>`;
    }

    // Next Button
    pagination.innerHTML += `<li class="page-item ${currentTourneyPage === TOTAL_TOURNEY_PAGES ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="changeTourneyPage(${currentTourneyPage + 1})">></a>
    </li>`;


    if(currentTourneyPage != TOTAL_TOURNEY_PAGES)
    {
        pagination.innerHTML += `<li class="page-item ${currentTourneyPage === TOTAL_TOURNEY_PAGES ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeTourneyPage(${TOTAL_TOURNEY_PAGES})">Last</a>
        </li>`;
    }
}

function renderPagination() {
    const TOTAL_PAGES = Math.ceil(total_entries / ITEMS_PER_PAGE);
    const pagination = document.getElementById("match-pages");
    pagination.innerHTML = "";  
    

    if(currentPage != 1)
    {
        pagination.innerHTML += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(1)">First</a>
        </li>`;
    }

    
    // Previous Button
    pagination.innerHTML += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
    <a class="page-link" href="#" onclick="changePage(${currentPage - 1})"><</a>
    </li>`;
    
    if(currentPage > 1)
    {
        pagination.innerHTML += `<li class="page-item disabled">
            <a class="page-link">...</a>
        </li>`;
    }

    // Page Numbers
    for (let i = currentPage; i <= TOTAL_PAGES && i < currentPage + 3; i++) {
        pagination.innerHTML += `<li class="page-item ${i === currentPage ? 'active' : ''}">
            <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
        </li>`;
    }
    
    if(currentPage < TOTAL_PAGES - 2)
    {
        pagination.innerHTML += `<li class="page-item disabled">
            <a class="page-link">...</a>
        </li>`;
    }

    // Next Button
    pagination.innerHTML += `<li class="page-item ${currentPage === TOTAL_PAGES ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">></a>
    </li>`;


    if(currentPage != TOTAL_PAGES)
    {
        pagination.innerHTML += `<li class="page-item ${currentPage === TOTAL_PAGES ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${TOTAL_PAGES})">Last</a>
        </li>`;
    }
}

function changeTourneyPage(page) {
    if (page < 1 || page > TOTAL_TOURNEY_PAGES || page == currentTourneyPage) return;  
    currentTourneyPage = page; 
    renderTourneyPagination();
    getTournamentHistory(page);
}

function changePage(page) {
    if (page < 1 || page > TOTAL_PAGES || page == currentPage) return;  
    currentPage = page; 
    renderPagination();
    getMatchHistory(page)
}