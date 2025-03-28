'use strict'

let total_tourney_entries;
let currentTourneyPage;
let TOTAL_TOURNEY_PAGES;

let total_entries;
let currentPage;
let TOTAL_PAGES;

const ITEMS_PER_PAGE = 5;


let langPackPro = {
    en:["No previous Tournaments available", "No match history available"],
    pt:["Nenhum torneio anterior disponível", "Nenhum histórico de partidas disponível"],
    fr:["Aucun tournoi précédent disponible", "Aucun historique de matchs disponible",]
}

async function updateSessionUserP(token) {
    localStorage.removeItem("sessionUser");
    try {
        const response = await fetch("http://localhost:8000/session_user/", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        });
        if (!response.ok) {
            throw new Error("Failed to fetch user");
        }
        const user = await response.json();
        const sessionUser = {
            userId: user.id,
            username: user.username,
            email: user.email,
            nickname: user.nickname,
            friends: user.friends,
            online: user.online,
            photo: user.photo
        };
        localStorage.setItem('sessionUser', JSON.stringify(sessionUser));
    } catch (error) {
        console.log("Error:", error);
    }
}

const renderProfile = async function() {
    let setting = document.getElementById("setting-button");
    console.log()
    setting.addEventListener("click", function() {renderPage("edit");});
    let twoFA = document.getElementById("twoFA-button");
    twoFA.addEventListener("click", function() {renderPage("enable2FA");});

    let home = document.getElementById("btn-home");
    home.addEventListener("click", function() {renderPage("home");});
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
    if (friends.length) {
        let no_friends = document.getElementById("no_friends");
        no_friends.remove();
    }
    if (friends && friends.length > 0) {
        friends.forEach(friend => {
            const friends_list = document.getElementById('friends-list');
            const friendItem = document.createElement("li");
            friendItem.textContent = `${friend.username}`;
            if(friend.online)
            {
                friendItem.style.color = "green";
            }
            else
            {
                friendItem.style.color = "red";
            }
            friends_list.appendChild(friendItem);
     });
    }
    const text = document.getElementById("text-text")
    const text_user = document.getElementById("text-user")
    if (text_user){
        text_user.innerHTML = `${session_user.nickname}`
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

            if(total_tourney_entries > 0)
                renderTourneyPagination();
            if(total_entries > 0)
                renderPagination();
            drawCharts(gameInfo);
        }
        else{
            console.log("not work :( @ count_user_games", response.status);
        };
    }
    catch(error){
        console.error("Error caught @count_user_games: ", error);
    }
}

async function drawCharts(gameInfo)
{
    if(total_entries > 0){
        const session_user = JSON.parse(localStorage.getItem('sessionUser'));
        const token = localStorage.getItem("access_token")
        if (!token){
            console.log("Token not found !")
            return ;
        }
        try{
            const response = await fetch(`http://localhost:8000/get_playing_habits/${session_user.userId}`,{
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`,
                }
            })
            if(response.ok){
                const playinghabits = await response.json();
                console.log(playinghabits);
                const ctx = document.getElementById("habitsCanvas")
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: playinghabits.months,  // x-axis labels (months)
                        datasets: [{
                            label: 'Games Played',
                            data: playinghabits.games_played,  // y-axis data (games played)
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Month'
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Games Played'
                                },
                                beginAtZero: true
                            }
                        }
                    }
                });
            }
            else{
                console.log("not work :( @ drawCharts", response.status);
            };
        }
        catch(error){
            console.error("Error caught @drawCharts: ", error);
        }

        new Chart(document.getElementById("newcanvas"), {
            type: "pie",
            data: {
                labels: ["Games Won", "Games Lost"],
                datasets: [{
                    data: [gameInfo.total_wins, (gameInfo.total_games - gameInfo.total_wins)],
                    backgroundColor: [
                        "#660A8A", // Bootstrap primary color
                        "#332837", // Bootstrap success color
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
        let p = document.createElement("p");
        historyContainer.appendChild(p);
        let span1 = document.createElement("span");
        span1.textContent = `${langPackProS[localStorage.selectedLanguage][0]}`
        span1.dataset.translateKey = "No Tournaments";
        p.append(span1);
        return; 
    }

    matchHistory.forEach(tournament => {
        console.log("Tournament Name:", tournament.entry.name);
        console.log("Tournament ID:", tournament.entry.id);
        console.log("----");
    });
    matchHistory.forEach(tournament => {
        const matchElement = document.createElement("div");
        matchElement.className = "tournament-entry"; // Optional: for styling
        matchElement.setAttribute("tournament-id", tournament.entry.id)
        matchElement.style.backgroundColor = "#660A8A";

        matchElement.innerHTML = `
            <p>Tournament: ${tournament.entry.name}</p>
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
        let p = document.createElement("p");
        historyContainer.appendChild(p);
        let span1 = document.createElement("span");
        span1.textContent = `${langPackProS[localStorage.selectedLanguage][1]}`
        span1.dataset.translateKey = "No Tournaments";
        p.append(span1);
        return; 
    }


    // Create and append match entries
    matchHistory.forEach(match => {
        const matchElement = document.createElement("div");
        matchElement.className = "match-entry text-center"; // Optional: for styling
        matchElement.setAttribute("match-id", match.matchId)

        if (match.Winner === session_user.userId) {
            matchElement.style.backgroundColor = "#660A8A";
        } else {
            matchElement.style.backgroundColor = "#332837";
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
            const matchDetailsList = document.getElementById("profileModalBody");
            const match = game.game_info;
            
            document.getElementById("modal-title").innerHTML = "Match Details";
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

document.addEventListener("click", function (event) {
    if (event.target.closest(".match-entry")) {
        const matchElement = event.target.closest(".match-entry");
        const matchID = matchElement.getAttribute("match-id");

        // Store match ID in modal
        const modalElement = document.getElementById("profileModal");
        modalElement.setAttribute("data-match-id", matchID);
        fetchMatchDetails(matchID)
        // Open modal using Bootstrap API (ensures event fires)
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
});

document.addEventListener("click", async function (event) {
    if (event.target.closest(".tournament-entry")) {
        const tourneyElement = event.target.closest(".tournament-entry");
        const tournamentID = tourneyElement.getAttribute("tournament-id");
        if (event.target.closest(".tournament-entry")) {
            try {
                const response = await fetch(`http://localhost:8000/get_tournament_by_id/${tournamentID}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                if (response.ok) {
                    const tournament = await response.json();
                    document.getElementById("modal-title").innerHTML = tournament.name;
                    console.log(tournament);
                    playoffTable(tournament, 'profileModalBody')
                }
            }
            catch(error){
                console.log(error)
            }
        }
        const modalElement = document.getElementById("profileModal");
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        const profileModal = document.getElementById("profileModalBody");
        profileModal.innerHTML = ""
    }
});


function renderTourneyPagination() {
    if(total_tourney_entries === 0)
        return;

    const TOTAL_TOURNEY_PAGES = Math.ceil(total_tourney_entries / ITEMS_PER_PAGE);
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
    
    if(currentTourneyPage > 1 )
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
    if(total_entries === 0)
        return;
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

async function makeMatches(n){
    const id = JSON.parse(localStorage.getItem('sessionUser')).userId;
    const response = await fetch('http://localhost:8000/dummy_matches/',{
        method: 'POST',
        headers:{
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            num_matches: n,
            user_id: id
        }),
    });

    const data = await response.json();
}