'use strict'

// Router state

const router = {
  currentPage: null,
  pages: {
    intro: "/intro.html",
    login: "/login.html",
    register: "/register.html",
    pongpage: "/pong-page.html",
    home: "/home.html",
    profile: "/profile.html",
    profiles: "/profiles.html",
    edit: "/edit-profile.html",
    chat: "/chat.html",
    enable2FA: "/enable-2fa.html",
    verify2FA: "/verify-2fa.html",
    tournament: "/tournament.html"
  },
};

// Page loader
async function renderPage(page, shouldPushState = true) {

  const accessToken = localStorage.getItem("access_token");

  const protectedPages = ["profile", "profiles", "edit", "tournament"];
  const initialPages = ["intro", "register", "login"];

  if (!accessToken && protectedPages.includes(page)) {
    console.warn("Unauthorized access attempt. Redirecting to login...");
    window.location.href = "/login";
    return;
  }
  /* if (accessToken && initialPages.includes(page)) {
    window.location.href = "home";
    return ;
  } */

  if (router.currentPage === page && page != 'profiles') return;

  try {
    // Load the new page
    const mainContent = document.getElementById("main-content");
    const response = await fetch(router.pages[page]);
    const html = await response.text();
    mainContent.innerHTML = html;

    // Call the appropriate function based on the page
    switch (page) {
      case "register":
        RegisterFormListener();
        break;
      case "login":
        LoginFormListener();
        break;
      case "intro":
        introListener();
        break;
      case "home":
        renderUser();
        break;
      case "profile":
        renderProfile();
        getUserGameInfo();
        getMatchHistory(1);
        getTournamentHistory(1);
        break;
      case "profiles":
        renderProfiles();
        break;
      case "edit":
        UsernameForm();
        break;
      case "enable2FA":
        enable2FA();
        break;
      case "verify2FA":
        verifyOTP();
        break;
      case "tournament":
        renderTournament();
        break;
      default:
        console.warn(`No specific function defined for page: ${page}`);
    }

    // Update history and current page                 CHECK HERE
    if (shouldPushState) {
      history.pushState({ page: page }, "", `/${page}`);
    }

    router.currentPage = page;

  } catch (error) {
    console.error("Error loading page:", error);
  }
  
  const selectedLanguage = localStorage.getItem('selectedLanguage') || 'en';
  loadLanguage(selectedLanguage).then((translations) => {
    applyTranslations(translations);
  });
}

// Handle browser back/forward
window.addEventListener("popstate", (e) => {
  if (e.state?.page) {
    renderPage(e.state.page, false);
  }
});

// Load initial page
window.addEventListener("load", () => {
  const initialPage = window.location.pathname.slice(1) || "intro";
  if (!history.state) {
    history.replaceState({ page: initialPage }, "", `/${initialPage}`);
  }
  renderPage(initialPage, false);
});

function loadGame(gameType) {
  const homeGames = document.getElementById("home-games");
  homeGames.innerHTML = ""; 

  if (gameType === "local") {
    homeGames.innerHTML = `
            <canvas id="board" style="width: 100%; height: 100%; border-top: 5px solid #b700ff; border-bottom: 5px solid #b700ff;"></canvas>
            <script>
                renderPongGame();
            </script>
        `;
    renderPongGame();
  } else if (gameType === "ai") {
    homeGames.innerHTML = `
            <div class="game-container">
                <div id="difficulty-overlay" class="difficulty-overlay">
                <h2>Choose Difficulty</h2>
                <div class="difficulty-buttons">
                        <button onclick="startGame('easy')">Easy</button>
                        <button onclick="startGame('medium')">Medium</button>
                        <button onclick="startGame('hard')">Hard</button>
                    </div>
                </div>
                <canvas id="ai-board"></canvas>
            </div>
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