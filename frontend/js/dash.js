const getProfile = async () => {
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
        }
    } catch (error) {
        console.log("Error:", error);
    }
};
