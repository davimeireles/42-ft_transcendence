
async function searchProfile(){
    const search = document.getElementById('user-search');
    if (!search){
        console.log('Doesnt exist')
    }else{
        console.log('exists')
    }
    const results = document.getElementById('results');
    const query = search.value.trim();
    if (query.length === 0){
        results.innerHTML = '';
        return ;
    }
    
    fetch(`http://localhost:8000/return_user/?q=${query}`)
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            results.innerHTML = '';
            data.forEach((user) => {
                const h6 = document.createElement('h6');
                h6.textContent = `${user.username}`; // Display username and email
                results.appendChild(h6);
                h6.addEventListener('click', () => getProfile(user.username))
            });
        })
        .catch((error) => console.log('Error', error));
}

async function getProfile(username) {
    const session_user = JSON.parse(localStorage.getItem('sessionUser'))
    if (session_user.username == username)
        return ;
    else{
        console.log('Selected user:', username);
        try {
            const response = await fetch(`http://localhost:8000/get_user/${username}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({})
            })
            if (response.ok) {
                const user = await response.json();
                localStorage.setItem('searchedUser', JSON.stringify(user));
                renderPage('profiles')
            }else {
                console.log('ERROR')
            }
        } catch (error) {
            console.log(error)
        }
    }
}

function renderProfiles(){
    const btn_friend = document.getElementById('btn-friend')
    const searchedUser = localStorage.getItem('searchedUser');
    const session_user = JSON.parse(localStorage.getItem('sessionUser'))
    const user = JSON.parse(searchedUser);
    if (user){
        const user_text = document.getElementById('text-user');
        if (user_text) {
            user_text.innerHTML = user.username;  // Update the username after the render
        } else {
            console.log('Profile section not loaded');
        }
    }
    const friends = session_user.friends
    console.log(session_user.friends)
    if (friends) {
        friends.forEach(friend => {
            if (user.username === friend.username){
                btn_friend.innerHTML = 'Friends';
            }else{
                btn_friend.innerHTML = 'Add Friend';
            }
        });
    }
}
    // const btn = document.getElementById('btn-search');
    // const search = document.getElementById('user-search');
    // if (btn && search){
    //         try{
    //             const token = localStorage.getItem("access_token")
    //             if (!token)
    //             {
    //                 console.log("Token not found !")
    //                 return ;
    //             }else{
    //                 const response = await fetch("http://localhost:8000/session_user/", {
    //                     method: "GET",
    //                     headers: {
    //                         "Authorization": `Bearer ${token}`,  // Send token in headers
    //                     }
    //                 });
    //                 if (!response.ok) {
    //                     throw new Error("Failed to fetch user");
    //                 }
    //                 const user = await response.json();
    //                 if (search.value === user.nickname){
    //                     console.log('cannot find your profile')
    //                     return ;
    //                 }
    //         }
    //         }catch(error){
    //             console.log('error')
    //             return;
    //         }
    //         try {
    //             const response = await fetch(`http://localhost:8000/return_user/${search.value}`, {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                 },
    //                 body: JSON.stringify({})
    //             })
    //             if (response.ok) {
    //                 const user = await response.json();
    //                 console.log(`USER ${user.username}`)
    //                 console.log(`EMAIL ${user.email}`)
    //                 if (user.friends && user.friends.length > 0) {
    //                     user.friends.forEach(friend => {
    //                         const friends_list = document.getElementById('friends-list');
    //                         const friendItem = document.createElement("li");
    //                         friendItem.textContent = `${friend.username}`;
    //                         friends_list.appendChild(friendItem);
    //                         console.log(friend)
    //                     });
    //                 } else {
    //                     const friends_list = document.getElementById('friends-list');
    //                     const friendItem = document.createElement("li");
    //                     friendItem.textContent = `${user.username} has no friends`;
    //                     friends_list.appendChild(friendItem);
    //                 }
    //                 localStorage.setItem('searchedUser', search.value);
    //                 renderPage('profiles')
    //                 setTimeout(() => {
    //                     renderProfiles();
    //                 }, 100);
    //             }
    //             else {
    //                 console.log('ERROR')
    //             }
    //         } catch (error) {
    //             console.log(error)
    //         }
    //         search.value = ''
    // }else{
    //     console.log('error')
    // }
// }

    
