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
      const target = document.getElementById(button.getAttribute("data-tab"));
      target.classList.add("active");
    });
  });

  loadCategories();

  const category = document.getElementById("category");
  category.addEventListener("change", function () {
    const selectedCategory = this.value;
    if (selectedCategory) {
      loadFoodsByCategory(selectedCategory);
    }
  });
});

function loadCategories() {
  console.log("getting categories");
  fetch("/api/categories") // or adjust path if needed
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

function loadFoodsByCategory(category) {
  console.log('Loading foods for category:', category);
  fetch(`/api/foods?category=${encodeURIComponent(category)}`)
    .then(res => res.json())
    .then(foods => {
      const list = document.getElementById('categoryContent');
      list.innerHTML = ''; // Clear existing content

      if (foods.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No foods found for this category.';
        list.appendChild(li);
        return;
      }

      foods.forEach(food => {
        const li = document.createElement('li');
        li.textContent = food.description;
        list.appendChild(li);
      });
    })
    .catch(err => {
      console.error('Error loading foods:', err);
    });
}
