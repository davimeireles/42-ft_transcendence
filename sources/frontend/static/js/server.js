var pages = {
    'home' : 'Home Page',
    'login' : 'Login Page',
    'register' : 'Register Page'
};

function getPageContent(page) {
    
    var contentToReturn;

    switch(page) {

        case 'home':
            contentToReturn = pages.home;
            break;
        case 'login':
            contentToReturn = pages.login;
            break;
        case 'register':
            contentToReturn = pages.register;
            break;
        default:
            contentToReturn = pages.home;
            break;
    }
    document.getElementById('content').innerHTML = contentToReturn;
}