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

window.CSSi = `
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
    "games/tubejumpers/": `
        body {
            overflow: hidden;
        }`,
};

window.JavaScript_overrides = {
  // adds 'r' keybind to refresh
  "games/4x4/": () => {
      const doc = frameElement.contentDocument;
      doc.addEventListener("keydown", (e) => {
          //reloads game
          if (e.key.toLowerCase() === "r") {
              window.parent.Vertex3.LoadGame("games/4x4/", "4x4");
          }
      });
  },
  // makes canvas support resizing
  "games/superhot/": () => {
    const canvas = document.getElementById("canvas");
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.width = "100vw";
      canvas.style.height = "100vh";
    }
    resizeCanvas();
    setInterval(resizeCanvas, 1000);
  },
  "games/autonecrochess/": () => {
    const canvas = document.getElementById("canvas");
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.width = "100vw";
      canvas.style.height = "100vh";
    }
    resizeCanvas();
    setInterval(resizeCanvas, 1000);
  }
};
