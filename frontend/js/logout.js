const logout = function (){
    localStorage.removeItem("sessionUser"); 
    renderPage('intro')
}