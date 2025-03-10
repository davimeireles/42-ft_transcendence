'use strict'

const renderProfile =  function(){
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
        console.log('hello')
        imageTag.src = `http://localhost:8000/media/${session_user.username}.jpg`;
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
            console.log(friend)
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
    console.log(profileUsername)
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

async function getMatchHistory()
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
        const response = await fetch(`http://localhost:8000/match_history_page/${session_user.userId}`,
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