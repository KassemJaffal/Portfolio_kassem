const searchInput = document.getElementById("portfolioSearch");
const portfolioGrid = document.getElementById("portfolioGrid");
const resultCount = document.getElementById("portfolioResultCount");
const emptyState = document.getElementById("portfolioEmptyState");
const chips = [...document.querySelectorAll(".chip")];
const faqTriggers = [...document.querySelectorAll(".faq-trigger")];
const progressBar = document.getElementById("scrollProgress");

let activeFilter = "all";

function updateScrollProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progressBar.style.width = `${progress}%`;
}

function normalize(text) {
  return text.trim().toLowerCase();
}

function filterPortfolio() {
  const term = normalize(searchInput.value);
  const cards = [...portfolioGrid.querySelectorAll(".portfolio-card")];

  let matches = 0;

  cards.forEach((card) => {
    const category = card.dataset.category;
    const haystack = normalize(card.dataset.search || "");
    const categoryMatch = activeFilter === "all" || category === activeFilter;
    const textMatch = term === "" || haystack.includes(term);
    const visible = categoryMatch && textMatch;

    card.classList.toggle("is-hidden", !visible);
    if (visible) {
      matches += 1;
    }
  });

  resultCount.textContent = `${matches} Projekt${matches === 1 ? "" : "e"} gefunden`;
  emptyState.hidden = matches !== 0;
}

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    activeFilter = chip.dataset.filter;
    chips.forEach((button) => button.classList.toggle("is-active", button === chip));
    filterPortfolio();
  });
});

searchInput.addEventListener("input", filterPortfolio);

faqTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const isOpen = trigger.getAttribute("aria-expanded") === "true";

    faqTriggers.forEach((button) => {
      button.setAttribute("aria-expanded", "false");
      button.nextElementSibling.hidden = true;
    });

    if (!isOpen) {
      trigger.setAttribute("aria-expanded", "true");
      trigger.nextElementSibling.hidden = false;
    }
  });
});

window.addEventListener("scroll", updateScrollProgress, { passive: true });

updateScrollProgress();
filterPortfolio();
