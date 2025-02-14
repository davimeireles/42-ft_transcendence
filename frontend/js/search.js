
async function searchProfile(){
    const btn = document.getElementById('btn-search');
    const search = document.getElementById('user-search');
    if (btn && search){
            try{
                const token = localStorage.getItem("access_token")
                if (!token)
                {
                    console.log("Token not found !")
                    return ;
                }else{
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
                    if (search.value === user.nickname){
                        console.log('cannot find your profile')
                        return ;
                    }
            }
            }catch(error){
                console.log('error')
                return;
            }
            try {
                const response = await fetch(`http://localhost:8000/return_user/${search.value}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({})
                })
                if (response.ok) {
                    const user = await response.json();
                    console.log(`USER ${user.username}`)
                    console.log(`EMAIL ${user.email}`)
                    if (user.friends && user.friends.length > 0) {
                        user.friends.forEach(friend => {
                            const friends_list = document.getElementById('friends-list');
                            const friendItem = document.createElement("li");
                            friendItem.textContent = `${friend.username}`;
                            friends_list.appendChild(friendItem);
                            console.log(friend)
                        });
                    } else {
                        const friends_list = document.getElementById('friends-list');
                        const friendItem = document.createElement("li");
                        friendItem.textContent = `${user.username} has no friends`;
                        friends_list.appendChild(friendItem);
                    }
                    localStorage.setItem('searchedUser', search.value);
                    renderPage('profiles')
                    setTimeout(() => {
                        renderProfiles();
                    }, 100);
                }
                else {
                    console.log('ERROR')
                }
            } catch (error) {
                console.log(error)
            }
            search.value = ''
    }else{
        console.log('error')
    }
}

function renderProfiles(){
    const userFromStorage = localStorage.getItem('searchedUser');
    if (userFromStorage){
        const user = document.getElementById('text-user');
        if (user) {
            user.innerHTML = userFromStorage;  // Update the username after the render
        } else {
            console.log('Profile section not loaded');
        }
    }
}