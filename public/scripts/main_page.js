/*
 * Global values that are set up by the document being loaded.
 */
var buttons; // the buttons for the tabs.
var contents; // The contents pane for each tab.

var categorySelect; // The category select control.

var nutrientSelect; // The nutrient select control
var useCarb; // If carbs are included in the search filter
var useProtein; // If protein is included in the search filter
var useFat; // If fat is included in the search filter
var nutrientSearchBtn; // The nutrient search button

var brandSelect; // The brand selection list

var keywordInput;
var keywordSearchBtn; 

/* ***********************************************************************************************
 *
 * Connect all the controls after the document has been loaded.
 *
 *********************************************************************************************** */
document.addEventListener("DOMContentLoaded", function () {
  // Get the controls for the tab display
  buttons = document.querySelectorAll(".tab-link");
  contents = document.querySelectorAll(".tab-content");

  // Get the controls for the tageory tab.
  categorySelect = document.getElementById("categorySelect");

  // Get the inputs for the nutrients display filtering
  nutrientSelect = document.getElementById("nutrientSelect");
  useCarb = document.getElementById("useCarb");
  useProtein = document.getElementById("useProtein");
  useFat = document.getElementById("useFat");
  nutrientSearchBtn = document.getElementById("nutrientSearchBtn");

  // Get the inputs for the brand display filter criteria
  brandSelect = document.getElementById("brandSelect");

  // Get the controls for the keyword search filter criteria
  keywordSearchBtn = document.getElementById("keywordSearchBtn");
  keywordInput = document.getElementById("keywordInput");

  // Handle the tabs...
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

  categorySelect.addEventListener("change", getFoodsByCategory);
  nutrientSelect.addEventListener("change", updateNutrientSearchButtonState);
  useCarb.addEventListener("change", updateNutrientSearchButtonState);
  useProtein.addEventListener("change", updateNutrientSearchButtonState);
  useFat.addEventListener("change", updateNutrientSearchButtonState);
  nutrientSearchBtn.addEventListener("click", getFoodsByNutrients);
  brandSelect.addEventListener("change", getFoodsByBrand);
  keywordInput.addEventListener("input", updateKeywordSearchButtonState);
  keywordSearchBtn.addEventListener("click", getFoodsByKeyword);

  // Pre-fetch the contents for the selection lists...
  loadCategories();
  loadNutrients();
  loadBrands();
});

/* ***********************************************************************************************
 *
 * Handle the enabling/disabling of the buttons and other controls based on state changes 
 * 
 *********************************************************************************************** */

/**
 * Update the nutrient search button state
 */
function updateNutrientSearchButtonState() {
  const nutrientSelected = nutrientSelect.value !== "--select a nutrient--";
  const macroSelected = useCarb.checked || useProtein.checked || useFat.checked;

  // Enable if either the dropdown is selected or a checkbox is checked
  nutrientSearchBtn.disabled = !(nutrientSelected || macroSelected);
}

/**
 * Update the keyword search button state 
 */
function updateKeywordSearchButtonState() {
  keywordSearchBtn.disabled = keywordInput.value.trim() === "";
}

/* ***********************************************************************************************
 *
 * Pre-loading of the selection list controls from the server cache. 
 * 
 *********************************************************************************************** */

/*
 * This function is called during the document loaded event to call the server and retrieve the
 * list of categories to fill the select list.
 */
function loadCategories() {
  console.log("getting categories");
  fetch("/api/categories")
    .then((res) => res.json())
    .then((categories) => {
      categories.forEach((cat) => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
      });
    })
    .catch((err) => {
      console.error("Error loading categories:", err);
    });
}

/*
 * This function is called during document load to call the server to get the list of
 * nutrients to populate the nutrient selection.  This function also sets up the dual
 * sliders for the macro nutrients selection.
 */
function loadNutrients() {
  console.log("getting nutrients");
  fetch("/api/nutrients")
    .then((res) => res.json())
    .then((nutrients) => {
      nutrients.forEach((nutrient) => {
        const option = document.createElement("option");
        option.value = nutrient;
        option.textContent = nutrient;
        nutrientSelect.appendChild(option);
      });
    })
    .catch((err) => {
      console.error("Error loading nutrients:", err);
    });

  setupDualSliderSync("carbMin", "carbMinRange", "carbMax", "carbMaxRange");
  setupDualSliderSync(
    "proteinMin",
    "proteinMinRange",
    "proteinMax",
    "proteinMaxRange"
  );
  setupDualSliderSync("fatMin", "fatMinRange", "fatMax", "fatMaxRange");
}

/*
 * This function is called during the document load event handler to call the server
 * and obtain the list of brands in order to prepopulate the select list.
 */
function loadBrands() {
  console.log("getting brands");
  fetch("/api/brands")
    .then((res) => res.json())
    .then((brands) => {
      brands.forEach((brand) => {
        const option = document.createElement("option");
        option.value = brand;
        option.textContent = brand;
        brandSelect.appendChild(option);
      });
    })
    .catch((err) => {
      console.error("Error loading brands:", err);
    });
}

/* ***********************************************************************************************
 *
 * Process the selections and options from the user for each tab. 
 * 
 *********************************************************************************************** */

/*
 * This function is called whenever the user has selected a category from the selection
 * list.  It uses the selection to retrieve the foods from the server and display their
 * values.
 */
function getFoodsByCategory() {
  const selectedCategory = categorySelect.value;

  console.log("Loading foods for category:", selectedCategory);
  document.body.style.cursor = "wait";

  fetch(`/api/foods/categories?category=${encodeURIComponent(selectedCategory)}`)
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

/*
 * This function is called whenever the user has selected a nutrient from the selection
 * list.  It uses the selection and the macro-nutrient sliders to retrieve the foods
 * from the server and display their values.
 */
function getFoodsByNutrients() {
  const selectedNutrient = nutrientSelect.value;
  console.log("Loading foods for nutrient:", selectedNutrient);
  document.body.style.cursor = "wait";
  var queryParams = new URLSearchParams; 

  // If the user selected a nutrient, add it to the query params. 
  if (selectedNutrient && selectedNutrient !== "--select a nutrient--") {
    queryParams.append("nutrient", selectedNutrient);
  }
  // If the user selected carbohydrates slider, then add it to the query params 
  if (useCarb.checked) { 
    queryParams.append("carbMin", document.getElementById("carbMin").value); 
    queryParams.append("carbMax", document.getElementById("carbMax").value); 
  }
  // If the user selected proteins slider, then add it to the query params 
  if (useProtein.checked) { 
    queryParams.append("proteinMin", document.getElementById("proteinMin").value); 
    queryParams.append("proteinMax", document.getElementById("proteinMax").value); 
  }
  // If the user selected fats slider, then add it to the query params 
  if (useFat.checked) { 
    queryParams.append("fatMin", document.getElementById("fatMin").value); 
    queryParams.append("fatMax", document.getElementById("fatMax").value); 
  }

  console.log(`query foods by nutrients using filters: ${queryParams}`);

  fetch(`/api/foods/nutrients?${queryParams}`)
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

/*
 * This function is called whenever the user has selected a brand from the brands selection
 * list.  It uses the brand selected to call the server and retrieve the foods that are
 * marketted by that brand.
 */
function getFoodsByBrand() {
  const selectedBrand = brandSelect.value;
  console.log("Loading foods for brand:", selectedBrand);
  document.body.style.cursor = "wait";

  fetch(`/api/foods/brands?brand=${encodeURIComponent(selectedBrand)}`)
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

/**
 * This function is called to load foods from the server database based on a keyword
 * search.
 */
function getFoodsByKeyword() {
  const keyword = keywordInput.value.trim();
  console.log("Loading foods for keyword search:", keyword);
  document.body.style.cursor = "wait";

  fetch(`/api/foods/keywords?keyword=${encodeURIComponent(keyword)}`)
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

/* ***********************************************************************************************
 *
 * Handle the expansion and contraction of the food details area on each tab
 * 
 *********************************************************************************************** */

/**
 * This function is called from any of the tab displays whenever a user wants to obtain the
 * detailed information about a specific food.
 *
 * @param li The list item that was selected.  This is the entry in the content display that
 * corresponds to the food the user is interested in getting the detail about.
 * @param {object} food The food that were interested in.
 */
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

  let nutrientString = '';
  if (food.nutrients) { 
    nutrientString = '<br/><strong>Nutrients:</strong>'; 
    food.nutrients.forEach(entry => { 
      nutrientString += entry.nutrientName + " " + entry.amount + entry.nutrientUnit + ", "; 
    });
    nutrientString = nutrientString.slice(0, -2); 
  }

  // Create the detail element
  const detail = document.createElement("div");
  detail.className = "food-detail";
  detail.innerHTML = `
    <strong>Brand:</strong> ${food.brandOwner}<br/>
    <strong>Ingredients:</strong> ${food.ingredients}<br/>
    <strong>Serving Size:</strong> ${food.servingSize} ${food.servingSizeUnit}<br/>
    <strong>Published:</strong> ${new Date(food.publicationDate).toLocaleDateString()}
    ${nutrientString}
  `;



  // Insert after the clicked list item
  li.insertAdjacentElement("afterend", detail);
  li.dataset.expanded = "true";
}

/* ***********************************************************************************************
 *
 * Handle the "dual slider" composite controls used on the nutrient search tab (possibly with 
 * reuse on other tabs)
 * 
 *********************************************************************************************** */

/**
 * This function is used to manage a "dual slider" control.  This is a modification of the traditional
 * slider in that two sliders are overlapped on top of each other, one representing the minimum value, the
 * other the maximum value.  The minimum value is always 0-n, and max is always n-500.  The function
 * adjusts the sliders whenever any value changes, either the thumb(s) (min or max) are moved, or the
 * min/max values are changed, and ensures that min will never exceed max.
 *
 * @param minInputId The minimum input text control id that contains the numeric minimum value
 * @param maxInputId The maximum input text control id that contains the numberic maximum value
 * @param minRangeId The slider that represents the minimum input value.
 * @param maxRangeId The slider that represents the maximum input value.
 */
function setupDualSliderSync(minInputId, minRangeId, maxInputId, maxRangeId) {
  const minInput = document.getElementById(minInputId);
  const minRange = document.getElementById(minRangeId);
  const maxInput = document.getElementById(maxInputId);
  const maxRange = document.getElementById(maxRangeId);

  minRange.addEventListener("input", syncFromMinSlider);
  maxRange.addEventListener("input", syncFromMaxSlider);
  minInput.addEventListener("input", syncFromMinInput);
  maxInput.addEventListener("input", syncFromMaxInput);

  // Initially sync everything from the sliders.
  syncFromMinSlider();
  syncFromMaxSlider();

  /**
   * This function synchronizes the text fields and the slider based on changes to the min slider.
   */
  function syncFromMinSlider() {
    let minVal = parseInt(minRange.value);
    let maxVal = parseInt(maxRange.value);

    if (minVal > maxVal) minVal = maxVal;

    minInput.value = minVal;
    minRange.value = minVal;
  }

  /**
   * This function synchronizes the text fields and the slider based on changes to the max slider.
   */
  function syncFromMaxSlider() {
    let maxVal = parseInt(maxRange.value);
    let minVal = parseInt(minRange.value);

    if (maxVal < minVal) maxVal = minVal;

    maxInput.value = maxVal;
    maxRange.value = maxVal;
  }

  /**
   * This function synchronizes the sliders if the minimum input control changed.
   */
  function syncFromMinInput() {
    let minVal = parseInt(minInput.value);
    let maxVal = parseInt(maxInput.value);

    if (minVal > maxVal) minVal = maxVal;

    minRange.value = minVal;
    maxRange.value = maxVal;
    minInput.value = minVal;
    maxInput.value = maxVal;
  }

  /**
   * This function synchronizes the sliders if the maximum input control changed.
   */
  function syncFromMaxInput() {
    let minVal = parseInt(minInput.value);
    let maxVal = parseInt(maxInput.value);

    if (maxVal < minVal) maxVal = minVal;

    minRange.value = minVal;
    maxRange.value = maxVal;
    minInput.value = minVal;
    maxInput.value = maxVal;
  }
}
