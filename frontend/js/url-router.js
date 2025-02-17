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
    home: "/home.html",
    profile: "/profile.html",
    profiles: "/profiles.html",
    edit: "/edit-profile.html"

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
    if (page === "register") {
        RegisterFormListener();
      } else if (page === "login") {
        LoginFormListener();
      } else if (page === "intro") {
        createBouncingBallBackground();
      } else if (page === "localgame") {
        renderPongGame();
      } else if (page === "aigame") {
        renderAIgame();
      } else if (page == "home"){
        renderUser();
      }else if (page == "profile"){
        renderProfile();
      }else if (page == "profiles"){
        renderProfiles();
      }else if (page == "edit"){
        UsernameForm();
      }
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

