const renderUser = async () => {
  let profile = document.getElementById("profile-button");
  profile.addEventListener("click", function() {renderPage("profile");});
  let setting = document.getElementById("setting-button");
  setting.addEventListener("click", function() {renderPage("edit");});
  let tournament = document.getElementById("tournament-button");
  tournament.addEventListener("click", function(event) {renderPage("tournament");});
  const imageTag = document.getElementById("profileImage")
  const session_user = JSON.parse(localStorage.getItem('sessionUser'))
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
  const welcome_user = document.getElementById("welcome_user");
  if (welcome_user)
    welcome_user.innerHTML= `, ${session_user.nickname}`;
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

