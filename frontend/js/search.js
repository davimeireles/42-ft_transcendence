async function ola(){
    console.log('ola')
    const btn = document.getElementById('btn-search');
    const search = document.getElementById('user-search');
    if (btn && search){
            console.log(search.value);  // You can log it or use it however you need
            try{
                const token = localStorage.getItem("access_token")
                if (!token)
                {
                    console.log("Token not found !")
                    return ;
                }else{
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
                    if (search.value === user.nickname){
                        console.log('cannot find your profile')
                        return ;
                    }
            }
            }catch(error){
                console.log('error')
                return;
            }
            try {
                const response = await fetch(`http://localhost:8000/return_user/${search.value}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({})
                })
                if (response.ok) {
                    const res = await response.json();
                    console.log(res.useranme)
                    renderPage('profiles')
                    console.log('after rendering')
                    setTimeout(() => {
                        const user = document.getElementById('text-user');
                        if (user) {
                            user.innerHTML = `${res.username}`;  // Update the username after the render
                        } else {
                            console.log('Profile section not loaded');
                        }
                    }, 100); // Wait for 500ms before checking DOM
                }
                else {
                    console.log('ERROR')
                }
            } catch (error) {
                console.log(error)
            }
            search.value = ''
    }else{
        console.log('error')
    }
}