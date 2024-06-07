//#region Imports

import express from "express";
import http from "http";
import * as crypto from "crypto";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import { dirname } from "path";

import { exec } from "child_process";
import { query } from "./sql_handler.js";

//#endregion

// Directory path for this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//#region Session id
let session = null;

function getSession(cookies) {
    let currentSession = getCookie(cookies, "session");

    if (currentSession == null || currentSession.id == null) {
        return generateSession();
    } else if (currentSession.username === "guest") {
        return currentSession;
    } else {
        // TODO: Implement session validation with async
        // db.query(
        //     "SELECT * FROM digital_dreams_db.users WHERE username = ?",
        //     [currentSession.username],
        //     (err, results) => {
        //         if (err) {
        //             console.error("Error executing query:", err);
        //             return generateSession(currentSession.id);
        //         }
        //         if (results.length === 0) {
        //             return generateSession(currentSession.id);
        //         }

        //         let sessions = JSON.parse(results[0].sessions);

        //         if (sessions == null) {
        //             return generateSession(currentSession.id);
        //         }

        //         let foundSession = sessions.find(
        //             (s) => s.id === currentSession.id
        //         );
        //         if (foundSession == null) {
        //             return generateSession(currentSession.id);
        //         }

        //         return currentSession;
        //     }
        // );

        return currentSession;
    }
}

function generateSession(currId = null) {
    if (currId == null) {
        currId = crypto.randomBytes(20).toString("hex");
    }
    const username = "guest";

    return {
        id: currId,
        username: username,
    };
}
//#endregion

//#region Server Side Code
const port = process.env.PORT;
const app = express();
const server = http.createServer(app);

// Start the server
server.listen(port, () => {
    console.log(`Application started on port ${port}`);
    console.log(`http://localhost:${port}\n`);
    var args = process.argv.slice(2);
    if (args[0] === "open") {
        exec(`open-cli http://localhost:${port}`);
    }
});

// Public folder to serve static files
app.use(express.static("public"));
app.use(cookieParser());

//#endregion

//#region API endpoints

// API endpoint to get static files
app.get("/", function (_, res) {
    res.sendFile("./index.html", { root: __dirname });
});

// API endpoint to get categories
app.get("/c/:name", async (req, res) => {
    const results = await query(
        "SELECT * FROM digital_dreams_db.categories WHERE name = ?",
        [req.params.name]
    );

    if (results.length === 0) {
        res.status(404).send("Category not found");
    } else {
        res.redirect(
            `/html/category.html?id=${results[0].id}&name=${results[0].name}`
        );
    }
});

// API endpoint to get prdoucts
app.get("/p/:id", async (req, res) => {
    const results = await query(
        "SELECT * FROM digital_dreams_db.products WHERE id = ?",
        [req.params.id]
    );

    if (results.length === 0) {
        res.status(404).send("Product not found");
        return;
    } else {
        res.redirect(
            `/html/product.html?id=${results[0].id}&name=${results[0].name}&price=${results[0].price}&image=${results[0].image}&stock=${results[0].stock}`
        );
    }
});

// API endpoint to get data from the database
app.get("*/api/data", async (req, res) => {
    const results = await query(req.query.query);
    res.json(results);
});

// API endpoint to logout
app.get("/api/logout", (req, res) => {
    if (session == null) {
        session = getSession(req.headers.cookie);
    }
    session.username = "guest";
    res.cookie("session", JSON.stringify(session));
    res.cookie("cart", JSON.stringify([]));
    res.cookie("favorites", JSON.stringify([]));
    res.send("");
});

// API endpoint to register
app.get("/api/register", async (req, res) => {
    await query(
        "INSERT INTO `digital_dreams_db`.`users` (`username`, `password`, `sessions`,`favorites`,`cart`) VALUES (?, ?, '[]', '[]', '[]');",
        [req.query.username, req.query.password]
    );

    if (session == null || session.id == null) {
        session = getSession(req.headers.cookie);
    }

    session.username = username;
    res.cookie("session", JSON.stringify(session));
    res.cookie("cart", JSON.stringify([]));
    res.cookie("favorites", JSON.stringify([]));
    res.json({ username: username });
});

// API endpoint to login
app.get("/api/login", async (req, res) => {
    const results = await query(
        "SELECT * FROM digital_dreams_db.users WHERE username = ? AND password = ?",
        [req.query.username, req.query.password]
    );

    if (results.length === 0) {
        res.status(401).send("Invalid username or password");
        return;
    }

    if (session == null) {
        session = getSession(req.headers.cookie);
        res.cookie("session", JSON.stringify(session));
    }

    let sessions = JSON.parse(results[0].sessions);
    if (sessions == null) {
        sessions = [];
    }

    //session.username = username;????

    sessions.push(session);

    await query(
        "UPDATE digital_dreams_db.users SET sessions = ? WHERE id = ?",
        [JSON.stringify(sessions), results[0].id]
    );

    ///res.cookie("session", JSON.stringify(session)); ????

    console.log(results[0].cart);
    console.log(results[0].favorites);

    let parsedCart = JSON.parse(results[0].cart);
    console.log(parsedCart);
    if (parsedCart.length > 0) {
        res.cookie("cart", results[0].cart);
    } else {
        let currentCart = getCookie(req.headers.cookie, "cart");
        if (currentCart != null && currentCart.length > 0) {
            await query(
                "UPDATE digital_dreams_db.users SET cart = ? WHERE username = ?",
                [JSON.stringify(currentCart), username]
            );
        }
    }

    let parsedFavorites = JSON.parse(results[0].favorites);
    console.log(parsedFavorites);
    if (parsedFavorites.length > 0) {
        res.cookie("favorites", results[0].favorites);
    } else {
        let currentFavorites = getCookie(req.headers.cookie, "favorites");
        if (currentFavorites != null && currentFavorites.length > 0) {
            await query(
                "UPDATE digital_dreams_db.users SET favorites = ? WHERE username = ?",
                [JSON.stringify(currentFavorites), username]
            );
        }
    }

    res.json({
        username: username,
        cart: JSON.parse(results[0].cart),
        favorites: JSON.parse(results[0].favorites),
    });
});

// API endpoint to update user data
app.get("/api/updateUser", async (req, res) => {
    if (session == null) {
        session = getSession(req.headers.cookie);
        res.cookie("session", JSON.stringify(session));
    }

    if (session.username === "guest") {
        return;
    }

    let favorites = JSON.parse(req.query.favorites) || [];
    let cart = JSON.parse(req.query.cart) || [];

    await query(
        "UPDATE digital_dreams_db.users SET favorites = ?, cart = ? WHERE username = ?",
        [JSON.stringify(favorites), JSON.stringify(cart), session.username]
    );

    res.json({ username: session.username });
});

// API endpoint to get session

app.get("/api/autoLogin", async (req, res) => {
    if (session == null) {
        session = getSession(req.headers.cookie);
        res.cookie("session", JSON.stringify(session));
    }

    if (session.username != "guest") {
        const results = await query(
            "SELECT * FROM digital_dreams_db.users WHERE username = ?",
            [session.username]
        );

        if (results.length === 0) {
            res.status(404).send("User not found");
        }

        if (results[0].cart.length > 0) {
            res.cookie("cart", results[0].cart);
        }

        if (results[0].favorites.length > 0) {
            res.cookie("favorites", results[0].favorites);
        }

        res.json({ username: session.username });
    } else {
        res.json({ username: session.username });
    }
});

//#endregion

//#region Cookies

function getCookie(cookies, key) {
    let allCookies = decodeURIComponent(cookies).split(";");
    let cookie = allCookies.find((c) => c.includes(`${key}=`));
    if (cookie == null) return null;

    let json = cookie.replace(`${key}=`, "");

    return JSON.parse(json);
}
//#endregion
