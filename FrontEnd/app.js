document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll(".tab-btn");
    const contentPanel = document.getElementById("tab-content-panel");

    // Async data fetch router
    async function loadTabContent(tabName) {
        contentPanel.innerHTML = `<div class="loader">Fetching data from server storage...</div>`;

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
                        <div class="drawer-inner-content">
                            </div>
                    </div>
                </div>
            `;
        });

        contentPanel.innerHTML = htmlMarkup;
        lucide.createIcons();

        // Bind interactive event loops to accordion buttons
        attachAccordionListeners(type);
    }

    // Handles expanding/collapsing drawers and fetching nested tab data asynchronously
    function attachAccordionListeners(type) {
        const branchRows = document.querySelectorAll(".clickable-branch-row");

        branchRows.forEach(row => {
            row.addEventListener("click", async () => {
                const branchId = row.getAttribute("data-id");
                const drawer = document.getElementById(`drawer-${branchId}`);
                const innerContent = drawer.querySelector(".drawer-inner-content");

                const isExpanded = drawer.classList.contains("expanded");

                // Collapse any currently open drawers for a clean accordion flow
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
                        renderDropdownItems(filteredItems, innerContent, type);
                    } catch (err) {
                        innerContent.innerHTML = `<div class="loader" style="color:#ef4444;">Failed to pull items.</div>`;
                    }
                }
            });
        });
    }

    // Builds item code modules directly inside the expanded dropdown accordion
    function renderDropdownItems(items, container, type) {
        if (items.length === 0) {
            container.innerHTML = `<div class="no-items-message">No ${type} available at this specific branch facility location.</div>`;
            return;
        }

        let iconName = type === "products" ? "package" : "cpu";
        let htmlMarkup = "";

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

        container.innerHTML = htmlMarkup;
        lucide.createIcons();
    }

    // Primary top bar tab control handlers
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const tabTarget = tab.getAttribute("data-tab");

            document.querySelector(".tab-btn.active").classList.remove("active");
            tab.classList.add("active");
            
            loadTabContent(tabTarget);
        });
    });

    // Default initialization setup sequence
    const defaultActiveTab = document.querySelector(".tab-btn.active").getAttribute("data-tab");
    loadTabContent(defaultActiveTab);
});