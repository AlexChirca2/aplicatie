function getCookie(key) {
    let allCookies = decodeURIComponent(document.cookie).split(";");
    let cookie = allCookies.find((c) => c.includes(`${key}=`));

    if (cookie == null) return null;

    let json = cookie.replace(`${key}=`, "");

    return JSON.parse(json);
}

export { getCookie };
