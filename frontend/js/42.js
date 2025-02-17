const redi42 = async function () {
    try {
        const response = await fetch('http://localhost:8000/auth-42/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
        })
        const res = await response.json();
        window.location.href = res.url
    } catch (error) {
        console.log(error)
    }
};

window.onload = async function () {
    const url = new URLSearchParams(window.location.search)
    const code = url.get('code')
    if (code) {
        try {
            const response = await fetch('http://localhost:8000/oauth42/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code })
            })
            if (response.ok) {
                const res = await response.json();
                localStorage.removeItem("sessionUser"); 
                console.log(res.message);
                console.log(res.access_token)
                localStorage.setItem('access_token', res.access_token);
                localStorage.setItem('refresh_token', res.refresh_token);
                try {
                    const token = localStorage.getItem("access_token")
                    if (!token)
                    {
                      console.log("Token not found !")
                      return ;
                    }
                    else{
                        const response_user = await fetch("http://localhost:8000/session_user/", {
                            method: "GET",
                            headers: {
                                "Authorization": `Bearer ${token}`,  // Send token in headers
                            }
                        });
                        if (!response.ok) {
                          throw new Error("Failed to fetch user");
                        }
                        const user = await response_user.json();
                        console.log('hello')
                          const sessionUser = {username: user.username, 
                            email: user.email, nickiname: user.nickname, 
                            friends: user.friends, online: user.online}
                          localStorage.setItem('sessionUser', JSON.stringify(sessionUser));
                        }
                      } catch (error) {
                        console.log("Error:", error);
                      }
            }
            else {
                const res = await response.json();
                console.log('ERROR')
            }
        } catch (error) {
            console.log(error)
        }
    } else {
        return ;
    }
}