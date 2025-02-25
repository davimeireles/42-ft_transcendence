const logout = async function (){
    try {
        const token = localStorage.getItem("access_token")
        const refresh_token = localStorage.getItem("refresh_token")
        const response = await fetch("http://localhost:8000/logout/", {
            method: "POST",
            credentials: "include", // Include cookies
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({refresh_token}),
        });
        
        if (response.ok) {
            try {
                const keys = ["sessionUser", "access_token", "refresh_token", "searchedUser"];
                keys.forEach(key => {
                    if (localStorage.getItem(key)) {
                        localStorage.removeItem(key);
                    }
                });
              } catch (e) {
                console.error("Error removing item from localStorage:", e);
              }
            console.log("Logged out successfully");
            window.location.href = "/intro";
        } else {
            const user = await response.json();
            console.log(user.message)
            console.log("Logout failed");
        }
    } catch (error) {
        console.log(error)
    }
}

setTimeout(async () => {
    window.alert('Your session expired');
    try {
        const token = localStorage.getItem("access_token");

        const response = await fetch("http://localhost:8000/check_token/", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ token: token }),
        });

        if (response.ok) {
            console.log('Token is valid');
            const user = await response.json();
            console.log(user.valid)

        } else {
            console.log('Token expired, logging out...');
            const user = await response.json();
            console.log(user.valid)
            logout()
        }
    } catch (error) {
        console.error("Error checking token:", error);
    }
}, 300000);
