document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll(".tab-btn");
    const contentPanel = document.getElementById("tab-content-panel");
    const rootControlBar = document.getElementById("root-control-bar");
    const addBranchRootBtn = document.getElementById("add-branch-root-btn");
    const entryModal = document.getElementById("entry-modal");
    const entryForm = document.getElementById("entry-form");
    const modalTitle = document.getElementById("modal-title");
    const entryName = document.getElementById("entry-name");
    const entryLocation = document.getElementById("entry-location");
    const entryContact = document.getElementById("entry-contact");
    const entryStatus = document.getElementById("entry-status");
    const entryDetails = document.getElementById("entry-details");
    const entryPrice = document.getElementById("entry-price");
    const entryType = document.getElementById("entry-type");
    const entryBranchId = document.getElementById("entry-branch-id");
    const cancelEntryBtn = document.getElementById("cancel-entry-btn");
    const closeEntryBtn = document.getElementById("close-entry-btn");
    const branchFields = document.getElementById("branch-fields");
    const itemFields = document.getElementById("item-fields");
    const confirmationToast = document.getElementById("confirmation-toast");
    const toastMessage = document.getElementById("toast-message");
    const toastCloseBtn = document.getElementById("toast-close-btn");

    let currentTab = "branches";

    function formatPeso(amount) {
        if (amount == null) return "";
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            minimumFractionDigits: 2,
        }).format(amount);
    }

    function getStoredData(key) {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    }

    function setStoredData(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    async function loadData(type) {
        const cached = getStoredData(type);
        if (cached) return cached;

        const response = await fetch(`./data/${type}.json`);
        if (!response.ok) throw new Error(`Could not load ${type} data`);
        const data = await response.json();
        setStoredData(type, data);
        return data;
    }

    function generateId(prefix, existingItems) {
        let maxId = 0;
        existingItems.forEach(item => {
            const match = String(item.id).match(/(\d+)$/);
            if (match) {
                maxId = Math.max(maxId, Number(match[1]));
            }
        });
        return `${prefix}${maxId + 1}`;
    }

    function openEntryModal(type, branchId = "", branchName = "") {
        entryType.value = type;
        entryBranchId.value = branchId;
        entryForm.reset();

        if (type === "branches") {
            modalTitle.textContent = "Add New Branch";
            branchFields.classList.remove("hidden");
            itemFields.classList.add("hidden");
            entryLocation.required = true;
            entryContact.required = true;
            entryDetails.required = false;
            entryPrice.required = false;
        } else {
            modalTitle.textContent = `Add New ${type === "products" ? "Product" : "Service"}`;
            branchFields.classList.add("hidden");
            itemFields.classList.remove("hidden");
            entryLocation.required = false;
            entryContact.required = false;
            entryDetails.required = true;
            entryPrice.required = true;
        }

        entryModal.classList.remove("hidden");
        entryModal.setAttribute("aria-hidden", "false");
        entryName.focus();
    }

    function closeEntryModal() {
        entryModal.classList.add("hidden");
        entryModal.setAttribute("aria-hidden", "true");
    }

    function showConfirmation(message) {
        toastMessage.textContent = message;
        confirmationToast.classList.remove("hidden");
        confirmationToast.classList.add("success-outline");
        entryModal.classList.add("success-outline");
        clearTimeout(confirmationToast.hideTimeout);
        confirmationToast.hideTimeout = setTimeout(() => {
            confirmationToast.classList.add("hidden");
            confirmationToast.classList.remove("success-outline");
            entryModal.classList.remove("success-outline");
        }, 2500);
    }

    function hideConfirmation() {
        confirmationToast.classList.add("hidden");
        confirmationToast.classList.remove("success-outline");
        entryModal.classList.remove("success-outline");
    }

    toastCloseBtn.addEventListener("click", hideConfirmation);

    async function addBranch(branchData) {
        const branches = await loadData("branches");
        const newBranch = {
            id: generateId("b", branches),
            name: branchData.name,
            location: branchData.location,
            contact: branchData.contact,
            status: branchData.status,
            action: "SELECT"
        };
        branches.push(newBranch);
        setStoredData("branches", branches);
        if (currentTab === "branches") {
            renderStaticDirectory(branches);
        }
    }

    async function addProductOrService(type, itemData) {
        const items = await loadData(type);
        const newItem = {
            id: generateId(type === "products" ? "p" : "s", items),
            branchId: itemData.branchId,
            name: itemData.name,
            details: itemData.details,
            price: Number(itemData.price)
        };
        items.push(newItem);
        setStoredData(type, items);
        showConfirmation(`${type === "products" ? "Product" : "Service"} added successfully.`);
        if (currentTab === type) {
            await loadTabContent(type);
        }
    }

    async function deleteItem(type, itemId) {
        const items = await loadData(type);
        const filtered = items.filter(item => item.id !== itemId);
        setStoredData(type, filtered);
        showConfirmation(`${type === "products" ? "Product" : "Service"} deleted successfully.`);
    }

    entryForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const type = entryType.value;
        const branchId = entryBranchId.value;
        const name = entryName.value.trim();

        if (!name) return;

        if (type === "branches") {
            await addBranch({
                name,
                location: entryLocation.value.trim(),
                contact: entryContact.value.trim(),
                status: entryStatus.value
            });
        } else {
            await addProductOrService(type, {
                branchId,
                name,
                details: entryDetails.value.trim(),
                price: entryPrice.value.trim() || 0
            });
        }

        closeEntryModal();
    });

    cancelEntryBtn.addEventListener("click", closeEntryModal);
    closeEntryBtn.addEventListener("click", closeEntryModal);

    entryModal.addEventListener("click", (event) => {
        if (event.target === entryModal || event.target === document.querySelector(".modal-backdrop")) {
            closeEntryModal();
        }
    });

    // Async data fetch router
    async function loadTabContent(tabName) {
        currentTab = tabName;
        contentPanel.innerHTML = `<div class="loader">Fetching data from server storage...</div>`;
        
        // Show the root "Add Branch" button bar ONLY if we are on the branches tab
        if (tabName === "branches") {
            rootControlBar.style.display = "flex";
        } else {
            rootControlBar.style.display = "none";
        }

        try {
            const branches = await loadData("branches");
            if (tabName === "branches") {
                renderStaticDirectory(branches);
            } else {
                renderAccordionDirectory(branches, tabName);
            }
        } catch (error) {
            contentPanel.innerHTML = `
                <div class="loader" style="color: #ef4444;">
                    Error processing request: Could not load layout components.
                </div>`;
            console.error(error);
        }
    }

    // 1. RENDER STEP: Static, Non-Selectable view for the Branches Tab
    function renderStaticDirectory(branches) {
        if (branches.length === 0) {
            contentPanel.innerHTML = `<div class="loader">No tracking directory data found.</div>`;
            return;
        }

        let htmlMarkup = "";
        branches.forEach(branch => {
            const statusClass = branch.status.toLowerCase().replace(" ", "-");
            htmlMarkup += `
                <div class="row-card static-branch-row">
                    <div class="card-left">
                        <div class="card-icon-wrapper static-icon">
                            <i data-lucide="building-2"></i>
                        </div>
                        <div class="card-details">
                            <div class="info-title">${branch.name}</div>
                            <div class="info-sub">${branch.location}</div>
                            <div class="info-sub">${branch.contact}</div>
                        </div>
                    </div>
                    <div class="card-right-controls">
                        <span class="status-badge ${statusClass}">${branch.status}</span>
                        <button class="three-dot-menu" aria-label="Options Menu">
                            <i data-lucide="more-vertical"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        contentPanel.innerHTML = htmlMarkup;
        lucide.createIcons();
    }

    // 2. RENDER STEP: Interactive Accordion view for Products/Services Tabs
    function renderAccordionDirectory(branches, type) {
        if (branches.length === 0) {
            contentPanel.innerHTML = `<div class="loader">No tracking directory data found.</div>`;
            return;
        }

        let htmlMarkup = "";
        branches.forEach(branch => {
            const statusClass = branch.status.toLowerCase().replace(" ", "-");
            htmlMarkup += `
                <div class="accordion-group">
                    <div class="row-card clickable-branch-row" data-id="${branch.id}" data-name="${branch.name}">
                        <div class="card-left">
                            <div class="card-icon-wrapper">
                                <i data-lucide="building-2"></i>
                            </div>
                            <div class="card-details">
                                <div class="info-title">${branch.name}</div>
                                <div class="info-sub">${branch.location}</div>
                                <div class="info-sub">${branch.contact}</div>
                            </div>
                        </div>
                        <div class="card-right-controls">
                            <span class="status-badge ${statusClass}">${branch.status}</span>
                            <span class="action-link-text">VIEW ${type.toUpperCase()}</span>
                            <button class="chevron-toggle-btn" aria-label="Toggle Details">
                                <i data-lucide="chevron-down"></i>
                            </button>
                        </div>
                    </div>
                    <div class="dropdown-drawer" id="drawer-${branch.id}">
                        <div class="drawer-inner-content"></div>
                    </div>
                </div>
            `;
        });

        contentPanel.innerHTML = htmlMarkup;
        lucide.createIcons();
        attachAccordionListeners(type);
    }

    function attachAccordionListeners(type) {
        const branchRows = document.querySelectorAll(".clickable-branch-row");
        branchRows.forEach(row => {
            row.addEventListener("click", async () => {
                const branchId = row.getAttribute("data-id");
                const branchName = row.getAttribute("data-name");
                const drawer = document.getElementById(`drawer-${branchId}`);
                const innerContent = drawer.querySelector(".drawer-inner-content");
                const isExpanded = drawer.classList.contains("expanded");

                document.querySelectorAll(".dropdown-drawer.expanded").forEach(openDrawer => {
                    if (openDrawer !== drawer) {
                        openDrawer.classList.remove("expanded");
                        openDrawer.previousElementSibling.querySelector(".chevron-toggle-btn").style.transform = "rotate(0deg)";
                    }
                });

                if (isExpanded) {
                    drawer.classList.remove("expanded");
                    row.querySelector(".chevron-toggle-btn").style.transform = "rotate(0deg)";
                } else {
                    drawer.classList.add("expanded");
                    row.querySelector(".chevron-toggle-btn").style.transform = "rotate(180deg)";
                    innerContent.innerHTML = `<div class="loader">Loading ${type}...</div>`;
                    
                    try {
                        const allItems = await loadData(type);
                        const filteredItems = allItems.filter(item => item.branchId === branchId);
                        
                        renderDropdownItems(filteredItems, innerContent, type, branchId, branchName);
                    } catch (err) {
                        innerContent.innerHTML = `<div class="loader" style="color:#ef4444;">Failed to pull items.</div>`;
                    }
                }
            });
        });
    }

    // 3. RENDER STEP: Injects item cards AND the localized add button right inside the drawer
    function renderDropdownItems(items, container, type, branchId, branchName) {
        let htmlMarkup = "";
        let iconName = type === "products" ? "package" : "cpu";
        const itemLabel = type === "products" ? "Product" : "Service";

        htmlMarkup += `
            <div class="drawer-action-footer">
                <button class="inline-add-btn" data-branch-id="${branchId}" data-branch-name="${branchName}">
                    <i data-lucide="plus"></i> Add ${itemLabel} to ${branchName}
                </button>
            </div>
        `;

        if (items.length === 0) {
            htmlMarkup += `<div class="no-items-message">No ${type} available at this branch.</div>`;
        } else {
            items.forEach(item => {
                const priceMarkup = item.price != null ? `<div class="info-sub price-tag">${formatPeso(item.price)}</div>` : "";
                htmlMarkup += `
                    <div class="row-card dynamic-nested-card">
                        <div class="card-left">
                            <div class="card-icon-wrapper dynamic-icon">
                                <i data-lucide="${iconName}"></i>
                            </div>
                            <div class="card-details dynamic-details">
                                <div>
                                    <div class="info-title">${item.name}</div>
                                    <div class="info-sub">${item.details}</div>
                                </div>
                                ${priceMarkup}
                            </div>
                        </div>
                        <div class="card-right-controls">
                            <button class="delete-item-btn" data-item-id="${item.id}" aria-label="Delete ${item.name}">
                                <i data-lucide="trash-2"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
        }

        container.innerHTML = htmlMarkup;
        lucide.createIcons();

        // Target the brand-new button generated inside this specific container context
        const inlineAddBtn = container.querySelector(".inline-add-btn");
        inlineAddBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // Stop accordion click bubbles
            openEntryModal(type, branchId, branchName);
        });

        const deleteButtons = container.querySelectorAll(".delete-item-btn");
        deleteButtons.forEach(button => {
            button.addEventListener("click", async (e) => {
                e.stopPropagation();
                const itemId = button.getAttribute("data-item-id");
                await deleteItem(type, itemId);
                await loadTabContent(type);
            });
        });
    }

    // Root button handler for parent branch items
    addBranchRootBtn.addEventListener("click", () => {
        openEntryModal("branches");
    });

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const tabTarget = tab.getAttribute("data-tab");
            document.querySelector(".tab-btn.active").classList.remove("active");
            tab.classList.add("active");
            loadTabContent(tabTarget);
        });
    });

    // Default initializer sequence
    loadTabContent("branches");
});