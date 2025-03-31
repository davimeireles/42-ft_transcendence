
async function searchProfile(){
    const session_user = JSON.parse(localStorage.getItem('sessionUser'));
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
                if (user.nickname !== session_user.nickname && user.nickname !== 'admin' && user.nickname !== 'LocalPlayer'&& user.nickname !== 'EasyAI'&& user.nickname !== 'MediumAI'&& user.nickname !== 'HardAI'){
                    const h6 = document.createElement('h6');
                    h6.textContent = `${user.nickname}`; // Display nickname and email
                    results.appendChild(h6);
                    h6.addEventListener('click', () => getProfile(user.nickname))
                }
            });
        })
        .catch((error) => console.error('Error', error));
}

async function getProfile(nickname) {
    const session_user = JSON.parse(localStorage.getItem('sessionUser'))
    if (session_user.nickname == nickname)
        return ;
    else{
        try {
            const response = await fetch(`http://localhost:8000/get_user/${nickname}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({})
            })
            if (response.ok) {
                const user = await response.json();
                localStorage.setItem('searchedUser', JSON.stringify(user));
                renderPage('profiles', true, nickname)
            }
        } catch (error) {
            console.error(error)
        }
    }
}
