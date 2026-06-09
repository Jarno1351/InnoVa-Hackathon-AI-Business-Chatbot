document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebarToggle");
  const mobileSidebarToggle = document.getElementById("mobileSidebarToggle");
  const shopMobileSidebarToggle = document.getElementById("shopMobileSidebarToggle");
  const sidebarBackdrop = document.getElementById("sidebarBackdrop");

  const chatView = document.getElementById("chatView");
  const shopView = document.getElementById("shopView");
  const chatNavButton = document.getElementById("chatNavButton");
  const shopNavButton = document.getElementById("shopNavButton");
  const newChatButton = document.getElementById("newChatButton");

  const hero = document.getElementById("hero");
  const chatArea = document.getElementById("chatArea");
  const chatForm = document.getElementById("chatForm");
  const messageInput = document.getElementById("messageInput");
  const chatHistoryList = document.getElementById("chatHistoryList");
  const historyCount = document.getElementById("historyCount");

  const settingsButton = document.getElementById("settingsButton");
  const settingsModal = document.getElementById("settingsModal");
  const closeSettingsModal = document.getElementById("closeSettingsModal");

  const shopGrid = document.getElementById("shopGrid");
  const shopSearchInput = document.getElementById("shopSearchInput");
  const shopCount = document.getElementById("shopCount");

  const recommendationDrawer = document.getElementById("recommendationDrawer");
  const recommendationContent = document.getElementById("recommendationContent");
  const drawerTitle = document.getElementById("drawerTitle");
  const closeRecommendationDrawerButton = document.getElementById("closeRecommendationDrawer");
  const drawerBackdrop = document.getElementById("drawerBackdrop");
  const recommendationReopenButton = document.getElementById("recommendationReopenButton");

  let chatHistory = [
    {
      title: "finding a keyboard",
      time: "2 hours ago",
      messages: [
        "where can i find an affordable keyboard?",
        "Here are registered shops that have keyboards. Open the recommendations panel to view supplier details."
      ]
    },
    {
      title: "finding a table",
      time: "2 hours ago",
      messages: ["I need a study table", "I can help you find local furniture shops."]
    },
    {
      title: "phone charger options",
      time: "Yesterday",
      messages: ["Where can I buy a type-c charger?", "I found gadget shops that may carry type-c chargers."]
    }
  ];

  const shops = [
    {
      id: 1,
      name: "KeyCraft Hub",
      description: "Premium peripherals, compact keyboards, and custom computer accessories.",
      category: "Computer Peripherals",
      match: "Mechanical keyboard match",
      rating: 4.9,
      reviews: 120,
      address: "Door 3, Valencia Tech Arcade, Poblacion, Valencia City, Bukidnon",
      availability: "Open now",
      icon: "▤",
      product: {
        name: "Affordable Mechanical Keyboard",
        description: "Compact 75% mechanical keyboard recommended for students, gaming, and typing. A strong match for users looking for an affordable keyboard from a verified local supplier.",
        price: "₱899",
        oldPrice: "₱1,099",
        rating: 4.9,
        reviews: 120,
        imageIcon: "▤",
        specs: ["Compact 75% mechanical layout", "Linear smooth red switches", "Customizable RGB backlight", "Detachable braided USB Type-C cable"],
        supplierContact: "Contact placeholder: 09XX-XXX-XXXX"
      }
    },
    {
      id: 2,
      name: "Campus Gadget Hub",
      description: "Budget-friendly gadgets, chargers, earphones, mice, and keyboards for students.",
      category: "Gadgets & Accessories",
      match: "Budget keyboard supplier",
      rating: 4.7,
      reviews: 86,
      address: "Ground Floor, Student Commercial Lane, Central Mindanao University, Maramag, Bukidnon",
      availability: "Available",
      icon: "▧",
      product: {
        name: "Student Budget Keyboard",
        description: "Entry-level keyboard for school work, online classes, and casual gaming. Recommended when the user needs a low-cost local option.",
        price: "₱550",
        oldPrice: "₱699",
        rating: 4.7,
        reviews: 86,
        imageIcon: "▧",
        specs: ["Full-size keyboard", "Quiet membrane keys", "USB wired connection", "Suitable for school and office tasks"],
        supplierContact: "Contact placeholder: campus-gadget@example.com"
      }
    },
    {
      id: 3,
      name: "TechZone Local",
      description: "Local electronics supplier selling computer accessories and mobile essentials.",
      category: "Electronics Store",
      match: "RGB gaming keyboard match",
      rating: 4.8,
      reviews: 104,
      address: "2nd Floor, Mercado Building, Sayre Highway, Valencia City, Bukidnon",
      availability: "In stock",
      icon: "⌘",
      product: {
        name: "RGB Gaming Keyboard",
        description: "Affordable RGB keyboard for gaming setups. Recommended for users asking for keyboard options with better visual style.",
        price: "₱750",
        oldPrice: "₱950",
        rating: 4.8,
        reviews: 104,
        imageIcon: "⌘",
        specs: ["RGB lighting modes", "Anti-ghosting support", "Durable plastic frame", "Wired USB connection"],
        supplierContact: "Contact placeholder: TechZone front desk"
      }
    },
    {
      id: 4,
      name: "Local Office Supply Co.",
      description: "Office and study essentials including tables, chairs, stationery, and basic devices.",
      category: "Office & School Supplies",
      match: "Basic office keyboard match",
      rating: 4.6,
      reviews: 72,
      address: "Unit 5, City Commercial Complex, Quezon Street, Valencia City, Bukidnon",
      availability: "Open until 8 PM",
      icon: "□",
      product: {
        name: "Basic Office Keyboard",
        description: "Simple office keyboard for typing, school work, and document tasks. Best for users who prioritize basic function over gaming features.",
        price: "₱420",
        oldPrice: "₱520",
        rating: 4.6,
        reviews: 72,
        imageIcon: "□",
        specs: ["Standard key layout", "Plug-and-play USB", "Lightweight build", "Good for office and school use"],
        supplierContact: "Contact placeholder: office-supply@example.com"
      }
    }
  ];

  let currentRecommendations = [];
  let activeDrawerRecommendations = [];
  let activeChatIndex = null;
  let openHistoryMenuIndex = null;
  let hasRecommendations = false;
  let isRecommendationDrawerOpen = false;
  let replyIndex = 0;

  const botReplies = [
    "I found registered shops that have keyboard options. I opened the recommendation panel with a compact supplier list.",
    "I found multiple registered suppliers that may match your request. Choose one from the right panel to view full product details and the exact address.",
    "Based on your query, these suppliers look relevant. Open a shop card to see the product, address, and contact option.",
    "In the full system, vector search would rank these suppliers based on product match, budget, address relevance, and availability."
  ];

  function getGoogleMapsUrl(address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }

  function shortenAddress(address, maxLength = 54) {
    if (!address || address.length <= maxLength) return address || "Address unavailable";
    return `${address.slice(0, maxLength).trim()}...`;
  }

  function renderAddressLink(address, className = "address-link", label = address) {
    return `
      <a class="${className}" href="${getGoogleMapsUrl(address)}" target="_blank" rel="noopener noreferrer" title="Open in Google Maps: ${address}">
        <span aria-hidden="true">⌖</span>
        <span>${label}</span>
      </a>
    `;
  }

  function toggleSidebar(forceOpen = null) {
    if (!sidebar) return;
    const shouldOpen = forceOpen === null ? !sidebar.classList.contains("expanded") : forceOpen;
    sidebar.classList.toggle("expanded", shouldOpen);
    sidebarToggle?.setAttribute("aria-expanded", String(shouldOpen));
    sidebarBackdrop?.classList.toggle("active", shouldOpen && window.innerWidth <= 760);
  }

  function setActiveSidebarItem(view) {
    chatNavButton?.classList.toggle("active", view === "chat");
    shopNavButton?.classList.toggle("active", view === "shop");
  }

  function showChatView() {
    chatView?.classList.add("active-view");
    shopView?.classList.remove("active-view");
    setActiveSidebarItem("chat");
    if (window.innerWidth <= 760) toggleSidebar(false);
  }

  function showShopView() {
    shopView?.classList.add("active-view");
    chatView?.classList.remove("active-view");
    setActiveSidebarItem("shop");
    renderShops();
    if (window.innerWidth <= 760) toggleSidebar(false);
  }

  function renderEmptyChatState() {
    if (!chatArea || !hero) return;
    chatArea.innerHTML = "";
    hero.classList.remove("hidden");
  }

  function closeChatHistoryMenus() {
    openHistoryMenuIndex = null;
    renderHistory();
  }

  function toggleChatHistoryMenu(index) {
    openHistoryMenuIndex = openHistoryMenuIndex === index ? null : index;
    renderHistory();
  }

  function setActiveChat(index) {
    const item = chatHistory[index];
    activeChatIndex = item ? index : null;
    renderHistory();
  }

  function renderHistory() {
    if (!chatHistoryList) return;

    if (!chatHistory.length) {
      chatHistoryList.innerHTML = `<div class="history-empty">No chat history yet</div>`;
      if (historyCount) historyCount.textContent = "0";
      return;
    }

    chatHistoryList.innerHTML = chatHistory.map((item, index) => `
      <div class="history-item-wrap ${activeChatIndex === index ? "active-chat" : ""}">
        <button class="history-item" type="button" data-history-index="${index}" aria-label="Open ${item.title}">
          <span class="history-text">
            <span class="history-title">${item.title}</span>
            <span class="history-time">${item.time}</span>
          </span>
        </button>
        <button class="history-menu-button" type="button" data-history-menu-index="${index}" aria-label="Chat options for ${item.title}">⋮</button>
        <div class="history-dropdown ${openHistoryMenuIndex === index ? "open" : ""}" data-history-dropdown="${index}">
          <button type="button" class="delete-history-button" data-delete-history-index="${index}">Delete Chat</button>
        </div>
      </div>
    `).join("");
    if (historyCount) historyCount.textContent = chatHistory.length;
  }

  function loadHistory(index) {
    const item = chatHistory[index];
    if (!item || !chatArea || !hero) return;
    showChatView();
    setActiveChat(index);
    openHistoryMenuIndex = null;
    chatArea.innerHTML = "";
    hero.classList.add("hidden");
    item.messages.forEach((message, messageIndex) => addMessage(message, messageIndex % 2 === 0 ? "user" : "bot"));
  }

  function deleteChatHistoryItem(index) {
    const item = chatHistory[index];
    if (!item) return;

    const shouldDelete = window.confirm(`Delete chat "${item.title}"?`);
    if (!shouldDelete) {
      closeChatHistoryMenus();
      return;
    }

    chatHistory.splice(index, 1);
    openHistoryMenuIndex = null;

    if (!chatHistory.length) {
      activeChatIndex = null;
      renderHistory();
      renderEmptyChatState();
      return;
    }

    if (activeChatIndex === index) {
      const nextIndex = Math.min(index, chatHistory.length - 1);
      loadHistory(nextIndex);
      return;
    }

    if (activeChatIndex !== null && activeChatIndex > index) {
      activeChatIndex -= 1;
    }

    renderHistory();
  }

  function renderShops(filteredShops = shops) {
    if (!shopGrid) return;
    if (shopCount) shopCount.textContent = `${filteredShops.length} shop${filteredShops.length === 1 ? "" : "s"}`;

    if (!filteredShops.length) {
      shopGrid.innerHTML = `<p class="empty-state">No shops found. Try searching another category or product.</p>`;
      return;
    }

    shopGrid.innerHTML = filteredShops.map(shop => `
      <article class="shop-card">
        <div class="shop-image" aria-hidden="true">${shop.icon}</div>
        <h3>${shop.name}</h3>
        <p class="shop-description">${shop.description}</p>
        <div class="shop-meta">
          <span class="meta-pill">${shop.category}</span>
          <span class="meta-pill">${shop.availability}</span>
        </div>
        <div class="shop-details-row">
          <span class="shop-rating"><span>★</span> ${shop.rating} (${shop.reviews})</span>
          ${renderAddressLink(shop.address, "address-link shop-address", shortenAddress(shop.address, 42))}
        </div>
        <button class="view-shop-button" type="button" data-shop-id="${shop.id}">Browse Products</button>
      </article>
    `).join("");
  }

  function getRecommendedShops(message = "") {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("cheap") || lowerMessage.includes("budget") || lowerMessage.includes("affordable")) {
      return [shops[1], shops[3], shops[2]];
    }

    if (lowerMessage.includes("mechanical") || lowerMessage.includes("gaming")) {
      return [shops[0], shops[2], shops[1]];
    }

    if (lowerMessage.includes("office") || lowerMessage.includes("school") || lowerMessage.includes("study")) {
      return [shops[3], shops[1], shops[0]];
    }

    return [shops[0], shops[1], shops[2]];
  }

  function renderRecommendationList(recommendations = activeDrawerRecommendations) {
    if (!recommendationContent) return;
    const visibleRecommendations = recommendations.filter(Boolean);
    if (drawerTitle) drawerTitle.textContent = "Recommended shops";

    if (!visibleRecommendations.length) {
      recommendationContent.innerHTML = `<p class="empty-state">No recommendations available yet.</p>`;
      return;
    }

    recommendationContent.innerHTML = `
      <div class="recommendation-summary">
        Nel-Jay found ${visibleRecommendations.length} local supplier${visibleRecommendations.length === 1 ? "" : "s"} that match your request. Select a shop to view the recommended product, exact address, and supplier details.
      </div>
      <div class="recommendation-list">
        ${visibleRecommendations.map(shop => `
          <article class="recommendation-card" data-recommendation-id="${shop.id}">
            <span class="recommendation-thumb" aria-hidden="true">${shop.icon}</span>
            <span class="recommendation-card-body">
              <h3>${shop.name}</h3>
              <p class="match-line">${shop.match}</p>
              <p class="one-line">${shop.description}</p>
              ${renderAddressLink(shop.address, "address-link compact-address", shortenAddress(shop.address, 46))}
              <span class="recommendation-footer">
                <span class="shop-rating"><span>★</span> ${shop.rating} (${shop.reviews})</span>
                <button class="view-details-chip view-recommendation-button" type="button" data-recommendation-id="${shop.id}">View Details</button>
              </span>
            </span>
          </article>
        `).join("")}
      </div>
    `;
  }

  function renderRecommendationDetails(shop) {
    if (!recommendationContent || !shop) return;
    const product = shop.product;
    if (drawerTitle) drawerTitle.textContent = "Product details";

    recommendationContent.innerHTML = `
      <div class="drawer-detail-top">
        <button class="drawer-back-button" id="backToRecommendationList" type="button" aria-label="Back to recommendations">‹</button>
        <span class="top-kicker">Back to recommended shops</span>
      </div>

      <div class="supplier-block">
        <p class="top-kicker">Verified Supplier</p>
        <h2>${shop.name}</h2>
        <p>${shop.description}</p>
        <div class="supplier-stats">
          <div class="supplier-stat supplier-address-stat">
            <span>Address</span>
            <strong>${renderAddressLink(shop.address, "address-link drawer-address", shop.address)}</strong>
          </div>
          <div class="supplier-stat"><span>Status</span><strong>${shop.availability}</strong></div>
          <div class="supplier-stat"><span>Trust</span><strong>★ ${shop.rating}</strong></div>
        </div>
      </div>

      <div class="product-preview" aria-hidden="true">${product.imageIcon}</div>

      <div class="drawer-product">
        <h3>${product.name}</h3>
        <p class="drawer-description">${product.description}</p>
        <div class="drawer-price">
          <span class="current-price">${product.price}</span>
          <span class="old-price">${product.oldPrice}</span>
        </div>
        <p class="shop-rating"><span>★</span> ${product.rating} (${product.reviews} Reviews)</p>
        <p class="top-kicker">Match Specifications</p>
        <ul class="spec-list">
          ${product.specs.map(spec => `<li>${spec}</li>`).join("")}
        </ul>
        <p class="drawer-description">${product.supplierContact}</p>
        <button class="contact-button" id="contactSupplierButton" type="button">Contact Supplier</button>
      </div>
    `;

    document.getElementById("backToRecommendationList")?.addEventListener("click", showRecommendationList);
    document.getElementById("contactSupplierButton")?.addEventListener("click", handleContactSupplier);
  }

  function showRecommendationList() {
    renderRecommendationList(activeDrawerRecommendations);
  }

  function showRecommendationDetails(shopId) {
    const shop = activeDrawerRecommendations.find(item => item.id === Number(shopId)) || shops.find(item => item.id === Number(shopId));
    if (shop) renderRecommendationDetails(shop);
  }

  function showRecommendationReopenButton() {
    if (recommendationReopenButton) recommendationReopenButton.hidden = false;
  }

  function hideRecommendationReopenButton() {
    if (recommendationReopenButton) recommendationReopenButton.hidden = true;
  }

  function updateRecommendationButtonVisibility() {
    if (hasRecommendations && !isRecommendationDrawerOpen) {
      showRecommendationReopenButton();
    } else {
      hideRecommendationReopenButton();
    }
  }

  function openRecommendationDrawer(recommendations = currentRecommendations, options = {}) {
    const { storeAsAiRecommendation = false } = options;
    const nextRecommendations = Array.isArray(recommendations) ? recommendations : [recommendations];
    activeDrawerRecommendations = nextRecommendations.filter(Boolean);

    if (storeAsAiRecommendation) {
      currentRecommendations = [...activeDrawerRecommendations];
      hasRecommendations = currentRecommendations.length > 0;
    }

    renderRecommendationList(activeDrawerRecommendations);
    recommendationDrawer?.classList.add("open");
    drawerBackdrop?.classList.add("open");
    recommendationDrawer?.setAttribute("aria-hidden", "false");
    isRecommendationDrawerOpen = true;
    updateRecommendationButtonVisibility();
  }

  function closeRecommendationDrawer() {
    recommendationDrawer?.classList.remove("open");
    drawerBackdrop?.classList.remove("open");
    recommendationDrawer?.setAttribute("aria-hidden", "true");
    isRecommendationDrawerOpen = false;
    updateRecommendationButtonVisibility();
  }

  function handleContactSupplier() {
    alert("Contact supplier action simulated. In the full system, this can open chat, call, email, or supplier contact details.");
  }

  function addMessage(text, sender) {
    if (!chatArea) return;
    const messageElement = document.createElement("div");
    messageElement.className = `message ${sender}`;
    messageElement.textContent = text;
    chatArea.appendChild(messageElement);
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  function showTypingThenReply(userMessage) {
    if (!chatArea) return;
    const typingElement = document.createElement("div");
    typingElement.className = "message bot";
    typingElement.textContent = "Nel-Jay is typing...";
    chatArea.appendChild(typingElement);
    chatArea.scrollTop = chatArea.scrollHeight;

    setTimeout(() => {
      typingElement.remove();
      addMessage(botReplies[replyIndex], "bot");
      replyIndex = (replyIndex + 1) % botReplies.length;
      openRecommendationDrawer(getRecommendedShops(userMessage), { storeAsAiRecommendation: true });
    }, 700);
  }

  function autoResizeTextarea() {
    if (!messageInput) return;
    messageInput.style.height = "auto";
    messageInput.style.height = `${messageInput.scrollHeight}px`;
  }

  sidebarToggle?.addEventListener("click", () => toggleSidebar());
  mobileSidebarToggle?.addEventListener("click", () => toggleSidebar(true));
  shopMobileSidebarToggle?.addEventListener("click", () => toggleSidebar(true));
  sidebarBackdrop?.addEventListener("click", () => toggleSidebar(false));
  chatNavButton?.addEventListener("click", showChatView);
  shopNavButton?.addEventListener("click", showShopView);

  newChatButton?.addEventListener("click", () => {
    showChatView();
    activeChatIndex = null;
    openHistoryMenuIndex = null;
    renderHistory();
    if (chatArea) chatArea.innerHTML = "";
    hero?.classList.remove("hidden");
    currentRecommendations = [];
    activeDrawerRecommendations = [];
    hasRecommendations = false;
    closeRecommendationDrawer();
    updateRecommendationButtonVisibility();
    if (messageInput) messageInput.value = "";
    chatForm?.classList.remove("has-text");
    autoResizeTextarea();
    messageInput?.focus();
  });

  messageInput?.addEventListener("input", () => {
    chatForm?.classList.toggle("has-text", messageInput.value.trim().length > 0);
    autoResizeTextarea();
  });

  messageInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      chatForm?.requestSubmit();
    }
  });

  chatForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = messageInput.value.trim();
    if (!message) return;

    hero?.classList.add("hidden");
    addMessage(message, "user");
    messageInput.value = "";
    chatForm.classList.remove("has-text");
    autoResizeTextarea();
    showTypingThenReply(message);
  });

  chatHistoryList?.addEventListener("click", (event) => {
    const menuButton = event.target.closest(".history-menu-button");
    if (menuButton) {
      event.stopPropagation();
      toggleChatHistoryMenu(Number(menuButton.dataset.historyMenuIndex));
      return;
    }

    const deleteButton = event.target.closest(".delete-history-button");
    if (deleteButton) {
      event.stopPropagation();
      deleteChatHistoryItem(Number(deleteButton.dataset.deleteHistoryIndex));
      return;
    }

    const historyButton = event.target.closest(".history-item");
    if (!historyButton) return;
    loadHistory(Number(historyButton.dataset.historyIndex));
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".history-item-wrap") && openHistoryMenuIndex !== null) {
      closeChatHistoryMenus();
    }
  });

  shopGrid?.addEventListener("click", (event) => {
    const button = event.target.closest(".view-shop-button");
    if (!button) return;
    const shop = shops.find(item => item.id === Number(button.dataset.shopId));
    if (shop) openRecommendationDrawer([shop]);
  });

  shopSearchInput?.addEventListener("input", () => {
    const query = shopSearchInput.value.trim().toLowerCase();
    const filtered = shops.filter(shop => {
      return [shop.name, shop.description, shop.category, shop.address, shop.availability, shop.product.name]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
    renderShops(filtered);
  });

  recommendationContent?.addEventListener("click", (event) => {
    const detailsButton = event.target.closest(".view-recommendation-button");
    if (!detailsButton) return;
    showRecommendationDetails(detailsButton.dataset.recommendationId);
  });

  settingsButton?.addEventListener("click", () => settingsModal?.classList.add("open"));
  closeSettingsModal?.addEventListener("click", () => settingsModal?.classList.remove("open"));
  settingsModal?.addEventListener("click", (event) => {
    if (event.target === settingsModal) settingsModal.classList.remove("open");
  });

  recommendationReopenButton?.addEventListener("click", () => {
    if (!hasRecommendations || !currentRecommendations.length) return;
    openRecommendationDrawer(currentRecommendations);
  });

  closeRecommendationDrawerButton?.addEventListener("click", closeRecommendationDrawer);
  drawerBackdrop?.addEventListener("click", closeRecommendationDrawer);

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    settingsModal?.classList.remove("open");
    closeChatHistoryMenus();
    closeRecommendationDrawer();
    if (window.innerWidth <= 760) toggleSidebar(false);
  });

  updateRecommendationButtonVisibility();
  renderHistory();
  renderShops();
});
