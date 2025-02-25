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
    console.log(session_user.photo)
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
    } else {
        const friends_list = document.getElementById('friends-list');
        const friendItem = document.createElement("li");
        friendItem.textContent = 'You have no friends :(';
        friends_list.appendChild(friendItem);
    }
    const text = document.getElementById("text-text")
    const text_user = document.getElementById("text-user")
    if (text_user){
        text_user.innerHTML = `${session_user.username}`
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

