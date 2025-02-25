async function verifyOTP() {
    const form = document.getElementById("otpForm");
    const errorMessage = document.getElementById("otp-error-message");
  
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      const otp = document.getElementById("otp").value;
      const token = localStorage.getItem("access_token");
  
      try {
        const response = await fetch("http://localhost:8000/verify_2fa/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ otp: otp }),
        });
  
        if (response.ok) {
          renderPage("home");
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