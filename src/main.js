/*
    Main code,
    ties everything together
*/

import { renderPage, getGamesPerPage, getSortedGames } from './Page.js';
import { renderPagination } from './Pagination.js';
import { loadGame } from './GameLoader.js';

let games = [];
let currentPage = 1;
let currentSort = localStorage.getItem("Vertex3.sort");
const gamesContainer = document.getElementById('games');
const paginationContainer = document.getElementById('pagination');
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sort');
const nav = document.querySelector('nav');

if (!currentSort) sortSelect.value = "";
else sortSelect.value = currentSort;

function update(page = 1) {
    currentPage = page;
    const perPage = getGamesPerPage(gamesContainer, nav, paginationContainer);
    renderPage(gamesContainer, games, currentSort, searchInput, loadGame, currentPage, perPage);
    renderPagination(paginationContainer, games, currentSort, searchInput, currentPage, perPage, update);
}

function refresh() { update(1); }

searchInput.addEventListener('input', refresh);
window.addEventListener('resize', refresh);
sortSelect.addEventListener('change', () => {
    currentSort = sortSelect.value;
    localStorage.setItem("Vertex3.sort", currentSort);
    refresh();
});

// Load games
fetch('content.json5?' + Date.now())
    .then(res => res.json())
    .then(data => { games = data.games; refresh(); });


// Expose global loader
window.Vertex3 = window.Vertex3 || {};
window.Vertex3.LoadGame = (url, gameName) => loadGame(url, gameName, nav);
