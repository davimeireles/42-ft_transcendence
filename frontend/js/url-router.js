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
    two_fa_verification: "/2fa-verification.html",
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
      case "localgame":
        renderPongGame();
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
