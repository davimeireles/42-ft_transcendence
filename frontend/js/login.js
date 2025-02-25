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
        console.log("User logged in successfully");

        // Step 2: Check if 2FA is enabled
        const loginData = await loginResponse.json();
        const token = loginData.access_token;

        const check2FAResponse = await fetch("http://localhost:8000/check-2fa-status/", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (check2FAResponse.ok) {
          const check2FAData = await check2FAResponse.json();

          if (check2FAData.two_fa_enable) {
            // Step 3: Redirect to 2FA verification page
            renderPage('two_fa_verification');
          } else {
            // Step 4: Proceed to home page if 2FA is not enabled
            handleSuccessfulLogin(token);
          }
        } else {
          throw new Error("Failed to check 2FA status");
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

async function handleSuccessfulLogin(token) {
  // Fetch the access token and user details
  const tokenResponse = await fetch("http://localhost:8000/session_user/", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (tokenResponse.ok) {
    const user = await tokenResponse.json();
    const sessionUser = {
      username: user.username,
      email: user.email,
      nickname: user.nickname,
      friends: user.friends,
      online: user.online,
    };
    localStorage.setItem("sessionUser", JSON.stringify(sessionUser));
    renderPage("home");
  } else {
    throw new Error("Failed to fetch user details");
  }
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