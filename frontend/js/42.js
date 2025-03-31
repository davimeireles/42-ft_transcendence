const redi42 = async function () {
  try {
    const response = await fetch("http://localhost:8000/auth-42/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    const res = await response.json();
    window.location.href = res.url;
  } catch (error) {
    console.error(error);
  }
};

window.onload = async function () {
  const url = new URLSearchParams(window.location.search);
  const code = url.get("code");
  if (code) {
    try {
      const response = await fetch("http://localhost:8000/oauth42/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });
      if (response.ok) {
        const res = await response.json();
        localStorage.removeItem("sessionUser");
        localStorage.setItem("access_token", res.access_token);
        localStorage.setItem("refresh_token", res.refresh_token);
        try {
          const token = localStorage.getItem("access_token");
          if (!token) {
            return;
          } else {
            const response_user = await fetch(
              "http://localhost:8000/session_user/",
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`, // Send token in headers
                },
              }
            );
            if (!response_user.ok) {
              throw new Error("Failed to fetch user");
            }
            const user = await response_user.json();
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
        const res = await response.json();
        console.error("ERROR");
      }
    } catch (error) {
      console.error(error);
    }
  } else {
    return;
  }
};
