import { getCookie, saveCookie } from "./cookie_parser.js";
import { login } from "./server.js";

document
    .getElementById("loginForm")
    .addEventListener("submit", async function (event) {
        // Prevent the default form submission
        event.preventDefault();

        // Get form data
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        const user = await login(username, password);

        if (user != null) {
            saveCookie("cart", user.cart);
            saveCookie("favorites", user.favorites);
            window.location.href = "/index.html";
        } else {
            let error = document.getElementById("login-error");
            error.style.display = "block";
        }
    });
