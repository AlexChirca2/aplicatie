//#region Imports

import express from "express";
import http from "http";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import { dirname } from "path";

import { exec } from "child_process";
import { query } from "./sql_handler.js";
import session from "./session.js";

//#endregion

// Directory path for this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
        res.status(404).json({ message: "Category not found" });
        res.end();
        return;
    }

    res.redirect(
        `/html/category.html?id=${results[0].id}&name=${results[0].name}`
    );
});

// API endpoint to get prdoucts
app.get("/p/:id", async (req, res) => {
    const results = await query(
        "SELECT * FROM digital_dreams_db.products WHERE id = ?",
        [req.params.id]
    );

    if (results.length === 0) {
        res.status(404).json({ message: "Product not found" });
        res.end();
        return;
    }

    res.redirect(
        `/html/product.html?id=${results[0].id}&name=${results[0].name}&price=${results[0].price}&image=${results[0].image}&stock=${results[0].stock}`
    );
});

// API endpoint to get data from the database
app.get("*/api/data", async (req, res) => {
    const results = await query(req.query.query);
    res.json(results);
});

// API endpoint to get session
app.get("/api/autoLogin", async (req, res) => {
    await session.load(req);
    res.cookie("session", JSON.stringify(session));
    res.end();
});

// API endpoint to logout
app.get("/api/logout", (_, res) => {
    session.clear();
    res.cookie("session", JSON.stringify(session));
    res.end();
});

// API endpoint to register
app.get("/api/register", async (req, res) => {
    if (req.query.username == "guest") {
        res.status(400).json({ message: "User cannot be guest!" });
        res.end();
        return;
    }

    await session.load(req);

    const userData = await query(
        "SELECT * FROM digital_dreams_db.users WHERE username = ?",
        [req.query.username]
    );

    if (userData != null && userData[0] != null) {
        res.status(400).json({ message: "User already exists!" });
        res.end();
        return;
    }

    await query(
        "INSERT INTO `digital_dreams_db`.`users` (`username`, `password`, `sessions`,`favorites`,`cart`) VALUES (?, ?, ?, '[]', '[]');",
        [req.query.username, req.query.password, JSON.stringify([session.id])]
    );

    await session.connect({ username: req.query.username }, true);
    res.cookie("session", JSON.stringify(session));
    res.end();
});

// API endpoint to login
app.get("/api/login", async (req, res) => {
    await session.load(req);

    const results = await query(
        "SELECT * FROM digital_dreams_db.users WHERE username = ? AND password = ?",
        [req.query.username, req.query.password]
    );

    if (results.length === 0) {
        res.status(400).json({ message: "Invalid username or password!" });
        res.end();
        return;
    }

    await session.connect(results[0]);
    res.cookie("session", JSON.stringify(session));
    res.end();
});

// API endpoint to update user data
app.get("/api/updateUser", async (req, res) => {
    await session.load(req);
    await session.update({
        favorites: req.query.favorites,
        cart: req.query.cart,
    });

    res.cookie("session", JSON.stringify(session));
    res.end();
});

//#endregion
