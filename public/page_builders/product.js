import { fetchSQLData, updateUser } from "../server.js";
import { getCookie } from "../cookie_parser.js";

const imgFolder = "../img";

const product = getProduct();
initialize();

async function initialize() {
    addProductImage(product.image, product.name);
    addProductName(product.name);
    addProductData(product.price, product.stock);

    const specs = await fetchSQLData(
        `SELECT * FROM digital_dreams_db.specifications WHERE product_id = ${product.id};`
    );
    addSpecifications(specs);

    const warranties = await fetchSQLData(
        `SELECT * FROM digital_dreams_db.extra_warranty WHERE product_id = ${product.id};`
    );
    addExtraWarranties(warranties);

    addListeners();
}

function addListeners() {
    document
        .getElementById("add-to-cart-button")
        .addEventListener("click", addToCart);
    document
        .getElementById("add-to-favorites-button")
        .addEventListener("click", addToFavorites);
}

function getProduct() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    const id = urlParams.get("id");
    const name = urlParams.get("name");
    const price = urlParams.get("price");
    const image = urlParams.get("image");
    const stock = urlParams.get("stock");

    window.history.replaceState(null, name, `/p/${id}`);

    return { id: id, name: name, price: price, image: image, stock: stock };
}

function addProductImage(path, name) {
    let img = document.getElementById("product-image");

    const imgPath = imgFolder + path.split("img").pop();
    img.src = imgPath;
    img.alt = name;
}

function addProductName(name) {
    let title = document.getElementById("product-name");
    title.innerHTML = name;
}

function addProductData(price, stock) {
    let parent = document.getElementById("product-price");

    let priceElement = document.createElement("span");
    priceElement.className = "price";
    priceElement.innerHTML = `${price} lei`;
    parent.appendChild(priceElement);

    let stockElement = document.createElement("span");
    stockElement.className = "stock-status";
    stockElement.innerHTML = stock > 0 ? "în stoc" : "stoc epuizat";
    parent.appendChild(stockElement);

    if (stock > 0 && price > 500) {
        let deliveryElement = document.createElement("span");
        deliveryElement.className = "delivery-status";
        deliveryElement.innerHTML = "livrare gratuită";

        parent.appendChild(deliveryElement);
    }
}

function addSpecifications(specs) {
    let specsContainer = document.getElementById("specification-container");
    specs.forEach((spec) =>
        createSpecification(specsContainer, spec.type, spec.details)
    );
}

function createSpecification(parent, type, details) {
    let specDiv = document.createElement("div");
    specDiv.className = "specification";
    specDiv.innerHTML = `<strong>${type}:</strong> ${details}`;

    parent.appendChild(specDiv);
}

function addExtraWarranties(warranties) {
    let warrantyContainer = document.getElementById("extra-warranty");
    if (warranties == null || warranties.length == 0) {
        warrantyContainer.remove();
    } else {
        warranties.forEach((w) =>
            createWarranty(warrantyContainer, w.duration, w.price)
        );
    }
}

function createWarranty(parent, duration, price) {
    let warrantyLabel = document.createElement("label");
    parent.appendChild(warrantyLabel);

    let selector = document.createElement("input");
    selector.type = "radio";
    selector.name = "warranty";
    selector.value = price;

    warrantyLabel.appendChild(selector);

    let text = document.createElement("div");
    let parsedPrice = price.toFixed(2).toString().replace(".", ",");
    text.innerHTML = `${duration} an - ${parsedPrice} lei`;

    warrantyLabel.appendChild(text);
}

function addToCart() {
    const cart = getCookie("session").cart;
    const cartProduct = cart.find(
        (cartProduct) => cartProduct.id === product.id
    );
    if (cartProduct != null) {
        cartProduct.quantity++;
    } else {
        cart.push({ id: product.id, quantity: 1 });
    }

    updateUser({ cart: JSON.stringify(cart) });
}

function addToFavorites() {
    const favorites = getCookie("session").favorites;
    if (favorites.includes(product.id)) return;
    favorites.push(product.id);

    updateUser({ favorites: JSON.stringify(favorites) });
}
