function UsernameForm() {
    let home = document.getElementById("btn-home");
    home.addEventListener("click", function() {renderPage("home");});
    const token = localStorage.getItem("access_token");

    if (!token) {
        console.log("Token not found!");
        return;
    }

    const editProfileForm = document.getElementById("editProfileForm");
    if (!editProfileForm) {
        console.error("Form not found");
        return;
    }

    editProfileForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        console.log("Edit Profile Form submitted");

        const changeNickInput = document.getElementById("changeNick");
        const passwordInput = document.getElementById("Password");
        const repeatPasswordInput = document.getElementById("RepeatPassword");
        const myFileInput = document.getElementById("myFile");

        // Data object to hold changes
        const data = {};

        // Process Nickname Change
        if (changeNickInput && changeNickInput.value !== "") {
            data.nick = changeNickInput.value;
            const session_user = JSON.parse(localStorage.getItem('sessionUser'));
            data.user = session_user.username;

            try {
                const response = await fetch("http://localhost:8000/change_nick/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });

                if (response.ok) {
                    console.log("Nickname changed successfully");
                    // Update session user and render home page
                    await updateSessionUser(token); // Helper function to update session
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
        }

        // Process Password Change
        if (passwordInput && passwordInput.value !== "") {
            const password = passwordInput.value;
            const Repassword = repeatPasswordInput.value;
            const passwordMatchError = document.getElementById("passwordMatchError");


            if (password !== Repassword) {
                console.log('passwords do not match');
                passwordMatchError.textContent = "Passwords do not match.";
                passwordMatchError.style.display = "block";
                return; // Exit the function
            } else {
                passwordMatchError.style.display = "none";
                passwordMatchError.textContent = "";
            }

            const session_user = JSON.parse(localStorage.getItem('sessionUser'));
            const newdata = { password: password, user: session_user.username };

            try {
                const response = await fetch("http://localhost:8000/change_password/", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(newdata),
                });

                if (response.ok) {
                    console.log("Password changed successfully");
                    // Update session user and render home page
                    await updateSessionUser(token); // Helper function to update session
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
        }
        console.log()
        // Process Photo Upload
        if (myFileInput && myFileInput.files.length > 0) {
            const formData = new FormData();
            formData.append("file", myFileInput.files[0]);
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

                await updateSessionUser(token);

            } catch (error) {
                console.error("Error uploading file:", error);
            }
        }
        // Render the home page after all updates
        renderPage("home");
    });

    // Helper Function to Update Session User
    async function updateSessionUser(token) {
        localStorage.removeItem("sessionUser");
        try {
            const response = await fetch("http://localhost:8000/session_user/", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                }
            });
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
                photo: user.photo
            };
            localStorage.setItem('sessionUser', JSON.stringify(sessionUser));
        } catch (error) {
            console.log("Error:", error);
        }
    }
}