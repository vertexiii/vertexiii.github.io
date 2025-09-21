/*
    Main code,
    ties everything together
*/


// removes comments from JSONC files before parsing (thanks html for not supporting JSONC out of the gate) (maybe in HTML6🙏)
import * as JSONC from './jsonc.js';

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

// Load games from JSONC
fetch('content.jsonc?' + Date.now())
  .then(res => res.text())
  .then(text => {
    const cleanText = JSONC.clean(text);
    let data;
    try {
        data = JSON.parse(cleanText);
    } catch (err) {
        console.error('Failed to parse JSONC:', err);
        return;
    }
    games = data.games;
    refresh();
  })
  .catch(err => console.error('Failed to load JSONC:', err));

// Expose global loader
window.Vertex3 = window.Vertex3 || {};
window.Vertex3.LoadGame = (url, gameName, nav) => loadGame(url, gameName, nav);
