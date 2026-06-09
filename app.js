document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll(".tab-btn");
    const contentPanel = document.getElementById("tab-content-panel");

    // Core async fetch router function
    async function loadTabContent(tabName) {
        // Show loading state
        contentPanel.innerHTML = `<div class="loader">Fetching data from server storage...</div>`;

        try {
            // Emulating an AJAX call over data components
            const response = await fetch(`./data/${tabName}.json`);
            if (!response.ok) throw new Error("Network dataset error occurred");
            
            const data = await response.all ? await response.json() : await response.json();
            
            // Build out elements dynamically
            renderCards(data, tabName);
        } catch (error) {
            contentPanel.innerHTML = `
                <div class="loader" style="color: #ef4444;">
                    Error processing request: Could not locate ${tabName}.json dataset layout.
                </div>`;
            console.error(error);
        }
    }

    // Builder template compiler engine
    function renderCards(items, type) {
        if (items.length === 0) {
            contentPanel.innerHTML = `<div class="loader">No records cataloged under ${type}.</div>`;
            return;
        }

        // Determine proper graphic mapping icon context cleanly based on type
        let iconName = "building-2"; 
        if (type === "products") iconName = "package";
        if (type === "services") iconName = "cpu";

        let htmlMarkup = "";

        items.forEach(item => {
            // Dynamically evaluate status utility modifier classes
            const statusClass = item.status.toLowerCase().replace(" ", "-");

            htmlMarkup += `
                <div class="row-card">
                    <div class="card-left">
                        <div class="card-icon-wrapper">
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

        contentPanel.innerHTML = htmlMarkup;

        // Force runtime vector node replacements for vector icon packs injected by engine
        lucide.createIcons();
    }

    // Set up click events on individual tab instances 
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            // Drop current active class metrics
            document.querySelector(".tab-btn.active").classList.remove("active");
            
            // Apply targeted class states
            tab.classList.add("active");

            // Pull attribute mapping target and dispatch AJAX engine request 
            const tabTarget = tab.getAttribute("data-tab");
            loadTabContent(tabTarget);
        });
    });

    // Default Initialization Lifecycle entry point
    loadTabContent("branches");
});