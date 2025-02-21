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
  const passwordForm = document.getElementById("passwordForm");
  if (!passwordForm) {
    console.error("Form not found");
    return;
  }
  const nickForm = document.getElementById('nickForm')
  if (!nickForm){
    console.log('form not found')
    return ;
  }
  nickForm.addEventListener("submit", async function (event){
    event.preventDefault();
    console.log("Form submitted");

    const nick = document.getElementById("changeNick").value;
    const session_user = JSON.parse(localStorage.getItem('sessionUser'))
    const data = { nick: nick, user: session_user.username};

    try {
      const response = await fetch("http://localhost:8000/change_nick/", {
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
                  friends: user.friends, online: user.online, photo: user.photo}
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
  })
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
                  friends: user.friends, online: user.online, photo: user.photo}
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
  document.getElementById("photoForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const photoForm = document.getElementById("myFile");
    const formData = new FormData();
    formData.append("file", photoForm.files[0]);

    try {
        const response = await fetch("http://localhost:8000/upload_photo/", {
            method: "POST",
            body: formData,
            headers: {
              "Authorization": `Bearer ${token}`,
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Profile picture updated:", data);
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
                  friends: user.friends, online: user.online, photo: user.photo}
                localStorage.setItem('sessionUser', JSON.stringify(sessionUser));
            } catch (error) {
                console.log("Error:", error);
            }
        // Update the image source dynamically
        const imageTag = document.getElementById("profileImage")
        if (imageTag)
          imageTag.src = `http://127.0.0.1:8000${data.file_url}`;

    } catch (error) {
        console.error("Error uploading file:", error);
    }
});
passwordForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  console.log("Form submitted");

  const password = document.getElementById("Password").value;
  const Repassword = document.getElementById("RepeatPassword").value;
  if (password !== Repassword){
    console.log('passwords do not match')
    return ;
  }
  const session_user = JSON.parse(localStorage.getItem('sessionUser'))
  const newdata = { password: password, user: session_user.username};

  try {
    const response = await fetch("http://localhost:8000/change_password/", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"  // Add this line
    },    
      body: JSON.stringify(newdata),
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
                friends: user.friends, online: user.online, photo: user.photo}
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

