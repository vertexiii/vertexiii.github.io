(() => {
    const base = document.querySelector("base");
    if (!base) return;

    const baseHref = base.href;

    Object.defineProperty(document, "URL", {
        value: baseHref,
        configurable: true
    });

    Object.defineProperty(document, "baseURI", {
        value: baseHref,
        configurable: true
    });

    try {
        Object.defineProperty(window.location, "href", {
            get: () => baseHref,
            configurable: true
        });
    } catch (err) {
        console.warn("Could not override location.href", err);
    }
})();
