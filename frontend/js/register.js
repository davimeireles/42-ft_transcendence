console.log('Loaded register.js');
function RegisterFormListener() {
    const form = document.getElementById("registrationForm");
    if (!form) {
      console.error("Form not found");
      return;
    }
  
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      console.log("Form submitted");
  
      const username = document.getElementById("floatingUsername").value;
      const email = document.getElementById("floatingInput").value;
      const password = document.getElementById("floatingPassword").value;
      const repeatPassword = document.getElementById(
        "floatingRepeatPassword"
      ).value;
      const nickname = document.getElementById("floatingNickname").value;
  
      const data = { username: username, email: email, password: password, nickname: nickname};
  
      try {
        const response = await fetch("http://localhost:8000/register/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
  
        if (response.ok) {
          console.log("User Registered Succesfully");
          renderPage("home");
        } else if (!response.ok && response.status == 429) {
            console.log("Error.");
        }
      } catch (error) {
        console.log("Error:", error);
      }
    });
  }