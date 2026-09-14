"use strict";
const STORAGE_KEY = "ecobazar-swagger-theme";
function getPreferredTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark")
        return stored;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}
function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
}
function setToggleLabel(btn, theme) {
    btn.textContent = theme === "dark" ? "☀ Light" : "🌙 Dark";
}
function buildTopbar() {
    var _a;
    const topbar = document.querySelector(".swagger-ui .topbar");
    if (!topbar || document.getElementById("eco-topbar-inner"))
        return false;
    const wrapper = (_a = topbar.querySelector(".wrapper")) !== null && _a !== void 0 ? _a : topbar;
    wrapper.innerHTML = "";
    wrapper.id = "eco-topbar-inner";
    const brand = document.createElement("div");
    brand.className = "eco-brand";
    const title = document.createElement("span");
    title.className = "eco-brand-title";
    title.textContent = "EcoBazar API";
    const subtitle = document.createElement("span");
    subtitle.className = "eco-brand-subtitle";
    subtitle.textContent = "E-commerce API Documentation";
    brand.appendChild(title);
    brand.appendChild(subtitle);
    const toggle = document.createElement("button");
    toggle.id = "eco-theme-toggle";
    toggle.type = "button";
    setToggleLabel(toggle, document.documentElement.getAttribute("data-theme") || "light");
    toggle.addEventListener("click", () => {
        const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        applyTheme(next);
        localStorage.setItem(STORAGE_KEY, next);
        setToggleLabel(toggle, next);
    });
    wrapper.appendChild(brand);
    wrapper.appendChild(toggle);
    return true;
}
(function init() {
    // Apply theme immediately (before Swagger UI finishes mounting) to avoid a flash.
    applyTheme(getPreferredTheme());
    // Swagger UI renders its DOM asynchronously, so poll briefly until the
    // topbar exists, then build the custom brand + toggle once.
    let attempts = 0;
    const interval = setInterval(() => {
        attempts += 1;
        if (buildTopbar() || attempts > 60) {
            clearInterval(interval);
        }
    }, 150);
})();