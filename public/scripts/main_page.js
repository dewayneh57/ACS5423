/*
 *
 */
document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll(".tab-link");
  const contents = document.querySelectorAll(".tab-content");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active classes
      buttons.forEach((btn) => btn.classList.remove("active"));
      contents.forEach((content) => content.classList.remove("active"));

      // Add active class to clicked button and corresponding tab
      button.classList.add("active");
      const target = document.getElementById(
        button.getAttribute("data-tab") + "Container"
      );
      target.classList.add("active");
    });
  });

  loadCategories();
  loadNutrients();
  loadBrands();

  const category = document.getElementById("category");
  category.addEventListener("change", function () {
    const selectedCategory = this.value;
    if (selectedCategory) {
      loadFoodsByCategory(selectedCategory);
    }
  });

  const nutrient = document.getElementById("nutrient");
  nutrient.addEventListener("change", function () {
    const selectedNutrient = this.value;
    if (selectedNutrient) {
      loadFoodsByNutrient(selectedNutrient);
    }
  });

  const brand = document.getElementById("brand");
  brand.addEventListener("change", function () {
    const selectedBrand = this.value;
    if (selectedBrand) {
      loadFoodsByBrand(selectedBrand);
    }
  });

  const searchButton = document.getElementById("search");
  const keywordInput = document.getElementById("keyword");

  // Enable/disable button based on input
  keywordInput.addEventListener("input", () => {
    searchButton.disabled = keywordInput.value.trim() === "";
  });

  // Click event stays the same
  searchButton.addEventListener("click", () => {
    const keyword = keywordInput.value.trim();
    if (keyword) {
      loadFoodsByKeyword(keyword);
    }
  });
});

function loadCategories() {
  console.log("getting categories");
  fetch("/api/categories")
    .then((res) => res.json())
    .then((categories) => {
      const select = document.getElementById("category");

      categories.forEach((cat) => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
      });
    })
    .catch((err) => {
      console.error("Error loading categories:", err);
    });
}

function loadNutrients() {
  console.log("getting nutrients");
  fetch("/api/nutrients")
    .then((res) => res.json())
    .then((nutrients) => {
      const select = document.getElementById("nutrient");

      nutrients.forEach((nutrient) => {
        const option = document.createElement("option");
        option.value = nutrient;
        option.textContent = nutrient;
        select.appendChild(option);
      });
    })
    .catch((err) => {
      console.error("Error loading nutrients:", err);
    });
}

function loadBrands() {
  console.log("getting brands");
  fetch("/api/brands")
    .then((res) => res.json())
    .then((brands) => {
      const select = document.getElementById("brand");

      brands.forEach((brand) => {
        const option = document.createElement("option");
        option.value = brand;
        option.textContent = brand;
        select.appendChild(option);
      });
    })
    .catch((err) => {
      console.error("Error loading brands:", err);
    });
}

function loadFoodsByCategory(category) {
  console.log("Loading foods for category:", category);
  document.body.style.cursor = "wait";

  fetch(`/api/foods?category=${encodeURIComponent(category)}`)
    .then((res) => res.json())
    .then((foods) => {
      const list = document.getElementById("categoryContent");
      list.innerHTML = ""; // Clear existing content

      if (foods.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No foods found for this category.";
        list.appendChild(li);
        return;
      }

      foods.forEach((food) => {
        const li = document.createElement("li");
        li.textContent = food.description;
        li.style.cursor = "pointer";
        li.dataset.expanded = "false";
        li.addEventListener("click", () => toggleFoodDetails(li, food));
        list.appendChild(li);
      });
    })
    .catch((err) => {
      console.error("Error loading foods:", err);
    })
    .finally(() => {
      // Restore cursor
      document.body.style.cursor = "default";
    });
}

function loadFoodsByNutrient(nutrient) {
  console.log("Loading foods for nutrient:", nutrient);
  document.body.style.cursor = "wait";

  fetch(`/api/foods?nutrient=${encodeURIComponent(nutrient)}`)
    .then((res) => res.json())
    .then((foods) => {
      const list = document.getElementById("nutrientContent");
      list.innerHTML = ""; // Clear existing content

      if (foods.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No foods found for this category.";
        list.appendChild(li);
        return;
      }

      foods.forEach((food) => {
        const li = document.createElement("li");
        li.textContent = food.description;
        li.style.cursor = "pointer";
        li.dataset.expanded = "false";
        li.addEventListener("click", () => toggleFoodDetails(li, food));
        list.appendChild(li);
      });
    })
    .catch((err) => {
      console.error("Error loading foods:", err);
    })
    .finally(() => {
      // Restore cursor
      document.body.style.cursor = "default";
    });
}

function loadFoodsByBrand(brand) {
  console.log("Loading foods for brand:", brand);
  document.body.style.cursor = "wait";

  fetch(`/api/foods?brand=${encodeURIComponent(brand)}`)
    .then((res) => res.json())
    .then((foods) => {
      const list = document.getElementById("brandContent");
      list.innerHTML = ""; // Clear existing content

      if (foods.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No foods found for this category.";
        list.appendChild(li);
        return;
      }

      foods.forEach((food) => {
        const li = document.createElement("li");
        li.textContent = food.description;
        li.style.cursor = "pointer";
        li.dataset.expanded = "false";
        li.addEventListener("click", () => toggleFoodDetails(li, food));
        list.appendChild(li);
      });
    })
    .catch((err) => {
      console.error("Error loading foods:", err);
    })
    .finally(() => {
      // Restore cursor
      document.body.style.cursor = "default";
    });
}

function loadFoodsByKeyword(keyword) {
  console.log("Loading foods for keyword search:", keyword);
  document.body.style.cursor = "wait";

  fetch(`/api/foods?keyword=${encodeURIComponent(keyword)}`)
    .then((res) => res.json())
    .then((foods) => {
      const list = document.getElementById("keywordContent");
      list.innerHTML = ""; // Clear existing content

      if (foods.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No foods found for this category.";
        list.appendChild(li);
        return;
      }

      foods.forEach((food) => {
        const li = document.createElement("li");
        li.textContent = food.description;
        li.style.cursor = "pointer";
        li.dataset.expanded = "false";
        li.addEventListener("click", () => toggleFoodDetails(li, food));
        list.appendChild(li);
      });
    })
    .catch((err) => {
      console.error("Error loading foods:", err);
    })
    .finally(() => {
      // Restore cursor
      document.body.style.cursor = "default";
    });
}

function toggleFoodDetails(li, food) {
  const expanded = li.dataset.expanded === "true";

  if (expanded) {
    const detail = li.nextElementSibling;
    if (detail && detail.classList.contains("food-detail")) {
      detail.remove();
    }
    li.dataset.expanded = "false";
    return;
  }

  // Create the detail element
  const detail = document.createElement("div");
  detail.className = "food-detail";
  detail.innerHTML = `
    <strong>Brand:</strong> ${food.brandOwner}<br/>
    <strong>Ingredients:</strong> ${food.ingredients}<br/>
    <strong>Serving Size:</strong> ${food.servingSize} ${
    food.servingSizeUnit
  }<br/>
    <strong>Published:</strong> ${new Date(
      food.publicationDate
    ).toLocaleDateString()}
  `;

  // Insert after the clicked <li>
  li.insertAdjacentElement("afterend", detail);
  li.dataset.expanded = "true";
}
