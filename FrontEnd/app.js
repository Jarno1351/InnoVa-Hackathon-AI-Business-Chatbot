document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll(".tab-btn");
    const contentPanel = document.getElementById("tab-content-panel");
    const rootControlBar = document.getElementById("root-control-bar");
    const addBranchRootBtn = document.getElementById("add-branch-root-btn");

    // Async data fetch router
    async function loadTabContent(tabName) {
        contentPanel.innerHTML = `<div class="loader">Fetching data from server storage...</div>`;
        
        // Show the root "Add Branch" button bar ONLY if we are on the branches tab
        if (tabName === "branches") {
            rootControlBar.style.display = "flex";
        } else {
            rootControlBar.style.display = "none";
        }

        try {
            const response = await fetch(`./data/branches.json`);
            if (!response.ok) throw new Error("Network dataset error occurred");
            const branches = await response.json();
            
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
                        const response = await fetch(`./data/${type}.json`);
                        if (!response.ok) throw new Error();
                        const allItems = await response.json();
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

        if (items.length === 0) {
            htmlMarkup += `<div class="no-items-message">No ${type} available at this branch.</div>`;
        } else {
            items.forEach(item => {
                const statusClass = item.status.toLowerCase().replace(" ", "-");
                htmlMarkup += `
                    <div class="row-card dynamic-nested-card">
                        <div class="card-left">
                            <div class="card-icon-wrapper dynamic-icon">
                                <i data-lucide="${iconName}"></i>
                            </div>
                            <div class="card-details">
                                <div class="info-title">${item.name}</div>
                                <div class="info-sub">${item.location}</div>
                                <div class="info-sub">${item.contact}</div>
                            </div>
                        </div>
                        <div class="card-right-controls">
                            <span class="status-badge ${statusClass}">${item.status}</span>
                            <button class="action-link-text">${item.action}</button>
                            <button class="three-dot-menu" aria-label="Options Menu">
                                <i data-lucide="more-vertical"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
        }

        // Prepend or Append the contextual localized button safely at the bottom of this specific drawer view
        htmlMarkup += `
            <div class="drawer-action-footer">
                <button class="inline-add-btn" data-branch-id="${branchId}" data-branch-name="${branchName}">
                    <i data-lucide="plus"></i> Add ${itemLabel} to ${branchName}
                </button>
            </div>
        `;

        container.innerHTML = htmlMarkup;
        lucide.createIcons();

        // Target the brand-new button generated inside this specific container context
        const inlineAddBtn = container.querySelector(".inline-add-btn");
        inlineAddBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // Stop accordion click bubbles
            alert(`Open entry modal form!\nType: ${type.toUpperCase()}\nTarget Assignment: ${branchName} (ID: ${branchId})`);
        });
    }

    // Root button handler for parent branch items
    addBranchRootBtn.addEventListener("click", () => {
        alert("Open form wizard window to add a brand new root organizational Branch entry.");
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