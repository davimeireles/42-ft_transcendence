
// const redi42  = async function(){
//     console.log('ola')
//     try{
//         const response = await fetch('http://localhost:8000/auth-42/', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({})
//         })
//         const res = await response.json();
//         window.location.replace(res.url)
//     }catch(error){
//         console.log(error)
//     }
// };

document.addEventListener("DOMContentLoaded", () => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");

    if (code) {
        console.log("🔍 Code detected in URL, calling redi42...");
        redi42();
    } else {
        console.log("🛑 No code in URL, waiting for authentication.");
    }
});

const redi42 = async function() {
    console.log("🚀 redi42 function started!");

    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");

    if (!code) {
        console.log("📡 Sending request to /auth-42/...");
        try {
            const response = await fetch('http://localhost:8000/auth-42/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({})
            });

            console.log("✅ Fetched auth-42, awaiting response...");
            const res = await response.json();
            console.log("Response from /auth-42/:", res);

            if (!res.url) {
                console.error("❌ No URL returned from /auth-42/");
                return;
            }

            console.log("🌍 Redirecting to:", res.url);
            window.location.replace(res.url);
        } catch (error) {
            console.error("❌ Error in authentication:", error);
        }
    } else {
        console.log("🔄 Fetching profile with code...");
        try {
            const profileResponse = await fetch(`http://localhost:8000/profile/?code=${code}`, {
                method: 'GET',
            });

            console.log("✅ Response received from /profile/");
            const status = await profileResponse.json();
            console.log("📜 Profile response JSON:", status);

            url.searchParams.delete("code");
            window.history.replaceState({}, document.title, url.toString());
            console.log("✅ Removed 'code' from URL");

            if (status.redirect) {
                console.log("🚀 Redirecting user to:", status.redirect);
                window.location.href = status.redirect;
            } else {
                console.warn("⚠️ No redirect URL found in response.");
            }
        } catch (error) {
            console.error("❌ Error fetching profile:", error);
        }
    }
};
