import { getCookie } from "./cookie_parser.js";

async function fetchSQLData(query) {
    const encodedQuery = encodeURIComponent(query);

    return fetch(`/api/data?query=${encodedQuery}`, {
        credentials: "include",
    })
        .then((response) => response.json())
        .then((data) => {
            return data;
        })
        .catch((error) => console.error("Error fetching data:", query, error));
}

async function logout() {
    await fetch(`/api/logout`, {
        credentials: "include",
    });
}

async function register(username, password) {
    try {
        await fetch(`/api/register?username=${username}&password=${password}`, {
            credentials: "include",
        });
        return null;
    } catch (e) {
        return e.message;
    }
}

async function login(username, password) {
    try {
        await fetch(`/api/login?username=${username}&password=${password}`, {
            credentials: "include",
        });
    } catch (e) {
        return e.message;
    }
}

async function updateUser(cart, favorites) {
    try {
        await fetch(`/api/updateUser?cart=${cart}&favorites=${favorites}`, {
            credentials: "include",
        });
    } catch (e) {
        return e.message;
    }
}

async function autoLogin() {
    await fetch(`/api/autoLogin`, {
        credentials: "include",
    });
}

export { fetchSQLData, logout, register, login, updateUser, autoLogin };
