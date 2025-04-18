'use strict'

function RegisterFormListener() {
  let loginBtn = document.getElementById("login-btn");
  loginBtn.addEventListener("click", function(event) {renderPage("login");});
  const form = document.getElementById("registrationForm");
  if (!form) {
    console.error("Form not found");
    return;
  }

  const passwordField = document.getElementById("floatingPassword");
  const repeatPasswordField = document.getElementById("floatingRepeatPassword");
  const submitButton = form.querySelector("button[type='submit']");
  const errorMessage = document.createElement("div");

  errorMessage.style.color = "#FC1723";
  errorMessage.style.display = "none";
  errorMessage.textContent = "Passwords do not match.";
  repeatPasswordField.parentNode.appendChild(errorMessage);

  function validatePasswords() {
    if (repeatPasswordField.value !== passwordField.value) {
      errorMessage.style.display = "block";
      submitButton.disabled = true;
    } else {
      errorMessage.style.display = "none";
      submitButton.disabled = false;
    }
  }

  passwordField.addEventListener("input", validatePasswords);
  repeatPasswordField.addEventListener("input", validatePasswords);

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("floatingUsername").value;
    const email = document.getElementById("floatingInput").value;
    const password = document.getElementById("floatingPassword").value;
    const nickname = document.getElementById("floatingNickname").value;

    const data = {
      username: username,
      email: email,
      password: password,
      nickname: nickname,
    };

    try {
      const response = await fetch("http://localhost:8000/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("Registered Succesfully");
        renderPage("intro");
      } else {
        const result = await response.json();
        errorMessage.textContent = result.message;
        errorMessage.style.display = "block";
      }
    } catch (error) {
      console.error("Error:", error);
      errorMessage.textContent = "An error occurred. Please try again.";
      errorMessage.style.display = "block";
    }
  });
}
