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
                const login = res.user.login
                console.log(login)
                console.log(res.access_token);
                localStorage.setItem("access_token", res.access_token)
                // try{
                //     const response = await fetch(`http://localhost:8000/return_user/${login}`, {
                //         method: 'POST',
                //         headers: {
                //             'Content-Type': 'application/json',
                //         },
                //         body: JSON.stringify({})
                //     })
                //     const user = await response.json();
                //     console.log(user.photo)
                //     console.log(user.folder)
                // }catch(error){
                //     console.log(error)
                // }
            }
            else {
                console.log('ERROR')
            }
        } catch (error) {
            console.log(error)
        }
    } else {
        console.log('code does not exists')
    }
}