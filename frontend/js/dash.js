const renderUser = async () => {
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
            console.log(user.username);
            console.log(user.email);
            console.log(user.nickname);
            const welcome_user = document.getElementById("welcome_user");
            console.log(welcome_user)
            if (welcome_user)
                welcome_user.innerHTML= `Welcome, ${user.username}`;
            const mode = document.getElementById("mode");
            console.log(mode)
            if (mode)
                mode.innerHTML= `Select game mode`;
        }
    } catch (error) {
        console.log("Error:", error);
    }
};
