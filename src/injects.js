window.JavaScript = () => {
    const script = document.createElement("script");
script.textContent = `
  (function() {
    const base = document.querySelector("base");
    if (!base) return;
    const baseHref = base.href;
    Object.defineProperty(document, "URL", { value: baseHref, configurable: true });
    Object.defineProperty(document, "baseURI", { value: baseHref, configurable: true });
    try { 
      Object.defineProperty(window.location, "href", { 
        get: () => baseHref, 
        configurable: true 
      }); 
    } catch (_) {}
  })();
`;
document.head.appendChild(script);

};

window.CSS = `
    #unity-warning {
        visibility: hidden;
    }
`;

window.CSS_overrides = {
    "https://warpedentrance2.github.io/crazya.github.io/games/a-dance-of-fire-and-ice/": `
        canvas {
            width: 100vw !important;
            height: 100vh !important;
        }`,
};

window.JavaScript_overrides = {
    "game_url": () => { /* per-game JS */ }
};
