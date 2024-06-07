import mysql from "mysql";

// Create a connection to the database
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1358",
});
db.connect();

async function query(operation, parameters = []) {
    const result = new Promise((resolve, reject) => {
        db.query(operation, parameters, (err, results) => {
            if (err) {
                console.error(
                    "\nError executing query:\n" +
                        operation +
                        "\n\nWith parameters: " +
                        results +
                        "\n"
                );
                reject(err);
            } else {
                resolve(results);
            }
        });
    });

    return await result;
}

export { query };
