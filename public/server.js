async function fetchToPromise(api) {
    return await new Promise(async (resolve, reject) => {
        fetch(api, {
            credentials: "include",
        }).then(async (response) => {
            if (response.ok == false) {
                reject(await response.json());
            } else {
                const text = await response.text();
                try {
                    resolve(JSON.parse(text));
                } catch {
                    resolve(text);
                }
            }
        });
    });
}

async function fetchSQLData(query) {
    const encodedQuery = encodeURIComponent(query);
    return await fetchToPromise(`/api/data?query=${encodedQuery}`);
}

async function logout() {
    return await fetchToPromise(`/api/logout`);
}

async function register(username, password) {
    return await fetchToPromise(
        `/api/register?username=${username}&password=${password}`
    );
}

async function login(username, password) {
    return await fetchToPromise(
        `/api/login?username=${username}&password=${password}`
    );
}

async function updateUser(data) {
    const apiVars =
        data.cart == null
            ? `favorites=${data.favorites}`
            : data.favorites == null
            ? `cart=${data.cart}`
            : `cart=${data.cart}&favorites=${data.favorites}`;
    return await fetchToPromise(`/api/updateUser?${apiVars}`);
}

async function autoLogin() {
    return await fetchToPromise(`/api/autoLogin`);
}

export { fetchSQLData, logout, register, login, updateUser, autoLogin };
