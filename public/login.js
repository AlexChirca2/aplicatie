import { login } from "./server.js";

document
    .getElementById("loginForm")
    .addEventListener("submit", async function (event) {
        // Prevent the default form submission
        event.preventDefault();

        // Get form data
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        try {
            await login(username, password);
            window.location.href = "/index.html";
        } catch (e) {
            let error = document.getElementById("login-error");
            error.style.display = "block";
            error.innerHTML = e.message;
        }
    });
