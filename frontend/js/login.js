console.log("Loaded login.js");

function LoginFormListener() {
  const form = document.getElementById("loginForm");

  if (!form) {
    console.error("Form not found");
    return;
  }

  const passwordField = document.getElementById("password");
  const errorMessage = document.createElement("div");

  errorMessage.style.color = "red";
  errorMessage.style.display = "none";
  passwordField.parentNode.appendChild(errorMessage);

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    console.log("Form submitted");

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const data = { username: username, password: password };

    try {
      // Step 1: Perform login
      const loginResponse = await fetch("http://localhost:8000/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (loginResponse.ok) {
        console.log("User Login Succesfully");
        localStorage.removeItem("sessionUser");
        const result = await loginResponse.json();
        console.log(result.access_token);
        localStorage.setItem("access_token", result.access_token);
        localStorage.setItem("refresh_token", result.refresh_token);

        try {
          const token = localStorage.getItem("access_token");
          if (!token) {
            console.log("Token not found !");
            return;
          } else {
            const response = await fetch(
              "http://localhost:8000/session_user/",
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (!response.ok) {
              throw new Error("Failed to fetch user");
            }
            const user = await response.json();
            // console.log(user.access_token)
            console.log(user.photo);

            const sessionUser = {
              username: user.username,
              email: user.email,
              nickiname: user.nickname,
              friends: user.friends,
              online: user.online,
              photo: user.photo,
              two_fa_enable: user.two_fa_enable,
            };
            localStorage.setItem("sessionUser", JSON.stringify(sessionUser));
            if (sessionUser.two_fa_enable) {
              renderPage("verify2FA");
            } else {
              renderPage("home");
            }
          }
        } catch (error) {
          console.log("Error:", error);
        }
      } else {
        const result = await loginResponse.json();
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

function togglePasswordVisibility() {
  const passwordField = document.getElementById("password");
  const togglePasswordIcon = document.getElementById("togglePasswordIcon");

  if (passwordField.type === "password") {
    passwordField.type = "text";
    togglePasswordIcon.classList.remove("fa-eye");
    togglePasswordIcon.classList.add("fa-eye-slash");
  } else {
    passwordField.type = "password";
    togglePasswordIcon.classList.remove("fa-eye-slash");
    togglePasswordIcon.classList.add("fa-eye");
  }
}