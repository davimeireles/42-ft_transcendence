const renderUser = async () => {
    const session_user = JSON.parse(localStorage.getItem('sessionUser'))
    const welcome_user = document.getElementById("welcome_user");
    if (welcome_user)
        welcome_user.innerHTML= `Welcome, ${session_user.username}`;
    const mode = document.getElementById("mode");
    if (mode)
        mode.innerHTML= `Select game mode`;
};
