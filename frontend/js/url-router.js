// Router state
const router = {
  currentPage: null,
  pages: {
    intro: "/intro.html",
    login: "/login.html",
    register: "/register.html",
    pongpage: "/pong-page.html",
    localgame: "/local-game.html",
    aigame: "/ai-game.html",
    game3d: "/3d-game.html",
    dash: "home.html",
    home: "/home.html",
    profile: "/profile.html",
    profiles: "/profiles.html",
    edit: "/edit-profile.html",
    chat: "/chat.html",
    enable_two_fa: "/enable-2fa.html",
    verify2FA: "/verify-2fa.html",
  },
};

// Page loader
async function renderPage(page) {
  console.log(`Attempting to render page: ${page}`);

  const accessToken = localStorage.getItem("access_token");

  const protectedPages = ["profile", "profiles", "edit"];

  if (!accessToken && protectedPages.includes(page)) {
    console.warn("Unauthorized access attempt. Redirecting to login...");
    window.location.href = "/login"; // Redirect to login page
    return;
  }

  if (router.currentPage === page) return;

  try {
    // Load the new page
    const mainContent = document.getElementById("main-content");
    const response = await fetch(router.pages[page]);
    const html = await response.text();
    mainContent.innerHTML = html;

    console.log(page);

    // Call the appropriate function based on the page
    switch (page) {
      case "register":
        RegisterFormListener();
        break;
      case "login":
        LoginFormListener();
        break;
      case "intro":
        createBouncingBallBackground();
        break;
      case "home":
        renderUser();
        break;
      case "profile":
        renderProfile();
        break;
      case "profiles":
        renderProfiles();
        break;
      case "edit":
        UsernameForm();
        break;
      case "chat":
        chat();
        break;
      case "game3d":
        initialize3DPong();
        break;
      case "enable_two_fa":
        enable2FA();
        break;
      case "verify2FA":
        verifyOTP();
        break;
      default:
        console.warn(`No specific function defined for page: ${page}`);
    }

    // Update history and current page
    history.pushState({ page: page }, "", `/${page}`);
    router.currentPage = page;
  } catch (error) {
    console.error("Error loading page:", error);
  }
}

// Handle browser back/forward
window.addEventListener("popstate", (e) => {
  if (e.state?.page) {
    renderPage(e.state.page);
    console.log(window.location.herf);
  }
});

// Load initial page
window.addEventListener("load", () => {
  const initialPage = window.location.pathname.slice(1) || "intro";
  renderPage(initialPage);
});

function loadGame(gameType) {
  const homeGames = document.getElementById("home-games");
  homeGames.innerHTML = ""; // Clear the current content

  if (gameType === "local") {
    homeGames.innerHTML = `
            <canvas id="board" style="width: 100%; height: 50%; border-top: 5px solid #b700ff; border-bottom: 5px solid #b700ff;"></canvas>
            <script>
                renderPongGame();
            </script>
        `;
    renderPongGame();
  } else if (gameType === "ai") {
    homeGames.innerHTML = `
        <div id="difficulty-overlay">
    <div class="difficulty-buttons">
        <h2 style="color: white;">Choose Difficulty</h2>
        <button onclick="startGame('easy')">Easy</button>
        <button onclick="startGame('medium')">Medium</button>
        <button onclick="startGame('hard')">Hard</button>
    </div>
</div>
    <canvas id="ai-board" style="width: 100%; height: 50%; border-top: 5px solid #b700ff; border-bottom: 5px solid #b700ff;"></canvas>
        `;
  } else if (gameType === "3d") {
    homeGames.innerHTML = `
    <canvas id="game3d-board"></canvas>
    <script>
        initialize3DPong();
    </script>
        `;
    initialize3DPong();
  }
}

function loadSelectedGame() {
    const selectElement = document.getElementById("game-select");
    const selectedGame = selectElement.value;
  
    loadGame(selectedGame);
}