import { getCookie } from "./cookie_parser.js";
import { autoLogin, logout } from "./server.js";

initialize();

async function initialize() {
    await autoLogin();

    const session = getCookie("session");

    if (session.user.username != "guest") {
        createUserConnectedUI(session.user.username);
    } else {
        createUserNotConnectedUI();
    }
}

function createUserConnectedUI(username) {
    var sibling = document.getElementById("cartButton");

    let usernameText = document.createElement("div");
    usernameText.id = "usernameText";
    usernameText.innerHTML = `<strong>${username}</strong>`;

    let logoutButton = document.createElement("button");
    logoutButton.id = "logoutButton";
    logoutButton.textContent = "Logout";
    logoutButton.onclick = async function () {
        await logout();
        logoutButton.remove();
        createUserNotConnectedUI();
    };

    sibling.insertAdjacentElement("afterend", usernameText);
    usernameText.insertAdjacentElement("afterend", logoutButton);
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
