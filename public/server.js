async function fetchSQLData(query) {
    const encodedQuery = encodeURIComponent(query);

    return fetch(`/api/data?query=${encodedQuery}`, {
        credentials: "include",
    })
        .then((response) => response.json())
        .then((data) => {
            return data;
        })
        .catch((error) => console.error("Error fetching data:", query));
}

function logout() {
    fetch(`/api/logout`, {
        credentials: "include",
    });
}

async function register(username, password) {
    return await fetch(
        `/api/register?username=${username}&password=${password}`,
        {
            credentials: "include",
        }
    )
        .then((response) => response.json())
        .then((data) => data)
        .catch((error) => console.error("Error registering:", error));
}

async function login(username, password) {
    return await fetch(`/api/login?username=${username}&password=${password}`, {
        credentials: "include",
    })
        .then((response) => response.json())
        .then((data) => data)
        .catch((_) => {
            return null;
        });
}

async function updateUser(cart, favorites) {
    return await fetch(`/api/updateUser?cart=${cart}&favorites=${favorites}`, {
        credentials: "include",
    })
        .then((response) => response.json())
        .then((data) => data)
        .catch((error) => console.error("Error updating user:", error));
}

async function autoLogin() {
    return await fetch(`/api/autoLogin`, {
        credentials: "include",
    })
        .then((response) => response.json())
        .then((data) => data)
        .catch((error) => console.error("Error auto logging in:", error));
}

export { fetchSQLData, logout, register, login, updateUser, autoLogin };
