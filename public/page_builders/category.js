import { fetchSQLData, updateUser } from "../server.js";
import { getCookie } from "../cookie_parser.js";
const imgFolder = "../img";

initialize();

async function initialize() {
    const category = getCategory();

    let products = await getProducts(category.id);
    let parent = document.getElementById("main-content");

    products.forEach((product) => {
        addProduct(parent, product);
    });
}

function getCategory() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    const id = urlParams.get("id");
    const name = urlParams.get("name");

    window.history.replaceState(null, name, `/c/${name}`);

    return { id: id, name: name };
}

async function getProducts(categoryId) {
    return fetchSQLData(
        `SELECT * FROM digital_dreams_db.products WHERE category_id = ${categoryId};`
    );
}

function addProduct(parent, product) {
    let productElement = document.createElement("div");
    productElement.classList.add("product");

    const imgPath = imgFolder + product.image.split("img").pop();

    let imageElement = document.createElement("img");
    imageElement.src = imgPath;
    imageElement.alt = product.name;
    imageElement.classList.add("product-image");

    let linkElement = document.createElement("a");
    linkElement.href = `/html/product.html?id=${product.id}&name=${product.name}&price=${product.price}&image=${product.image}&stock=${product.stock}`;
    linkElement.classList.add("product-link");
    linkElement.innerText = product.name;

    let priceElement = document.createElement("p");
    priceElement.classList.add("price");
    priceElement.innerText = product.price + " lei";

    let addToCartButton = document.createElement("button");
    addToCartButton.classList.add("add-to-cart-button");
    addToCartButton.dataset.productId = product.name;
    addToCartButton.innerText = "Adaugă în coș";
    addToCartButton.addEventListener("click", () => addToCart(product.id));

    let addToFavoriteButton = document.createElement("button");
    addToFavoriteButton.classList.add("add-to-favorite-button");
    addToFavoriteButton.dataset.productId = product.name;
    addToFavoriteButton.innerText = "Adaugă în lista de favorite";
    addToFavoriteButton.addEventListener("click", () =>
        addToFavorites(product.id)
    );

    productElement.appendChild(imageElement);
    productElement.appendChild(linkElement);
    productElement.appendChild(priceElement);
    productElement.appendChild(addToCartButton);
    productElement.appendChild(addToFavoriteButton);

    parent.appendChild(productElement);
}

function addToCart(productId) {
    const cart = getCookie("session").cart;
    const cartProduct = cart.find(
        (cartProduct) => cartProduct.id === productId
    );
    if (cartProduct != null) {
        cartProduct.quantity++;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }

    updateUser({ cart: JSON.stringify(cart) });
}

function addToFavorites(productId) {
    const favorites = getCookie("session").favorites;
    if (favorites.includes(productId)) return;
    favorites.push(productId);

    updateUser({ favorites: JSON.stringify(favorites) });
}
