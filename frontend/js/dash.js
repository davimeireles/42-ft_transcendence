const renderUser = async () => {

    const imageTag = document.getElementById("profileImage")
    const session_user = JSON.parse(localStorage.getItem('sessionUser'))

    if (imageTag && session_user.photo) {
        imageTag.src = `http://localhost:8000/media/${session_user.username}.jpg`;
    } else {
        imageTag.src = 'media/default.jpg'
    }

    const welcome_user = document.getElementById("welcome_user");

    if (welcome_user)
        welcome_user.innerHTML = `, ${session_user.nickname}`;

    const friends = session_user.friends

    console.log(document.getElementById('friends-online'))

    if (friends && friends.length > 0 && friends.online) {
        friends.forEach(friend => {
            const friends_list = document.getElementById('friends-online');
            const friendItem = document.createElement("li");
            friendItem.textContent = `${friend.username}`;
            friends_list.appendChild(friendItem);
     });
    } else {
        return ;
    }
};
