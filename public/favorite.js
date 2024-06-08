import { getCookie } from "./cookie_parser.js";
import { fetchSQLData, updateUser } from "./server.js";

const imgFolder = "../img";

document.addEventListener("DOMContentLoaded", async function () {
    const favoriteItemsContainer = document.getElementById("favorite-items");
    const favorites = getCookie("session").favorites;

    if (favorites.length > 0) {
        let queryString = "(";
        favorites.forEach((productId) => {
            queryString += `${productId},`;
        });
        queryString = queryString.slice(0, -1);
        queryString += ")";

        const products = await fetchSQLData(
            `SELECT * FROM digital_dreams_db.products WHERE id IN ${queryString};`
        );

        products.forEach(async (product) => {
            const productElement = document.createElement("div");
            productElement.className = "favorite-item";

            const imgPath = imgFolder + product.image.split("img").pop();

            let img = document.createElement("img");
            img.src = imgPath;
            img.alt = product.name;
            img.style.width = "150px";
            img.style.height = "auto";
            productElement.appendChild(img);

            let p = document.createElement("p");
            p.textContent = product.name;
            productElement.appendChild(p);

            let button = document.createElement("button");
            button.textContent = "Șterge";
            button.onclick = async function () {
                favorites.splice(
                    favorites.findIndex((productId) => productId == product.id),
                    1
                );

                await updateUser({ favorites: JSON.stringify(favorites) });
                productElement.remove();
            };
            productElement.appendChild(button);

            favoriteItemsContainer.appendChild(productElement);
        });
    }
});
