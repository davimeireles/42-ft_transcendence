'use strict'

function introListener() {
  let loginBtn = document.getElementById("login-btn");
  let registerBtn = document.getElementById("register-btn");
  loginBtn.addEventListener("click", function(event) {renderPage("login");});
  registerBtn.addEventListener("click", function(event) {renderPage("register");});
}