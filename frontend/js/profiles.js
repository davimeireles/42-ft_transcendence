'use strict'

let total_tourney_entriesP;
let currentTourneyPageP;
let TOTAL_TOURNEY_PAGESP;

let total_entriesP;
let currentPageP;
let TOTAL_PAGESP;

const ITEMS_PER_PAGEP = 5;
let session_userP;

let langPackProS = {
    en:["No previous Tournaments available", "No match history available"],
    pt:["Nenhum torneio anterior disponível", "Nenhum histórico de partidas disponível"],
    fr:["Aucun tournoi précédent disponible", "Aucun historique de matchs disponible",]
}


async function get_user_by_str(nickname)
{
    try
    {
        const response = await fetch(`http://localhost:8000/get_user_by_id/${nickname}/`,
        {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
            }
        })
        if(response.ok)
        {
            const user_info = await response.json();
            return user_info;
        }
    }
    catch(error)
    {
        console.error("Error caught @get_user_by_str: ", error);
    }
}

function isUserInArray(username, users) {
    return users.some(user => user.username === username);
}

async function renderProfiles(target_user){
    session_userP = await get_user_by_str(target_user);
    const logged_user = JSON.parse(localStorage.getItem('sessionUser'));
    const btn_friend = document.getElementById('btn-friend');

    if(isUserInArray(session_userP.username, logged_user.friends))
    {
        btn_friend.innerHTML = 'Friends';
    }
    else
    {
        console.error("not found");
        btn_friend.innerHTML = 'Add Friend';
    }

    let home = document.getElementById("btn-home");
    home.addEventListener("click", function() {renderPage("home");});
    const imageTag = document.getElementById("profileImage")
    const online = document.getElementById("online")

    if (online && session_userP.online){
        online.innerHTML = 'Online'
    }
    else{
        online.innerHTML = 'Offline'
    }
    if (imageTag && session_userP.photo){
      const response = await fetch(`http://localhost:8000/media/${session_userP.username}.jpg`);
      if (!response.ok)
        throw new Error("Failed to fetch image");
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
          localStorage.setItem(`userPhoto_${session_userP.username}`, reader.result);
          imageTag.src = reader.result;
      };
    }else{
      imageTag.src = 'media/default.jpg'
    }
    const friends = session_userP.friends
    if (friends.length) {
        let no_friends = document.getElementById("no_friends_2");
        if (no_friends)
            no_friends.remove();
    }
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
        text_user.innerHTML = `${session_userP.nickname}`
    }
    getUserGameInfoP();
    getMatchHistoryP(1);
    getTournamentHistoryP(1);
}

async function add_remove_friendP(){
    const token = localStorage.getItem("access_token");
    const logged_user = JSON.parse(localStorage.getItem('sessionUser'));
    if (!token)
    {
        console.error("Token not found !");
        return ;
    }
    const btn_friend = document.getElementById('btn-friend');
    const user_text = document.getElementById('text-user');
    const profileUsername = user_text.innerHTML;
    if (!btn_friend){
        return ;
    }
    if (btn_friend.innerHTML === 'Add Friend'){
        try{
            const response_add_user = await fetch("http://localhost:8000/add_userS/", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    toAdd: session_userP.username,
                    adder: logged_user.username
                })});
            if (!response_add_user.ok) {
                throw new Error("Failed to fetch user");
            }
            const user = await response_add_user.json();
            btn_friend.innerHTML = 'Friends';
        }catch(error){
            console.error(error);
            return;
        }
    }else if (btn_friend.innerHTML === 'Friends'){
        try{
            const response_remove_user = await fetch("http://localhost:8000/remove_userS/", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    toAdd: session_userP.username,
                    adder: logged_user.username
                })
            });
            if (!response_remove_user.ok) {
                throw new Error("Failed to fetch user");
            }
            const user = await response_remove_user.json();
            btn_friend.innerHTML = 'Add Friend';
        }catch(error){
            return;
        }
    }
    try {
        const token = localStorage.getItem("access_token")
        if (!token)
        {
          console.error("Token not found !")
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
              const sessionUser = {userId: user.id, username: user.username, 
                email: user.email, nickname: user.nickname, 
                friends: user.friends, online: user.online, photo: user.photo}
              localStorage.setItem('sessionUser', JSON.stringify(sessionUser));
            }
          } catch (error) {
            console.error("Error:", error);
        }
}

async function getUserGameInfoP(page)
{
    const token = localStorage.getItem("access_token")
    if (!token){
        return ;
    }
	try{
        const response = await fetch(`http://localhost:8000/count_user_games/${session_userP.id}`,{
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`,
            }
        })
        if(response.ok){
            const gameInfo = await response.json();
            total_entriesP = gameInfo.total_games;
            TOTAL_PAGESP = Math.ceil(total_entriesP / ITEMS_PER_PAGEP);
            total_tourney_entriesP = gameInfo.total_tournaments;
            TOTAL_TOURNEY_PAGESP = total_tourney_entriesP / ITEMS_PER_PAGEP;
            currentTourneyPageP = 1;
            currentPageP = 1;

            if(total_tourney_entriesP > 0)
                renderTourneyPaginationP();
            if(total_entriesP > 0)
                renderPaginationP();
            drawChartsP(gameInfo);
        }
    }
    catch(error){
        console.error("Error caught @count_user_games: ", error);
    }
}

async function drawChartsP(gameInfo)
{
    if(total_entriesP > 0){
        const token = localStorage.getItem("access_token")
        if (!token){
            console.error("Token not found !")
            return ;
        }
        try{
            const response = await fetch(`http://localhost:8000/get_playing_habits/${session_userP.id}`,{
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`,
                }
            })
            if(response.ok){
                const playinghabits = await response.json();
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


async function getTournamentHistoryP(page)
{
    const token = localStorage.getItem("access_token")
    if (!token)
    {
        console.error("Token not found !")
        return ;
    }
    try
    {
        const response = await fetch(`http://localhost:8000/tournament_history_page/${session_userP.id}/${page}/`,
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
            displayTournamentHistoryP(match_history.history);
        }
    }
    catch(error)
    {
        console.error("Error caught @getMatchHistory: ", error);
    }
}

function displayTournamentHistoryP(matchHistory) {
    const historyContainer = document.getElementById("HistoryTournament");
    historyContainer.innerHTML = ""; // Clear existing content

    // Check if there are any matches
    if (!matchHistory || matchHistory.length === 0) {
        let p = document.createElement("p");
        historyContainer.appendChild(p);
        let span1 = document.createElement("span");
        span1.textContent = `${langPackProS[localStorage.selectedLanguage][0]}`;
        span1.dataset.translateKey = "No Tournaments";
        p.append(span1);
        return; 
    }
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


async function getMatchHistoryP(page)
{
    const token = localStorage.getItem("access_token")
    if (!token)
    {
        console.error("Token not found !")
        return ;
    }
    try
    {
        const response = await fetch(`http://localhost:8000/match_history_page/${session_userP.id}/${page}/`,
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
            displayMatchHistoryP(match_history.history);
        }
    }
    catch(error)
    {
        console.error("Error caught @getMatchHistory: ", error);
    }
}

function displayMatchHistoryP(matchHistory) {
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

        if (match.Winner === session_userP.id) {
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
function fetchMatchDetailsP(matchID) {
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

/* document.addEventListener("click", async function (event) {
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
                    playoffTable(tournament, 'profileModalBody')
                }
            }
            catch(error){
                console.error(error)
            }
        }
        const modalElement = document.getElementById("profileModal");
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        const profileModal = document.getElementById("profileModalBody");
        profileModal.innerHTML = ""
    }
}); */


function renderTourneyPaginationP() {
    if(total_tourney_entriesP === 0)
        return;

    const TOTAL_TOURNEY_PAGESP = Math.ceil(total_tourney_entriesP / ITEMS_PER_PAGEP);
    const pagination = document.getElementById("tournament-pages");
    pagination.innerHTML = "";  
    
    if(currentTourneyPageP != 1)
    {
        pagination.innerHTML += `<li class="page-item ${currentTourneyPageP === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeTourneyPageP(1)">First</a>
        </li>`;
    }

    
    // Previous Button
    pagination.innerHTML += `<li class="page-item ${currentTourneyPageP === 1 ? 'disabled' : ''}">
    <a class="page-link" href="#" onclick="changeTourneyPageP(${currentTourneyPageP - 1})"><</a>
    </li>`;
    
    if(currentTourneyPageP > 1 )
    {
        pagination.innerHTML += `<li class="page-item disabled">
            <a class="page-link">...</a>
        </li>`;
    }

    // Page Numbers
    for (let i = currentTourneyPageP; i <= TOTAL_TOURNEY_PAGESP && i < currentTourneyPageP + 3; i++) {
        pagination.innerHTML += `<li class="page-item ${i === currentTourneyPageP ? 'active' : ''}">
            <a class="page-link" href="#" onclick="changeTourneyPageP(${i})">${i}</a>
        </li>`;
    }
    
    if(currentTourneyPageP < TOTAL_TOURNEY_PAGESP - 2)
    {
        pagination.innerHTML += `<li class="page-item disabled">
            <a class="page-link">...</a>
        </li>`;
    }

    // Next Button
    pagination.innerHTML += `<li class="page-item ${currentTourneyPageP === TOTAL_TOURNEY_PAGESP ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="changeTourneyPageP(${currentTourneyPageP + 1})">></a>
    </li>`;


    if(currentTourneyPageP != TOTAL_TOURNEY_PAGESP)
    {
        pagination.innerHTML += `<li class="page-item ${currentTourneyPageP === TOTAL_TOURNEY_PAGESP ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeTourneyPageP(${TOTAL_TOURNEY_PAGESP})">Last</a>
        </li>`;
    }
}

function renderPaginationP() {
    if(total_entriesP === 0)
        return;
    const TOTAL_PAGESP = Math.ceil(total_entriesP / ITEMS_PER_PAGEP);
    const pagination = document.getElementById("match-pages");
    pagination.innerHTML = "";  
    

    if(currentPageP != 1)
    {
        pagination.innerHTML += `<li class="page-item ${currentPageP === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePageP(1)">First</a>
        </li>`;
    }

    
    // Previous Button
    pagination.innerHTML += `<li class="page-item ${currentPageP === 1 ? 'disabled' : ''}">
    <a class="page-link" href="#" onclick="changePageP(${currentPageP - 1})"><</a>
    </li>`;
    
    if(currentPageP > 1)
    {
        pagination.innerHTML += `<li class="page-item disabled">
            <a class="page-link">...</a>
        </li>`;
    }

    // Page Numbers
    for (let i = currentPageP; i <= TOTAL_PAGESP && i < currentPageP + 3; i++) {
        pagination.innerHTML += `<li class="page-item ${i === currentPageP ? 'active' : ''}">
            <a class="page-link" href="#" onclick="changePageP(${i})">${i}</a>
        </li>`;
    }
    
    if(currentPageP < TOTAL_PAGESP - 2)
    {
        pagination.innerHTML += `<li class="page-item disabled">
            <a class="page-link">...</a>
        </li>`;
    }

    // Next Button
    pagination.innerHTML += `<li class="page-item ${currentPageP === TOTAL_PAGESP ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="changePageP(${currentPageP + 1})">></a>
    </li>`;


    if(currentPageP != TOTAL_PAGESP)
    {
        pagination.innerHTML += `<li class="page-item ${currentPageP === TOTAL_PAGESP ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePageP(${TOTAL_PAGESP})">Last</a>
        </li>`;
    }
}

function changeTourneyPageP(page) {
    if (page < 1 || page > TOTAL_TOURNEY_PAGESP || page == currentTourneyPageP) return;  
    currentTourneyPageP = page; 
    renderTourneyPaginationP();
    getTournamentHistoryP(page);
}

function changePageP(page) {
    if (page < 1 || page > TOTAL_PAGESP || page == currentPageP) return;  
    currentPageP = page; 
    renderPaginationP();
    getMatchHistoryP(page)
}

/* async function makeMatches(n){
    const id = JSON.parse(localStorage.getItem('sessionUser')).userId;
    const response = await fetch('http://localhost:8000/dummy_matches/',{
        method: 'POST',
        headers:{
            'COntent-Type': 'application/json',
        },
        body: JSON.stringify({
            num_matches: n,
            user_id: id
        }),
    });

    const data = await response.json();
} */