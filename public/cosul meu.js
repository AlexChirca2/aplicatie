import { getCookie } from "./cookie_parser.js";
import { fetchSQLData, updateUser } from "./server.js";

const imgFolder = "../img";

document.addEventListener("DOMContentLoaded", async function () {
    const cartItemsContainer = document.getElementById("cart-items");
    const cart = getCookie("session").cart;

    if (cart.length > 0) {
        let queryString = "(";
        cart.forEach((cartProduct) => {
            queryString += `${cartProduct.id},`;
        });
        queryString = queryString.slice(0, -1);
        queryString += ")";

        const products = await fetchSQLData(
            `SELECT * FROM digital_dreams_db.products WHERE id IN ${queryString};`
        );

        products.forEach(async (product) => {
            const productElement = document.createElement("div");
            const quantity = cart.find(
                (cartProduct) => cartProduct.id == product.id
            ).quantity;

            const imgPath = imgFolder + product.image.split("img").pop();

            productElement.className = "cart-item";

            let img = document.createElement("img");
            img.src = imgPath;
            img.alt = product.name;
            img.style.width = "150px";
            img.style.height = "auto";
            productElement.appendChild(img);

            let p = document.createElement("p");
            p.textContent = product.name;
            productElement.appendChild(p);

            let input = document.createElement("input");
            input.type = "number";
            input.value = quantity;
            input.min = 1;
            input.className = "quantity-input";
            input.dataset.productId = product.id;
            productElement.appendChild(input);

            let button = document.createElement("button");
            button.textContent = "Șterge";
            button.onclick = async function () {
                cart.splice(
                    cart.findIndex(
                        (cartProduct) => cartProduct.id == product.id
                    ),
                    1
                );
                await updateUser({ cart: JSON.stringify(cart) });
                productElement.remove();
            };
            productElement.appendChild(button);

            cartItemsContainer.appendChild(productElement);
        });
    }

    // Adaugă listener pe schimbarea cantității
    cartItemsContainer.addEventListener("change", function (event) {
        if (event.target.classList.contains("quantity-input")) {
            const newQuantity = event.target.value;
            const productId = event.target.dataset.productId;

            cart.find((cartProduct) => cartProduct.id == productId).quantity =
                newQuantity;
            updateUser({ cart: JSON.stringify(cart) });
        }
    });
});
