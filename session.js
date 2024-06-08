import * as crypto from "crypto";
import { query } from "./sql_handler.js";

class Session {
    id = crypto.randomBytes(20).toString("hex");
    user = {
        username: "guest",
        favorites: [],
        cart: [],
    };

    clear() {
        this.user = {
            username: "guest",
            favorites: [],
            cart: [],
        };
    }

    async load(req) {
        let allCookies = decodeURIComponent(req.headers.cookie).split(";");
        let cookie = allCookies.find((c) => c.includes("session="));

        // no cookie session
        if (cookie == null) {
            return;
        }

        const cookieSession = JSON.parse(cookie.replace("session=", ""));

        // no cookie session
        if (cookieSession == null) {
            return;
        }

        // wrong cookies
        if (
            cookieSession.id == null ||
            cookieSession.user == null ||
            cookieSession.user.username == null ||
            cookieSession.user.favorites == null ||
            cookieSession.user.cart == null
        ) {
            return;
        }

        // guest cookie session
        if (cookieSession.user.username == "guest") {
            this.id = cookieSession.id;
            this.user = cookieSession.user;
            return;
        }

        // unchanged session
        if (cookieSession.user.username == this.user.username) {
            this.id = cookieSession.id;
            this.user = cookieSession.user;
            return;
        }

        const data = await query(
            "SELECT * FROM digital_dreams_db.users WHERE username = ?",
            [cookieSession.user.username]
        );

        // no user in cookie session, defaulting to new session
        if (data == null || data[0] == null) {
            return;
        }

        const dataUser = data[0];

        const sessions = JSON.parse(dataUser.sessions);

        // fake cookie, ignore
        if (!sessions.includes(cookieSession.id)) {
            return;
        }

        //update session
        this.id = cookieSession.id;
        this.user = {
            username: cookieSession.user.username,
            favorites: JSON.parse(dataUser.favorites),
            cart: JSON.parse(dataUser.cart),
        };
    }

    async connect(userData, update = false) {
        const username = userData.username;
        const favorites = update
            ? this.user.favorites
            : userData.favorites != null
            ? JSON.parse(userData.favorites)
            : [];
        const cart = update
            ? this.user.cart
            : userData.cart != null
            ? JSON.parse(userData.cart)
            : [];
        const sessions =
            userData.sessions != null ? JSON.parse(userData.sessions) : [];

        if (!sessions.includes(this.id)) {
            update = true;
            sessions.push(this.id);
        }

        if (update) {
            await query(
                "UPDATE digital_dreams_db.users SET sessions = ?, favorites = ?, cart = ? WHERE username = ?",
                [
                    JSON.stringify(sessions),
                    JSON.stringify(favorites),
                    JSON.stringify(cart),
                    username,
                ]
            );
        }

        this.user.username = username;
        this.user.favorites = favorites;
        this.user.cart = cart;
    }

    async update(data) {
        const favorites =
            data.favorites != null
                ? JSON.parse(data.favorites)
                : this.user.favorites;
        const cart = data.cart != null ? JSON.parse(data.cart) : this.user.cart;

        if (this.user.username != "guest") {
            await query(
                "UPDATE digital_dreams_db.users SET favorites = ?, cart = ? WHERE username = ?",
                [
                    JSON.stringify(favorites),
                    JSON.stringify(cart),
                    this.user.username,
                ]
            );
        }

        this.user.favorites = favorites;
        this.user.cart = cart;
    }
}

const session = new Session();

export default session;
