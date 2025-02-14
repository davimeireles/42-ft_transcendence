const renderProfile = async function(username){
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
            if (user.friends && user.friends.length > 0) {
                user.friends.forEach(friend => {
                    const friends_list = document.getElementById('friends-list');
                    const friendItem = document.createElement("li");
                    friendItem.textContent = `${friend.username}`;
                    friends_list.appendChild(friendItem);
                    console.log(friend)
                });
            } else {
                const friends_list = document.getElementById('friends-list');
                const friendItem = document.createElement("li");
                friendItem.textContent = 'You have no friends :(';
                friends_list.appendChild(friendItem);
            }
            const text = document.getElementById("text-text")
            const text_user = document.getElementById("text-user")
            if (text_user){
                text_user.innerHTML = `${user.username}`
            }
        }
    } catch (error) {
        console.log("Error:", error);
    }
}

async function add_remove_friend(){
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
            const sessionUser = await response.json();
            const profileUsername = document.getElementById('text-user').innerHTML;
            if (!profileUsername){
                console.log('Cannot get usernmae');
                return ;
            }
            console.log('Profile Username:', profileUsername);
            const btn_friend = document.getElementById('btn-friend')
            if (!btn_friend){
                return ;
            }
            if (btn_friend.innerHTML === 'Add Friend'){
                try{
                        const response_add_user = await fetch("http://localhost:8000/add_user/", {
                            method: "POST",
                            headers: {
                                'Content-Type': 'application/json',
                                "Authorization": `Bearer ${token}`,
                            },
                            body: JSON.stringify({profileUsername})
                        });
                        if (!response_add_user.ok) {
                            throw new Error("Failed to fetch user");
                        }
                        const sessionUser = await response_add_user.json();
                        console.log(sessionUser.message)
                        btn_friend.innerHTML = 'Friends';
                }catch(error){
                    console.log('Cannot get add_user')
                    return;
                }
            }else if (btn_friend.innerHTML === 'Friends'){
                try{
                        const response_remove_user = await fetch("http://localhost:8000/remove_user/", {
                            method: "POST",
                            headers: {
                                'Content-Type': 'application/json',
                                "Authorization": `Bearer ${token}`,
                            },
                            body: JSON.stringify({profileUsername})
                        });
                        if (!response_remove_user.ok) {
                            throw new Error("Failed to fetch user");
                        }
                        const sessionUser = await response_remove_user.json();
                        console.log(sessionUser.message)
                        btn_friend.innerHTML = 'Add Friend';
                }catch(error){
                    console.log('Cannot get add_user')
                    return;
                }
            }
    }
    }catch(error){
        console.log('Cannot get session_user')
        return;
    }
}

