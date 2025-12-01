import { colours } from "./colours/colours.js";

const ficsitTickURL =
	"https://satisfactory.wiki.gg/images/1/1d/FICSIT_Inc..png";

const checkboxes = document.querySelectorAll(".checkbox-container");
const searchInput = document.getElementById("search-input");

const ficsitCheckmarks = document.querySelectorAll(".ficsit-checkmark");
const sfLogos = document.querySelectorAll(".sf-logo");

checkboxes.forEach((checkbox) => {
	checkbox.addEventListener("click", (e) => {
		checkbox.getElementsByClassName("checkbox")[0].classList.toggle("checked");
		loadResults();
	});
});

searchInput.addEventListener("input", (e) => {
	loadResults();
});

ficsitCheckmarks.forEach((ficsitCheckmark) => {
	fetch("img/ficsit_checkmark.svg")
		.then((response) => response.text())
		.then((data) => {
			ficsitCheckmark.innerHTML = data;
		});
});

sfLogos.forEach((sfLogo) => {
	fetch("img/sf_logo.svg")
		.then((response) => response.text())
		.then((data) => {
			sfLogo.innerHTML = data;
		});
});

function loadResults() {
	const results = document.getElementById("results");

	results.innerHTML = "";

	const colourNames = colours.sort((a, b) =>
		a.aliases[0].localeCompare(b.aliases[0])
	);

	let selectedCategories = [];
	checkboxes.forEach((checkbox) => {
		if (
			checkbox
				.getElementsByClassName("checkbox")[0]
				.classList.contains("checked")
		) {
			selectedCategories.push(checkbox.querySelector("label").innerText);
		}
	});

	let resultNotEmpty = false;

	// add colours if any of their aliases match the contents of the search bar
	// and their category matches the selected checkbox(es)
	colours.forEach((colour) => {
		if (
			colour.aliases.some((alias) => {
				return searchInput.value === ""
					? true
					: alias.toLowerCase().includes(searchInput.value.toLowerCase());
			}) &&
			// add colours if at least one of their categories matches the selected checkbox(es)
			// or if no checkboxes are selected
			colour.categories.some((category) => {
				return selectedCategories.length === 0
					? true
					: selectedCategories.includes(category);
			})
		) {
			resultNotEmpty = true;
			const colourItem = document.createElement("div");
			colourItem.classList.add("colour-item");

			const colourChip = colourItem.appendChild(
				document.createElement("div")
			);
			colourChip.classList.add("colour-cell");
			colourChip.style.backgroundColor = "#" + colour.colour;

			const colourName = colourItem.appendChild(
				document.createElement("div")
			);
			colourName.classList.add("name-cell");
			colourName.innerHTML = `<span class="colour-name">${colour.aliases[0]}</span><span class="colour-code">#${colour.colour}</span>`;

			results.appendChild(colourItem);

			colourItem.addEventListener("click", () => {
				navigator.clipboard.writeText(`#${colour.colour}`);
				colourName.innerText = "Copied!";
				setTimeout(() => {
					colourName.innerHTML = `<span class="colour-name">${colour.aliases[0]}</span><span class="colour-code">#${colour.colour}</span>`;
				}, 1000);
			});
		}
	});

	if (!resultNotEmpty) {
		const noResultsMessage = document.createElement("div")
		noResultsMessage.innerHTML = "<h4>No colours were found.</h4><p>Check your spelling and filters.</p>";
		results.appendChild(noResultsMessage);
	}
};

loadResults();

searchInput.placeholder = `Search ${colours.length} colours`;
