function UsernameForm() {
    const token = localStorage.getItem("access_token")
    if (!token)
    {
        console.log("Token not found !")
        return ;
    }
  const usernameForm = document.getElementById("usernameForm");
    console.log('teste')
  if (!usernameForm) {
    console.error("Form not found");
    return;
  }

  usernameForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    console.log("Form submitted");

    const username = document.getElementById("changeUsername").value;
    const session_user = JSON.parse(localStorage.getItem('sessionUser'))
    const data = { username: username, user: session_user.username};

    try {
      const response = await fetch("http://localhost:8000/change_username/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

        if (response.ok) {
            console.log("User Login Succesfully");
           localStorage.removeItem("sessionUser");
            try {
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
                const sessionUser = {username: user.username, 
                  email: user.email, nickiname: user.nickname, 
                  friends: user.friends, online: user.online}
                localStorage.setItem('sessionUser', JSON.stringify(sessionUser));
            } catch (error) {
                console.log("Error:", error);
            }
            renderPage("profile");
        } else {
            const result = await response.json();
            errorMessage.textContent = result.message;
            errorMessage.style.display = "block";
        }
    } catch (error) {
      console.log("Error:", error);
      errorMessage.textContent = "An error occurred. Please try again.";
      errorMessage.style.display = "block";
    }
  });
}


