(function main() {
    let games = [];
    let currentPage = 1;
    let iframe = null;
    let currentSort = localStorage.getItem("Vertex3.sort") || 'index';
    const gamesContainer = document.getElementById('games');
    const paginationContainer = document.getElementById('pagination');
    const searchInput = document.getElementById('search');
    const sortSelect = document.getElementById('sort');
    const nav = document.querySelector('nav');
    sortSelect.value = currentSort;

    function getGamesPerPage() {
        const containerWidth = gamesContainer.clientWidth;
        const usableHeight = window.innerHeight - nav.offsetHeight - paginationContainer.offsetHeight - 40;
        const cardWidth = 180 + 20;
        const cardHeight = 210 + 20;

        const columns = Math.max(1, Math.floor(containerWidth / cardWidth));
        const rows = Math.min(2, Math.floor(usableHeight / cardHeight)) || 1;

        return columns * rows;
    }

    function getSortedGames() {
        const launches = JSON.parse(localStorage.getItem("Vertex3.launches") || "{}");
        let sorted = [...games];
        if (currentSort === 'alphabet') {
            sorted.sort((a, b) => a.name.localeCompare(b.name));
        } else if (currentSort === 'launches') {
            sorted.sort((a, b) => (launches[b.name] || 0) - (launches[a.name] || 0));
        }
        return sorted;
    }

    function renderPage(page) {
        gamesContainer.innerHTML = '';
        const sortedGames = getSortedGames();
        const filtered = sortedGames.filter(g => g.name.toLowerCase().includes(searchInput.value.toLowerCase()));
        const perPage = getGamesPerPage();
        const pageGames = filtered.slice((page - 1) * perPage, (page - 1) * perPage + perPage);
    
        const cardWidth = 180;
        const cardGap = 20;
        const cardFullWidth = cardWidth + cardGap;
        const columns = Math.max(1, Math.floor(gamesContainer.clientWidth / cardFullWidth));
        const rows = Math.ceil(pageGames.length / columns);
    
        let firstRowLeft = 0;
    
        for (let r = 0; r < rows; r++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'game-row';
            rowDiv.style.display = 'flex';
            rowDiv.style.gap = `${cardGap}px`;
    
            const rowGames = pageGames.slice(r * columns, r * columns + columns);
    
            rowGames.forEach((game, idx) => {
                const card = document.createElement('div');
                card.className = 'game-card';
    
                const title = document.createElement('h3');
                title.textContent = game.name;
    
                let fontSize = "1.7em";
                const maxLength = 28;
                if (game.name.length > maxLength) {
                    fontSize = Math.max(10, 16 - (game.name.length - maxLength) * 0.5);
                }
                title.style.fontSize = fontSize + 'px';
    
                card.innerHTML = `<img src="${game.icon}" alt="${game.name}">`;
                card.appendChild(title);
    
                card.style.opacity = 0;
                card.style.transform = 'translateY(20px)';
                card.onclick = () => loadGame(game.url, game.name);
                rowDiv.appendChild(card);
    
                setTimeout(() => {
                    card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    card.style.opacity = 1;
                    card.style.transform = 'translateY(0)';
                }, (r * columns + idx) * 50);
            });
    
            gamesContainer.appendChild(rowDiv);
    
            if (r === 0) {
                if (rows === 1 && rowGames.length < columns) {
                    firstRowLeft = 0;
                    rowDiv.style.justifyContent = 'flex-start';
                } else {
                    firstRowLeft = (gamesContainer.clientWidth - (rowGames.length * cardFullWidth - cardGap)) / 2;
                    rowDiv.style.justifyContent = 'flex-start';
                    rowDiv.style.paddingLeft = `${firstRowLeft}px`;
                }
            }
    
            if (r === 1) {
                rowDiv.style.position = 'absolute';
                rowDiv.style.top = `${(220 + cardGap)}px`;
                rowDiv.style.left = `${firstRowLeft + 10}px`;
            }
        }
    
        gamesContainer.style.position = 'relative';
        gamesContainer.style.height = `${rows * (220 + cardGap)}px`;
    }
    


    function renderPagination() {
        paginationContainer.innerHTML = '';
        const sortedGames = getSortedGames();
        const filtered = sortedGames.filter(g => g.name.toLowerCase().includes(searchInput.value.toLowerCase()));
        const perPage = getGamesPerPage();
        const pageCount = Math.ceil(filtered.length / perPage);

        for (let i = 1; i <= pageCount; i++) {
            const span = document.createElement('span');
            span.textContent = i;
            if (i === currentPage) span.classList.add('active');
            span.onclick = () => {
                currentPage = i;
                renderPage(currentPage);
                renderPagination();
            };
            paginationContainer.appendChild(span);
        }
    }

    function refresh() {
        currentPage = 1;
        renderPage(currentPage);
        renderPagination();
    }

    searchInput.addEventListener('input', refresh);
    window.addEventListener('resize', refresh);
    sortSelect.addEventListener('change', () => {
        currentSort = sortSelect.value;
        localStorage.setItem("Vertex3.sort", currentSort);
        refresh();
    });







    // load a game
    function loadGame(url, gameName) {


        // update launch counter
        const launches = JSON.parse(localStorage.getItem("Vertex3.launches") || "{}");
        launches[gameName] = (launches[gameName] || 0) + 1;
        localStorage.setItem("Vertex3.launches", JSON.stringify(launches));



        // Remove previous iframe
        if (iframe) iframe.remove();
        iframe = document.createElement('iframe');
        Object.assign(iframe.style, {
            position: 'fixed',
            top: nav.offsetHeight + 'px',
            left: '0',
            width: '100%',
            height: `calc(100% - ${nav.offsetHeight}px)`,
            border: 'none',
            zIndex: '9999',
            backgroundColor: 'white'
        });
        iframe.textContent = 'Loading game...';
        document.body.appendChild(iframe);

        function Inject(doc, gameUrl) {
            if (!doc) return;
            fetch('src/injects.js')
                .then(res => res.text())
                .then(js => {
                    console.log("injects.js fetched");
                    doc.defaultView.eval(js);
                    const win = doc.defaultView;
                    
                    console.log("Evaluated injects.js, window object:", win);
        
                    if (typeof win.JavaScript === 'function') {
                        console.log("Running default JavaScript");
                        win.JavaScript();
                    } else {
                        console.warn("Default JavaScript not found");
                    }
        
                    if (win.JavaScript_overrides && typeof win.JavaScript_overrides[gameUrl] === 'function') {
                        console.log("Running JavaScript override for:", gameUrl);
                        win.JavaScript_overrides[gameUrl]();
                    } else {
                        console.log("No JavaScript override for:", gameUrl);
                    }
        
                    if (typeof win.CSSi === 'string') {
                        console.log("Injecting default CSS");
                        const style = doc.createElement('style');
                        style.textContent = win.CSSi;
                        doc.head.appendChild(style);
                    } else {
                        console.warn("Default CSS not found or not a string");
                    }
        
                    if (win.CSS_overrides && typeof win.CSS_overrides[gameUrl] === 'string') {
                        console.log("Injecting CSS override for:", gameUrl);
                        const style2 = doc.createElement('style');
                        style2.textContent = win.CSS_overrides[gameUrl];
                        doc.head.appendChild(style2);
                    } else {
                        console.log("No CSS override for:", gameUrl);
                    }
        
                    console.log("Finished Inject() for", gameUrl);
                    focusLoop();
                })
                .catch(err => console.error("Failed to fetch or eval injects.js:", err));
        }
        
        
        
        

        if (url.startsWith("$FLASH/")) {
            const swfPath = url.replace("$FLASH/", "flash/");
            localStorage.setItem("Vertex3.flashUrl", swfPath);
            fetch("engine/flash/index.html")
                .then(res => res.text())
                .then(html => {
                    iframe.srcdoc = html;
                    iframe.onload = () => {
                        Inject(iframe.contentDocument, url);
                    };
                });
        } else if (url.startsWith("$SRC")) {
            iframe.src = url.replace("$SRC", "");
            iframe.onload = () => Inject(iframe.contentDocument, url);
        } else if (url.startsWith("$GBA/")) {
            const romPath = url.replace("$GBA/", ""); 
            const emulatorUrl = `engine/emulatorjs/index.html`; 
            // ^ this should point to your EmulatorJS loader page
        
            iframe.src = emulatorUrl;
            iframe.setAttribute("data-url", "launcher#" + romPath);

        
            iframe.onload = () => {
                Inject(iframe.contentDocument, url);
            };
        } else {
            fetch(url)
                .then(res => res.text())
                .then(html => {
                    if (url.startsWith('https://')) html = html.replace(/<head>/i, `<head><base href="${url}">`);
                    iframe.srcdoc = html;
                    iframe.onload = () => {
                        Inject(iframe.contentDocument, url);
                    };
                });
        }
    }





    // keep focus upon the iframe
    function focusLoop() {
        if (iframe) {
            iframe.focus();
            requestAnimationFrame(focusLoop);
        }
    }




    // toggle fullscreen within the iframe
    function toggleFullscreen() {
        if (!iframe) return;
        if (document.fullscreenElement !== iframe) iframe.requestFullscreen();
        else document.exitFullscreen();
        iframe.focus();
    }





    // Render nav listeners
    nav.onclick = toggleFullscreen;
    nav.childNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) node.onclick = () => { if (iframe) { iframe.remove(); iframe = null; } };
    });






    // Load games from content.json
    fetch('content.json')
        .then(res => res.json())
        .then(data => { games = data.games; refresh(); });
})();
