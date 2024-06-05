import { fetchSQLData } from "./server.js";

let results = [];

document
    .getElementById("searchBar")
    .addEventListener("input", async function (e) {
        var keyword = e.target.value.toLowerCase();

        if (keyword.length < 3) {
            results = [];
        } else {
            results = await fetchSQLData(
                `SELECT name,id FROM digital_dreams_db.products WHERE name LIKE '%${keyword}%' LIMIT 10;`
            );
        }

        var resultsDiv = document.getElementById("autocomplete-results");
        resultsDiv.innerHTML = "";
        results.forEach(function (result) {
            var div = document.createElement("div");
            div.textContent = result.name;
            div.addEventListener("mousedown", function () {
                window.location.href = "/p/" + result.id;
            });
            resultsDiv.appendChild(div);
        });

        resultsDiv.style.display = results.length > 0 ? "" : "none";
    });

document.getElementById("searchBar").addEventListener("blur", function () {
    var resultsDiv = document.getElementById("autocomplete-results");
    resultsDiv.style.display = "none";
});

document.getElementById("searchBar").addEventListener("focus", function () {
    var resultsDiv = document.getElementById("autocomplete-results");
    resultsDiv.style.display = results.length > 0 ? "" : "none";
});
