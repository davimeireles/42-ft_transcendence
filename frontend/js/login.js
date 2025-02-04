function LoginFormListener() {

    const form = document.getElementById("loginForm");

    if (!form) {
      console.error("Form not found");
      return;
    }
  
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      console.log("Form submitted");
  
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
  
      const data = { username: username, password: password};
  
      try {
        const response = await fetch("http://localhost:8000/login/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
  
        if (response.ok) {
          console.log("User Login Succesfully");
          renderPage("profile");
        } else if (!response.ok && response.status == 429) {
            console.log("Error.");
        }
      } catch (error) {
        console.log("Error:", error);
      }
    });

  }