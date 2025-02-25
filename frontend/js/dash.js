const renderUser = async () => {
    const imageTag = document.getElementById("profileImage")
    const session_user = JSON.parse(localStorage.getItem('sessionUser'))
    console.log(session_user.username)
    console.log(session_user.photo)
    if (imageTag && session_user.photo){
        imageTag.src = `http://localhost:8000/media/${session_user.username}.jpg`;
    }else{
        imageTag.src = 'media/default.jpg'
    }
    const welcome_user = document.getElementById("welcome_user");
    if (welcome_user)
        welcome_user.innerHTML= `Welcome, ${session_user.username}`;
    const mode = document.getElementById("mode");
    if (mode)
        mode.innerHTML= `Select game mode`;
    const friends = session_user.friends
    console.log(document.getElementById('friends-online'))
    if (friends && friends.length > 0 && friends.online) {
        friends.forEach(friend => {
            const friends_list = document.getElementById('friends-online');
            const friendItem = document.createElement("li");
            friendItem.textContent = `${friend.username}`;
            friends_list.appendChild(friendItem);
            console.log(friend)
     });
    } else {
        return ;
    }
    };
