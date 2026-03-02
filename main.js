const searchInput = document.getElementById("portfolioSearch");
const portfolioGrid = document.getElementById("portfolioGrid");
const resultCount = document.getElementById("portfolioResultCount");
const emptyState = document.getElementById("portfolioEmptyState");
const chips = [...document.querySelectorAll(".chip")];
const faqTriggers = [...document.querySelectorAll(".faq-trigger")];
const progressBar = document.getElementById("scrollProgress");
const navLinks = [...document.querySelectorAll(".site-nav__link")];
const announcementText = document.getElementById("announcementText");

const announcements = [
  "Interaktive Shop-Demo, Portfolio-Suche und neue Projektseiten sind live.",
  "Lebenslauf als PDF, moderne Navigation und rechtliche Seiten sind integriert.",
  "KPI-Dashboard, Matchday-Funnel und Commerce-UX zeigen konkrete Arbeitsproben."
];

let activeFilter = "all";
let announcementIndex = 0;

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

function bindFilterChips() {
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      activeFilter = chip.dataset.filter;
      chips.forEach((button) => button.classList.toggle("is-active", button === chip));
      filterPortfolio();
    });
  });
}

function bindFaq() {
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
}

function bindKeyboardShortcuts() {
  window.addEventListener("keydown", (event) => {
    const typingTarget =
      event.target instanceof HTMLElement &&
      ["INPUT", "TEXTAREA"].includes(event.target.tagName);

    if (event.key === "/" && !typingTarget) {
      event.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
  });
}

function bindSectionHighlight() {
  const sections = [...document.querySelectorAll("[data-section]")];
  const targets = navLinks
    .map((link) => {
      const id = link.getAttribute("href");
      return { link, target: id ? document.querySelector(id) : null };
    })
    .filter((item) => item.target);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const currentId = `#${entry.target.id}`;
        targets.forEach(({ link }) => {
          link.classList.toggle("is-active", link.getAttribute("href") === currentId);
        });
      });
    },
    { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

function startAnnouncementRotation() {
  if (!announcementText) {
    return;
  }

  setInterval(() => {
    announcementIndex = (announcementIndex + 1) % announcements.length;
    announcementText.textContent = announcements[announcementIndex];
  }, 3200);
}

searchInput.addEventListener("input", filterPortfolio);
window.addEventListener("scroll", updateScrollProgress, { passive: true });

bindFilterChips();
bindFaq();
bindKeyboardShortcuts();
bindSectionHighlight();
startAnnouncementRotation();
updateScrollProgress();
filterPortfolio();
