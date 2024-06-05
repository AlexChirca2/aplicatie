import { fetchSQLData } from "./server.js";

initialize();

async function initialize() {
    var parent = document.getElementById("category-container");

    const data = await fetchSQLData(
        "SELECT * FROM digital_dreams_db.categories;"
    );

    data.forEach((category) => {
        createCategory(parent, category.id, category.name, category.image);
    });
}

function createCategory(parent, category_id, category_name, image_path) {
    var categoryDiv = document.createElement("div");
    categoryDiv.className = "category";

    var img = document.createElement("img");
    img.src = image_path;
    img.alt = category_name;
    img.className = "product-image";
    categoryDiv.appendChild(img);

    var link = document.createElement("a");
    link.href = `./html/category.html?id=${category_id}&name=${category_name}`;
    link.className = "category-link";
    link.textContent = category_name;
    categoryDiv.appendChild(link);

    parent.appendChild(categoryDiv);
}
