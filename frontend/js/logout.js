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
            renderPage("intro");
        }
    } catch (error) {
        console.error(error)
    }
}

let sessionInterval = setInterval(async () => {
    const token = localStorage.getItem("access_token");
    const ref_token = localStorage.getItem("refresh_token");
    if (!token || !ref_token) {
        logout();
        return clearInterval(sessionInterval);
    }
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
                const user = await response.json();
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
                        localStorage.removeItem('accesss_token');
                        localStorage.removeItem('refresh_token');
                        localStorage.setItem('access_token', res.access_token);
                        localStorage.setItem('refresh_token', res.refresh_token);
                    } else {
                        const res = await response.json();
                    }
                } catch (error) {
                    console.error("Error checking token:", error);
                }
    
            } else {
                const user = await response.json();
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
},  2700000);
