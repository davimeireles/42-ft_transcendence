const urlPageTitle = "Transcendence"

document.addEventListener("click", (e) => {
    const {target} = e;
    if (!target.matches("button")) {
        return;
    }
    e.preventDefault();
    const route = target.getAttribute("data-route");
    urlRoute(route);
})

const urlRoutes = {
    "/": {
        template: "/sources/frontend/static/templates/index.html",
        title: "Home | " + urlPageTitle,
        description: "Home page"
    },
    "/login": {
        template: "/sources/frontend/static/templates/login.html",
        title: "Login | " + urlPageTitle,
        description: "Login page"
    },
    "/register": {
        template: "/sources/frontend/static/templates/register.html",
        title: "Register | " + urlPageTitle,
        description: "Register page"
    },
    "/verify_2fa": {
        template: "/sources/frontend/static/templates/verify_2fa.html",
        title: "2FA | " + urlPageTitle,
        description: "2FA page"
    }
}

const urlRoute = (route) => {
    window.history.pushState({}, "", route);
    urlLocationHandler();
}

const urlLocationHandler = async () => {
    let location = window.location.pathname;
    if (location.length == 0) {
        location = "/"
    }

    const route = urlRoutes[location] || urlRoutes["/"];
    const html = await fetch(route.template).then((response) => response.text());
    document.getElementById("content").innerHTML = html;
    document.title = route.title;
    document.querySelector('meta[name="description"]').setAttribute("content", route.description);
};

window.addEventListener('popstate', urlLocationHandler);
window.route = urlRoute;

urlLocationHandler();