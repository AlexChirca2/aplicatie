import { register } from "./server.js";

document
    .getElementById("registerForm")
    .addEventListener("submit", async function (event) {
        // Prevent the default form submission
        event.preventDefault();

        // Get form data
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const confirmPassword =
            document.getElementById("confirm-password").value;

        if (password != confirmPassword) {
            let error = document.getElementById("register-error");
            error.style.display = "block";
            return;
        }

        const user = await register(username, password);

        if (user != null) {
            window.location.href = "/index.html";
        }
    });
