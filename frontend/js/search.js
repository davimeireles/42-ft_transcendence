
async function searchProfile(){
    const search = document.getElementById('user-search');
    const results = document.getElementById('results');
    const query = search.value.trim();
    if (query.length === 0){
        results.innerHTML = '';
        return ;
    }
    
    fetch(`http://localhost:8000/return_user/?q=${query}`)
        .then((response) => response.json())
        .then((data) => {
            results.innerHTML = '';
            data.forEach((user) => {
                if (user.username !== 'admin' && user.username !== 'LocalPlayer'&& user.username !== 'EasyAI'&& user.username !== 'MediumAI'&& user.username !== 'HardAI'){
                    const h6 = document.createElement('h6');
                    h6.textContent = `${user.username}`; // Display username and email
                    results.appendChild(h6);
                    h6.addEventListener('click', () => getProfile(user.username))
                }
            });
        })
        .catch((error) => console.error('Error', error));
}

async function getProfile(username) {
    const session_user = JSON.parse(localStorage.getItem('sessionUser'))
    if (session_user.username == username)
        return ;
    else{
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
                renderPage('profiles', true, username)
            }
        } catch (error) {
            console.error(error)
        }
    }
}
