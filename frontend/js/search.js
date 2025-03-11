
async function searchProfile(){
    const search = document.getElementById('user-search');
    if (!search){
        console.log('Doesnt exist')
    }else{
        console.log('exists')
    }
    const results = document.getElementById('results');
    const query = search.value.trim();
    if (query.length === 0){
        results.innerHTML = '';
        return ;
    }
    
    fetch(`http://localhost:8000/return_user/?q=${query}`)
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            results.innerHTML = '';
            data.forEach((user) => {
                if (user.username !== 'admin' && user.username !== 'Player2'&& user.username !== 'EasyAI'&& user.username !== 'MediumAI'&& user.username !== 'HardAI'){
                    const h6 = document.createElement('h6');
                    h6.textContent = `${user.username}`; // Display username and email
                    results.appendChild(h6);
                    h6.addEventListener('click', () => getProfile(user.username))
                }
            });
        })
        .catch((error) => console.log('Error', error));
}

async function getProfile(username) {
    const session_user = JSON.parse(localStorage.getItem('sessionUser'))
    if (session_user.username == username)
        return ;
    else{
        console.log('Selected user:', username);
        try {
            const response = await fetch(`http://localhost:8000/get_user/${username}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({})
            })
            if (response.ok) {
                const user = await response.json();
                localStorage.setItem('searchedUser', JSON.stringify(user));
                renderPage('profiles')
            }else {
                console.log('ERROR')
            }
        } catch (error) {
            console.log(error)
        }
    }
}

function renderProfiles(){
    let home = document.getElementById("btn-home");
    home.addEventListener("click", function() {renderPage("home");});
    const btn_friend = document.getElementById('btn-friend')
    const searchedUser = localStorage.getItem('searchedUser');
    const session_user = JSON.parse(localStorage.getItem('sessionUser'))
    const imageTag = document.getElementById("profileImage")
    const user = JSON.parse(searchedUser);
    const online = document.getElementById("online")
    if (online && user.online){
        online.innerHTML = 'Online'
    }
    else{
        online.innerHTML = 'Offline'
    }
    if (imageTag && user.photo){
        console.log('hello')
        imageTag.src = `http://localhost:8000/media/${user.username}.jpg`;
    }else{
        imageTag.src = 'media/default.jpg'
    }
    if (user){
        const user_text = document.getElementById('text-user');
        if (user_text) {
            user_text.innerHTML = user.username;  // Update the username after the render
        } else {
            console.log('Profile section not loaded');
        }
    }
    const friends = session_user.friends
    console.log(session_user.friends)
    if (friends) {
        friends.forEach(friend => {
            if (user.username === friend.username){
                btn_friend.innerHTML = 'Friends';
                btn_friend.setAttribute("data-translate-key", "Friends");
            }else{
                btn_friend.innerHTML = 'Add Friend';
                btn_friend.setAttribute("data-translate-key", "Add Friend");
            }
        });
    }
}
