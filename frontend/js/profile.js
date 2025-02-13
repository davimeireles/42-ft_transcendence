const render_user = async function(username){
    try{
        const response = await fetch(`http://localhost:8000/return_user/${username}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
        })
        const user = await response.json();
        const profile_container = document.getElementById("profile-container");
        if (profile_container){
            profile_container.innerHTML = `<h1>Welcome</h1><h4>${user.username}</h4>`
        }else{
            console.log('doesnt exist')
        }
    }catch(error){
        console.log(error)
    }
}