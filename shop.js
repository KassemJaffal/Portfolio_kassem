const SHOP_STORAGE_KEY = "scf_demo_cart";

const SHOP_PRODUCTS = [
  {
    id: "home-jersey-26",
    title: "Home Jersey 26",
    price: 89,
    tag: "Matchday",
    category: "jersey",
    image: "../assets/product-jersey.jpg",
    alt: "Rotes Jersey als Produktfoto",
    description:
      "Hero-Produkt fuer eine Fanshop-Startseite. Starker visueller Fokus, klare Groessenwahl und direkte Kaufintention.",
    bullets: ["Kategorie: Trikot", "Groessenlogik S-XXL", "Bundle-faehig fuer Spieltage"]
  },
  {
    id: "matchday-scarf",
    title: "Matchday Scarf",
    price: 29,
    tag: "Fanwear",
    category: "accessories",
    image: "../assets/product-scarf.jpg",
    alt: "Schal als Beispielprodukt",
    description:
      "Emotionales Zusatzprodukt fuer Matchday-Aktionen und schnelle Impulskäufe im Fanshop.",
    bullets: ["Kategorie: Accessory", "Ideal fuer Aktionsflaechen", "Gut fuer Bundle-Angebote"]
  },
  {
    id: "stadium-runner",
    title: "Stadium Runner",
    price: 74,
    tag: "Lifestyle",
    category: "lifestyle",
    image: "../assets/product-sneaker.jpg",
    alt: "Sneaker als Lifestyle-Produkt",
    description:
      "Lifestyle-Produkt fuer Sortimentsbreite, Cross-Selling und Zielgruppen ausserhalb des klassischen Spieltags.",
    bullets: ["Kategorie: Lifestyle", "Cross-Sell tauglich", "Visuell stark fuer Social Assets"]
  },
  {
    id: "city-supporter-bag",
    title: "City Supporter Bag",
    price: 34,
    tag: "Daily",
    category: "accessories",
    image: "../assets/product-rack.jpg",
    alt: "Produktfoto von Kleidung und Stofftaschen",
    description:
      "Alltagsnahes Merch-Produkt fuer Fans, die Verein und Lifestyle verbinden wollen.",
    bullets: ["Kategorie: Tasche", "Gute Geschenkoption", "Klarer Nutzen im Alltag"]
  }
];

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(SHOP_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeCart(cart) {
  localStorage.setItem(SHOP_STORAGE_KEY, JSON.stringify(cart));
}

function getProduct(productId) {
  return SHOP_PRODUCTS.find((product) => product.id === productId);
}

function cartSubtotal(cart) {
  return cart.reduce((total, item) => {
    const product = getProduct(item.id);
    return product ? total + product.price * item.quantity : total;
  }, 0);
}

function formatCurrency(value) {
  return `${value.toFixed(2).replace(".", ",")} EUR`;
}

function addToCart(productId, quantity = 1) {
  const cart = readCart();
  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ id: productId, quantity });
  }

  writeCart(cart);
  renderCart();
  renderCheckout();
}

function changeQuantity(productId, delta) {
  const cart = readCart()
    .map((item) =>
      item.id === productId ? { ...item, quantity: item.quantity + delta } : item
    )
    .filter((item) => item.quantity > 0);

  writeCart(cart);
  renderCart();
  renderCheckout();
}

function openElement(element) {
  if (element) {
    element.hidden = false;
  }
}

function closeElement(element) {
  if (element) {
    element.hidden = true;
  }
}

function renderShopProducts() {
  const grid = document.getElementById("shopGrid");
  if (!grid) {
    return;
  }

  const search = document.getElementById("shopSearch");
  const chipButtons = [...document.querySelectorAll("[data-shop-filter]")];
  const emptyState = document.getElementById("shopEmptyState");
  let activeFilter = "all";

  function applyFilters() {
    const term = (search.value || "").trim().toLowerCase();
    let visible = 0;

    [...grid.children].forEach((card) => {
      const matchesFilter =
        activeFilter === "all" || card.dataset.category === activeFilter;
      const matchesSearch =
        term === "" || (card.dataset.search || "").toLowerCase().includes(term);
      const show = matchesFilter && matchesSearch;
      card.hidden = !show;
      if (show) {
        visible += 1;
      }
    });

    emptyState.hidden = visible !== 0;
  }

  grid.innerHTML = "";

  SHOP_PRODUCTS.forEach((product) => {
    const card = document.createElement("article");
    card.className = "shop-card";
    card.dataset.category = product.category;
    card.dataset.search = `${product.title} ${product.tag} ${product.description} ${product.category}`;
    card.innerHTML = `
      <img src="${product.image}" alt="${product.alt}" loading="lazy" />
      <span class="shop-card__tag">${product.tag}</span>
      <h3>${product.title}</h3>
      <p>${product.description}</p>
      <div class="shop-card__meta">
        <span class="shop-card__price">${formatCurrency(product.price)}</span>
        <span class="shop-toolbar__hint">${product.category}</span>
      </div>
      <div class="shop-card__actions">
        <button class="button button--card" type="button" data-details="${product.id}">Details</button>
        <button class="button button--primary" type="button" data-add="${product.id}">In den Warenkorb</button>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const detailId = target.dataset.details;
    if (detailId) {
      renderProductModal(detailId);
    }

    const addId = target.dataset.add;
    if (addId) {
      addToCart(addId, 1);
      openElement(document.getElementById("cartDrawerShell"));
    }
  });

  chipButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.shopFilter || "all";
      chipButtons.forEach((chip) => chip.classList.toggle("is-active", chip === button));
      applyFilters();
    });
  });

  search.addEventListener("input", applyFilters);
  applyFilters();
}

function renderProductModal(productId) {
  const product = getProduct(productId);
  const shell = document.getElementById("productModalShell");
  const container = document.getElementById("productModal");

  if (!product || !shell || !container) {
    return;
  }

  container.innerHTML = `
    <div class="product-modal__card">
      <img src="${product.image}" alt="${product.alt}" />
      <div class="product-modal__copy">
        <span class="shop-card__tag">${product.tag}</span>
        <h2>${product.title}</h2>
        <p class="project-copy">${product.description}</p>
        <div class="product-meta">
          ${product.bullets.map((item) => `<span class="product-chip">${item}</span>`).join("")}
        </div>
        <div class="qty-row">
          <button class="qty-button" type="button" id="qtyMinus">-</button>
          <strong id="qtyValue">1</strong>
          <button class="qty-button" type="button" id="qtyPlus">+</button>
        </div>
        <div class="button-row">
          <button class="button button--primary" type="button" id="modalAddToCart">In den Warenkorb</button>
          <button class="button button--ghost" type="button" id="closeProductModal">Schliessen</button>
        </div>
      </div>
    </div>
  `;

  openElement(shell);

  let quantity = 1;
  const qtyValue = document.getElementById("qtyValue");
  document.getElementById("qtyMinus").addEventListener("click", () => {
    quantity = Math.max(1, quantity - 1);
    qtyValue.textContent = String(quantity);
  });
  document.getElementById("qtyPlus").addEventListener("click", () => {
    quantity += 1;
    qtyValue.textContent = String(quantity);
  });
  document.getElementById("modalAddToCart").addEventListener("click", () => {
    addToCart(product.id, quantity);
    closeElement(shell);
    openElement(document.getElementById("cartDrawerShell"));
  });
  document.getElementById("closeProductModal").addEventListener("click", () => {
    closeElement(shell);
  });
}

function renderCart() {
  const badge = document.getElementById("cartBadge");
  const list = document.getElementById("cartList");
  const subtotal = document.getElementById("cartSubtotal");

  if (!badge || !list || !subtotal) {
    return;
  }

  const cart = readCart();
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  badge.textContent = String(totalQuantity);

  if (cart.length === 0) {
    list.innerHTML = `<p class="cart-empty">Der Warenkorb ist aktuell leer.</p>`;
    subtotal.textContent = formatCurrency(0);
    return;
  }

  list.innerHTML = cart
    .map((item) => {
      const product = getProduct(item.id);
      if (!product) {
        return "";
      }

      return `
        <article class="cart-item">
          <img src="${product.image}" alt="${product.alt}" />
          <div class="cart-item__copy">
            <strong>${product.title}</strong>
            <span>${formatCurrency(product.price)} x ${item.quantity}</span>
            <div class="button-row">
              <button class="button button--secondary" type="button" data-cart-change="${product.id}" data-delta="-1">-1</button>
              <button class="button button--secondary" type="button" data-cart-change="${product.id}" data-delta="1">+1</button>
            </div>
          </div>
          <strong>${formatCurrency(product.price * item.quantity)}</strong>
        </article>
      `;
    })
    .join("");

  subtotal.textContent = formatCurrency(cartSubtotal(cart));

  list.querySelectorAll("[data-cart-change]").forEach((button) => {
    button.addEventListener("click", () => {
      changeQuantity(button.dataset.cartChange, Number(button.dataset.delta));
    });
  });
}

function renderCheckout() {
  const list = document.getElementById("checkoutSummary");
  const total = document.getElementById("checkoutTotal");
  const stripeButton = document.getElementById("stripeCheckoutButton");
  const stripeHint = document.getElementById("stripeHint");

  if (!list || !total || !stripeButton || !stripeHint) {
    return;
  }

  const cart = readCart();
  if (cart.length === 0) {
    list.innerHTML = `<p class="cart-empty">Noch keine Produkte im Warenkorb. Gehe zur Shop-Demo und lege Beispielprodukte hinein.</p>`;
    total.textContent = formatCurrency(0);
  } else {
    list.innerHTML = cart
      .map((item) => {
        const product = getProduct(item.id);
        if (!product) {
          return "";
        }
        return `
          <div class="summary-line">
            <span>${product.title} x ${item.quantity}</span>
            <strong>${formatCurrency(product.price * item.quantity)}</strong>
          </div>
        `;
      })
      .join("");
    total.textContent = formatCurrency(cartSubtotal(cart));
  }

  const paymentLink = (window.SHOP_CONFIG && window.SHOP_CONFIG.stripePaymentLink) || "";
  const notice = (window.SHOP_CONFIG && window.SHOP_CONFIG.shopNotice) || "";

  if (paymentLink) {
    stripeButton.disabled = false;
    stripeButton.textContent = "Weiter zu Stripe Checkout";
    stripeHint.textContent =
      "Der Demo-Checkout ist vorbereitet und leitet jetzt auf einen echten Stripe Payment Link weiter.";
    stripeButton.onclick = () => {
      window.location.href = paymentLink;
    };
  } else {
    stripeButton.disabled = true;
    stripeButton.textContent = "Stripe-Link fehlt";
    stripeHint.textContent = notice;
    stripeButton.onclick = null;
  }
}

function bindOverlays() {
  const productModalShell = document.getElementById("productModalShell");
  const cartDrawerShell = document.getElementById("cartDrawerShell");
  const openCartButton = document.getElementById("openCart");
  const closeCartButton = document.getElementById("closeCart");

  if (openCartButton && cartDrawerShell) {
    openCartButton.addEventListener("click", () => openElement(cartDrawerShell));
  }

  if (closeCartButton && cartDrawerShell) {
    closeCartButton.addEventListener("click", () => closeElement(cartDrawerShell));
  }

  [productModalShell, cartDrawerShell].forEach((shell) => {
    if (!shell) {
      return;
    }
    shell.addEventListener("click", (event) => {
      if (event.target === shell) {
        closeElement(shell);
      }
    });
  });
}

function initShop() {
  renderShopProducts();
  renderCart();
  renderCheckout();
  bindOverlays();
}

initShop();
