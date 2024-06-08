import { getCookie } from "./cookie_parser.js";
import { fetchSQLData, updateUser } from "./server.js";

const imgFolder = "../img";
var totalValue = 0;

function updatePrice() {
    let subPrice = document.getElementById("subtotal-price");
    let totalPrice = document.getElementById("total-price");

    subPrice.textContent = totalValue + " lei";
    totalPrice.textContent = totalValue + " lei";
}

document.addEventListener("DOMContentLoaded", async function () {
    const cartItemsContainer = document.getElementById("cart-items");
    const cart = getCookie("session").user.cart;

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

            totalValue += product.price * quantity;

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

            let price = document.createElement("div");
            price.className = "product-price";
            price.innerHTML = product.price * quantity + " lei";

            let input = document.createElement("input");
            input.type = "number";
            input.value = quantity;
            input.min = 1;
            input.className = "quantity-input";
            input.dataset.productId = product.id;

            input.onchange = async function () {
                const cartProduct = cart.find(
                    (cartProduct) => cartProduct.id == product.id
                );
                const diff = input.value - cartProduct.quantity;
                cartProduct.quantity = input.value;
                price.innerHTML = product.price * input.value + " lei";

                await updateUser({ cart: JSON.stringify(cart) });
                totalValue += diff * product.price;
                updatePrice();
            };

            productElement.appendChild(input);

            const rightParent = document.createElement("div");
            rightParent.className = "price-parent";

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
                totalValue -= input.value * product.price;
                updatePrice();
                productElement.remove();
            };

            rightParent.appendChild(price);
            rightParent.appendChild(button);

            productElement.appendChild(rightParent);

            cartItemsContainer.appendChild(productElement);
        });

        updatePrice();
    }
});
