'use strict'

function LoginFormListener() {
  let registerBtn = document.getElementById("register-btn");
  registerBtn.addEventListener("click", function(event) {renderPage("register");});
  const form = document.getElementById("loginForm");

  if (!form) {
    console.error("Form not found");
    return;
  }

  const errorMessage = document.getElementById("login-error-message");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

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
        localStorage.removeItem("sessionUser");
        const result = await loginResponse.json();
        localStorage.setItem("access_token", result.access_token);
        localStorage.setItem("refresh_token", result.refresh_token);

        try {
          const token = localStorage.getItem("access_token");
          if (!token) {
            console.error("Token not found !");
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
            const sessionUser = {
              userId: user.id,
              username: user.username,
              email: user.email,
              nickname: user.nickname,
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
          console.error("Error:", error);
        }
      } else {
        const result = await loginResponse.json();
        errorMessage.style.color = "#fc1723";
        errorMessage.textContent = result.message;
        errorMessage.style.display = "block";
      }
    } catch (error) {
      console.error("Error:", error);
      errorMessage.style.color = "#fc1723";
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