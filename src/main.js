(function main() {
    let games = [];
    let currentPage = 1;
    let iframe = null;

    const gamesContainer = document.getElementById('games');
    const paginationContainer = document.getElementById('pagination');
    const searchInput = document.getElementById('search');
    const nav = document.querySelector('nav');

    function getGamesPerPage() {
        const containerWidth = gamesContainer.clientWidth;
        const containerHeight = gamesContainer.clientHeight || window.innerHeight - 180;
        const cardWidth = 180 + 20;
        const cardHeight = 210 + 20;
        const columns = Math.floor(containerWidth / cardWidth) || 1;
        const rows = Math.floor(containerHeight / cardHeight) || 1;
        return columns * rows;
    }

    function renderPage(page) {
        gamesContainer.innerHTML = '';
        const filteredGames = games.filter(g =>
            g.name.toLowerCase().includes(searchInput.value.toLowerCase())
        );
        const gamesPerPage = getGamesPerPage();
        const start = (page - 1) * gamesPerPage;
        const end = start + gamesPerPage;
        const pageGames = filteredGames.slice(start, end);

        pageGames.forEach((game, index) => {
            const card = document.createElement('div');
            card.className = 'game-card';
            card.innerHTML = `<img src="${game.icon}" alt="${game.name}"><h3>${game.name}</h3>`;
            card.style.opacity = 0;
            card.style.transform = 'translateY(20px)';
            card.onclick = () => loadGame(game.url);
            gamesContainer.appendChild(card);
            setTimeout(() => {
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                card.style.opacity = 1;
                card.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }

    function renderPagination() {
        paginationContainer.innerHTML = '';
        const filteredGames = games.filter(g =>
            g.name.toLowerCase().includes(searchInput.value.toLowerCase())
        );
        const gamesPerPage = getGamesPerPage();
        const pageCount = Math.ceil(filteredGames.length / gamesPerPage);

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

    function loadGame(url) {
        function loadGame(url) {
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
                iframe.src = "engine/flash/index.html";
            } else {
                fetch(url)
                    .then(res => res.text())
                    .then(html => {
                        iframe.srcdoc = html;
                        focusLoop();
                    });
            }
        
            focusLoop();
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
        if (document.fullscreenElement !== iframe) {
            iframe.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
        iframe.focus();
    }

    nav.onclick = toggleFullscreen;

    nav.childNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            node.onclick = () => {
                if (iframe) {
                    iframe.remove();
                    iframe = null;
                }
            };
        }
    });

    document.addEventListener('keydown', e => {
        if (e.ctrlKey && e.key.toLowerCase() === 'f' && iframe) {
            e.preventDefault();
            toggleFullscreen();
        }
    });

    fetch('content.json')
        .then(res => res.json())
        .then(data => {
            games = data.games;
            refresh();
        });
})();
