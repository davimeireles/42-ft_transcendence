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

let sessionInterval = setInterval(async () => {
    const token = localStorage.getItem("access_token");
    const ref_token = localStorage.getItem("refresh_token");
    if (!token || !ref_token) {
        console.log("No tokens found. Logging out...");
        logout();
        return clearInterval(sessionInterval);
    }
    // window.alert('Your session expired');
    if (confirm('Your session will expire, Do you want to continue with your session')){
        try {
            const response = await fetch("http://localhost:8000/check_token/", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ token: token, ref: ref_token }),
            });
            if (response.ok) {
                console.log('Token is valid');
                const user = await response.json();
                console.log(user.valid)
                try {
                    const response = await fetch("http://localhost:8000/new_session/", {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json',
                            "Authorization": `Bearer ${token}`,
                        },
                    });
                    if (response.ok) {
                        const res = await response.json();
                        console.log(res.message);
                        console.log(res.access_token)
                        localStorage.removeItem('accesss_token');
                        localStorage.removeItem('refresh_token');
                        localStorage.setItem('access_token', res.access_token);
                        localStorage.setItem('refresh_token', res.refresh_token);
                    } else {
                        const res = await response.json();
                        console.log(res.message)
                    }
                } catch (error) {
                    console.error("Error checking token:", error);
                }
    
            } else {
                console.log('Token expired, logging out...');
                const user = await response.json();
                console.log(user.valid)
                logout()
                return clearInterval(sessionInterval);
            }
        } catch (error) {
            console.error("Error checking token:", error);
        }
    }
    else{
        logout()
        return clearInterval(sessionInterval);
    }
},  270000);
