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
                card.innerHTML = `<img src="${game.icon}" alt="${game.name}"><h3>${game.name}</h3>`;
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

    function loadGame(url, gameName) {
        const launches = JSON.parse(localStorage.getItem("Vertex3.launches") || "{}");
        launches[gameName] = (launches[gameName] || 0) + 1;
        localStorage.setItem("Vertex3.launches", JSON.stringify(launches));

        if (iframe) iframe.remove();
        iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.top = nav.offsetHeight + 'px';
        iframe.style.left = '0';
        iframe.style.width = '100%';
        iframe.style.height = `calc(100% - ${nav.offsetHeight}px)`;
        iframe.style.border = 'none';
        iframe.style.zIndex = '9999';
        iframe.style.backgroundColor = 'white';
        iframe.textContent = 'Loading game...';
        document.body.appendChild(iframe);

        if (url.startsWith("$FLASH/")) {
            const swfPath = url.replace("$FLASH/", "flash/");
            localStorage.setItem("Vertex3.flashUrl", swfPath);
            fetch("engine/flash/index.html")
                .then(res => res.text())
                .then(html => {
                    iframe.srcdoc = html;
                    iframe.onload = () => {
                        const script = document.createElement('script');
                        script.src = "src/injects.js";
                        iframe.contentDocument.head.appendChild(script);

                        focusLoop();
                    };
                    ;
                });
        }
        if (url.startsWith("$SRC")) {
            const realUrl = url.replace("$SRC", "");
            iframe.src = realUrl;
            iframe.onload = () => {
                const script = document.createElement('script');
                script.src = "src/injects.js";
                iframe.contentDocument.head.appendChild(script);

                focusLoop();
            };

        } else {
            fetch(url)
                .then(res => res.text())
                .then(html => {
                    if (url.startsWith('https://')) {
                        html = html.replace(/<head>/i, `<head><base href="${url}">`);
                    }
                    iframe.srcdoc = html;

                    // Wait until iframe fully loads
                    iframe.onload = () => {
                        if (url.includes("a-dance")) {
                            const style = document.createElement('style');
                            style.textContent = `
                                canvas {
                                    width: 100vw !important;
                                    height: 100vh !important;
                                }
                            `;
                            iframe.contentDocument.head.appendChild(style);
                        }
                        () => {
                            const script = document.createElement('script');
                            script.src = "src/injects.js";
                            iframe.contentDocument.head.appendChild(script);

                            focusLoop();
                        };

                    };
                });
        }
    }



    function focusLoop() {
        if (iframe) {
            iframe.focus();
            requestAnimationFrame(focusLoop);
        }
    }

    function toggleFullscreen() {
        if (!iframe) return;
        if (document.fullscreenElement !== iframe) iframe.requestFullscreen();
        else document.exitFullscreen();
        iframe.focus();
    }

    nav.onclick = toggleFullscreen;

    nav.childNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) node.onclick = () => { if (iframe) { iframe.remove(); iframe = null; } };
    });

    document.addEventListener('keydown', e => {
        if (e.ctrlKey && e.key.toLowerCase() === 'f' && iframe) {
            e.preventDefault();
            toggleFullscreen();
        }
    });

    fetch('content.json')
        .then(res => res.json())
        .then(data => { games = data.games; refresh(); });
})();
