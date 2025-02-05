
const redi42  = async function(){
    console.log('ola')
    try{
        const response = await fetch('http://localhost:8000/auth-42/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
        })
        const res = await response.json();
        window.location.replace(res.url)
    }catch(error){
        console.log(error)
    }
};

window.onload = async function(){
    console.log('aaaaa')
    const url = new URLSearchParams(window.location.search)
    const code = url.get('code')
    if (code){
        console.log(code)
        try{
            const response = await fetch('http://localhost:8000/profile/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({code: code})
            })
            const res = await response.json();
            window.location.replace(res)
        }catch(error){
            console.log(error)
        }
    }else{
        console.log('code does not exists')
    }
}