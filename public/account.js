import { saveCookie } from "./cookie_parser.js";
import { autoLogin, logout } from "./server.js";

initialize();

async function initialize() {
    var user = await autoLogin();

    if (user != null && user.username != "guest") {
        createUserConnectedUI();
    } else {
        createUserNotConnectedUI();
    }
}

function createUserConnectedUI() {
    var sibling = document.getElementById("cartButton");

    let logoutButton = document.createElement("button");
    logoutButton.id = "logoutButton";
    logoutButton.textContent = "Logout";
    logoutButton.onclick = function () {
        logout();
        logoutButton.remove();
        createUserNotConnectedUI();
        saveCookie("cart", []);
        saveCookie("favorites", []);
    };

    sibling.insertAdjacentElement("afterend", logoutButton);
}

function createUserNotConnectedUI() {
    var sibling = document.getElementById("cartButton");

    let loginButton = document.createElement("button");
    loginButton.id = "loginButton";
    loginButton.textContent = "Login";
    loginButton.onclick = function () {
        window.location.href = "/html/login.html";
    };

    let registerButton = document.createElement("button");
    registerButton.id = "registerButton";
    registerButton.textContent = "Register";
    registerButton.onclick = function () {
        window.location.href = "/html/register.html";
    };

    sibling.insertAdjacentElement("afterend", loginButton);
    loginButton.insertAdjacentElement("afterend", registerButton);
}
