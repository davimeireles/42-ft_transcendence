const logout = async function (){
    try {
        const token = localStorage.getItem("access_token")
        const refresh_token = localStorage.getItem("refresh_token")
        const response = await fetch("http://localhost:8000/logout/", {
            method: "POST",
            credentials: "include", // Include cookies
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({refresh_token}),
        });
        
        if (response.ok) {
            try {
                localStorage.removeItem("sessionUser");
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                localStorage.removeItem("searchedUser");
              } catch (e) {
                console.error("Error removing item from localStorage:", e);
              }
            console.log("Logged out successfully");
            window.location.href = "/intro"; // Redirect to login page
        } else {
            const user = await response.json();
            console.log(user.message)
            console.log("Logout failed");
        }
    } catch (error) {
        console.log(error)
    }
}