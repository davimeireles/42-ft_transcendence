
// Router state
const router = {
    currentPage: null,
    pages: {
      home: "/intro.html",
      login: "/login.html",
      register: "/register.html",
      profile: "/profile.html",
    },
  };
  
  // Page loader
  async function renderPage(page) {
    console.log(`Attempting to render page: ${page}`);
    if (router.currentPage === page) return;
  
    try {
      // Load the new page
      const mainContent = document.getElementById("main-content");
      const response = await fetch(router.pages[page]);
      const html = await response.text();
      mainContent.innerHTML = html;
      
      console.log(page)
      if (page === "register")
        RegisterFormListener();
      else if (page == "login")
        LoginFormListener();

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
      console.log(window.location.herf)
    }
  });
  
  // Load initial page
  window.addEventListener("load", () => {
    const initialPage = window.location.pathname.slice(1) || "home";
    renderPage(initialPage);
  });