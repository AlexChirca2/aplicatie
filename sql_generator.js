import fs from "fs";
import { query } from "./sql_handler.js";

const endline = /(?:\r\n|\r|\n)/g;

const mySqlInitializeFile = "./mysql/app.sql";

const mySqlGenerationOrder = [
    "./mysql/categories.sql",
    "./mysql/products.sql",
    "./mysql/specifications.sql",
    "./mysql/extra_warranty.sql",
    "./mysql/options.sql",
];

async function generateDB() {
    await initializeDB();
    await populateDB();

    console.log("Initialized database");
    process.exit();
}

async function initializeDB() {
    await readToPromise(mySqlInitializeFile, async (data) => {
        const parsedData = data.replace(endline, "");
        const operations = parsedData.split(";");
        for (let op of operations) {
            const parsedQ = op + ";";
            if (parsedQ != ";") {
                await query(parsedQ);
            }
        }
    });
}

async function populateDB() {
    for (let sqlFile of mySqlGenerationOrder) {
        await readToPromise(sqlFile, async (data) => {
            const parsedData = data.split(endline);

            let realOperations = [];
            parsedData.forEach((line) => {
                const trimLine = line.trimStart();
                if (trimLine.length > 0) {
                    const checkString = trimLine.substring(0, 2);
                    if (checkString != "--") {
                        realOperations.push(trimLine);
                    }
                }
            });

            let operation = realOperations.join("");

            await query(operation);
        });
    }
}

async function readToPromise(file, callback) {
    await new Promise((resolve, _) => {
        fs.readFile(file, async (_, data) => {
            await callback(data.toString());
            resolve();
        });
    });
}

generateDB();
