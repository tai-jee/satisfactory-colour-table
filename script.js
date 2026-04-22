import { colours as coloursUnsorted } from "./colours/colours.js";

const ficsitTickURL =
  "https://satisfactory.wiki.gg/images/1/1d/FICSIT_Inc..png";

/**
 * We definitely don't need to re-fetch SVGs for every element.
 * We fetch is once and set it as global var. And we await so that
 * when we build the categories list promise is fulfilled.
 */
let checkmarkSvg;
await fetch("img/ficsit_checkmark.svg")
  .then((response) => response.text())
  .then((data) => {
    checkmarkSvg = data;
  });

let sfLogoSvg;
await fetch("img/sf_logo.svg")
  .then((response) => response.text())
  .then((data) => {
    sfLogoSvg = data;
  });

document
  .querySelectorAll(".sf-logo")
  .forEach((element) => (element.innerHTML = sfLogoSvg));

/**
 * We don't want to sort colours list on every loadResults().
 * Sorting once.
 */
const colours = coloursUnsorted.sort(compareByAlias);

const searchInput = document.getElementById("search-input");
const searchOptions = document.getElementById("search-options");

/**
 * Instead of creating new div for no results each time
 * we create it once and just toggle display mode.
 */
const noResultsMessage = document.createElement("div");
noResultsMessage.id = "no-results-message";
noResultsMessage.style.display = "none";
noResultsMessage.innerHTML =
  "<h4>No colours were found.</h4><p>Check your spelling and filters.</p>";

/**
 * For further convenience we build a map from
 * original list of the following structure:
 * {
 *     <category name>: [<color1>, <color2>, ...]
 * }
 *
 * Once we did that - we will have significantly easier life
 * with filtering the results and building categories list.
 */
let coloursByCategory = new Map();
colours.forEach((colour) => {
  colour.categories.forEach((category) => {
    if (!coloursByCategory.has(category)) {
      coloursByCategory.set(category, new Array());
    }
    coloursByCategory.set(
      category,
      coloursByCategory.get(category).concat(colour),
    );
  });
});

const categoriesListSorted = Array.from(coloursByCategory.keys()).sort();
categoriesListSorted.forEach((category, index) => {
  searchOptions.appendChild(buildCategorySelectorSection(category, index));
});

searchInput.addEventListener("input", (e) => {
  loadResults();
});

loadResults();

/**
 * Functions
 */

/**
 * Building element of this original design and structure with added unique id:
 * 	<div class="checkbox-container">
 * 		<span class="checkbox">
 * 			<span class="ficsit-checkmark"></span>
 * 		</span>
 * 		<label>Alien Items</label>
 * 	</div>
 */
function buildCategorySelectorSection(categoryName, idSuffix) {
  const containerDiv = document.createElement("div");
  containerDiv.classList.add("checkbox-container");
  containerDiv.id = `checkbox-container-${idSuffix}`;

  const checkboxSpan = document.createElement("span");
  /**
   *  Setting up unique ID for each checkbox so that we can
   *  assign event listeners and in general get element directly
   */
  checkboxSpan.classList.add("checkbox");
  /**
   * Adding/removing (toggling) class "checked" from the classlist on click
   */
  checkboxSpan.addEventListener("click", (event) => {
    document
      .getElementById(`checkbox-container-${idSuffix}`)
      .querySelector(".checkbox")
      .classList.toggle("checked");
    loadResults();
  });

  const checkmarkSpan = document.createElement("span");
  checkmarkSpan.classList = ["ficsit-checkmark"];
  checkmarkSpan.innerHTML = checkmarkSvg;

  const label = document.createElement("label");
  label.innerHTML = categoryName;

  checkboxSpan.appendChild(checkmarkSpan);
  containerDiv.appendChild(checkboxSpan);
  containerDiv.appendChild(label);

  return containerDiv;
}

/**
 * Building element of this original design and structure with added unique id:
 * <div class="colour-cell" style="background-color: rgb(180, 136, 101);"></div>
 * <div class="name-cell">
 * 	<span class="colour-name">Adaptive Control Unit</span>
 * 	<span class="colour-code">#b48865</span>
 * </div>
 */
function buildColorItem(colour) {
  const colourItem = document.createElement("div");
  colourItem.classList.add("colour-item");

  const colourCell = document.createElement("div");
  colourCell.classList.add("colour-cell");
  colourCell.style.backgroundColor = `#${colour.colour}`;

  const nameCell = document.createElement("div");
  nameCell.classList.add("name-cell");

  const colourName = document.createElement("span");
  colourName.classList.add("colour-name");
  colourName.innerHTML = `${colour.aliases[0]}`;

  const colourCode = document.createElement("span");
  colourCode.classList.add("colour-code");
  colourCode.innerHTML = `#${colour.colour}`;

  colourItem.appendChild(colourCell);
  colourItem.appendChild(nameCell);
  nameCell.appendChild(colourName);
  nameCell.appendChild(colourCode);

  colourItem.addEventListener("click", () => {
    const originalContent = colourName.innerHTML;
    navigator.clipboard.writeText(`#${colour.colour}`);
    colourName.innerText = "Copied!";
    setTimeout(() => {
      colourName.innerHTML = originalContent;
    }, 1000);
  });

  return colourItem;
}

function compareByAlias(a, b) {
  return a.aliases[0].localeCompare(b.aliases[0]);
}

function loadResults() {
  const results = document.getElementById("results");
  results.innerHTML = "";
  results.appendChild(noResultsMessage);

  let selectedCategories = [];
  for (const checkboxContainer of searchOptions.getElementsByClassName(
    "checkbox-container",
  )) {
    if (
      checkboxContainer.querySelector(".checkbox").classList.contains("checked")
    ) {
      selectedCategories.push(
        checkboxContainer.querySelector("label").innerText,
      );
    }
  }

  /**
   * The search logic is to search only through the selected categories.
   * So, before doing the search we reduce the list of colours.
   */
  let searchableColours = new Array();
  if (selectedCategories.length > 0) {
    let coloursSet = new Set();
    selectedCategories.forEach((category) => {
      coloursByCategory.get(category).forEach((colour) => {
        coloursSet.add(colour);
      });
    });
    searchableColours = Array.from(coloursSet);
  } else {
    searchableColours = colours;
  }

  const searchString = searchInput.value;

  let filteredResults = new Array();

  if (searchString === "") {
    filteredResults = searchableColours;
    searchInput.placeholder = `Search ${filteredResults.length} colours`;
  } else {
    filteredResults = searchableColours.filter((colour) => {
      return colour.aliases.some((alias) => {
        return alias.toLowerCase().includes(searchString.toLowerCase());
      });
    });
  }

  filteredResults.sort(compareByAlias);

  if (filteredResults.length > 0) {
    noResultsMessage.style.display = "none";
    filteredResults.forEach((colour) => {
      results.appendChild(buildColorItem(colour));
    });
  } else {
    noResultsMessage.style.display = "block";
  }
}
