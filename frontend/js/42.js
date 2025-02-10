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
        console.log(code)
        try {
            const response = await fetch('http://localhost:8000/oauth42/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code })
            })
            const res = await response.json();

                console.log('Getting user was a success')
                console.log(res.user.first_name)
                console.log(res.user.last_name)
                console.log(res.user.email)
                const login = res.user.login
                console.log(login)
                try{
                    const response = await fetch(`http://localhost:8000/return_user/${login}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({})
                    })
                    const u = await response.json();
                    document.getElementById('profile-container').innerHTML = `
                        <h1>Profile: ${u.user.username}</h1>
                        <p>Email: ${u.user.email}</p>
                        <p>Nickname: ${u.user.nickname}</p>`;
                }catch(error){
                    console.log(error)
                }
        } catch (error) {
            console.log(error)
        }
    } else {
        console.log('code does not exists')
    }
}