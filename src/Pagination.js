/* 
    Creates the pagination,
    being a fancy word for the numbers on a page
    this code is a little scary
    and could definetly be improved
    but i am too lazy
    (dont fix what isnt broken)
    #vibecoder
*/

import { getSortedGames } from './Page.js';

// draws pagination
export function renderPagination(paginationContainer, games, currentSort, searchInput, currentPage, perPage, update) {
    // lot of trial and error to achieve wanted effect, i honestly am scared of this code
    paginationContainer.innerHTML = '';

    const sortedGames = getSortedGames(games, currentSort);
    const filtered = sortedGames.filter(g => g.name.toLowerCase().includes(searchInput.value.toLowerCase()));
    const totalPages = Math.ceil(filtered.length / perPage);
    const windowSize = 5;

    const leftTriangle = `<svg viewBox="0 0 10 10"><polygon points="7,0 7,10 0,5"/></svg>`;
    const rightTriangle = `<svg viewBox="0 0 10 10"><polygon points="3,0 3,10 10,5"/></svg>`;

    const left = document.createElement('span');
    left.classList.add('arrow');
    left.innerHTML = leftTriangle;
    left.onclick = () => { if(currentPage > 1) update(currentPage - 1); };
    paginationContainer.appendChild(left);

    let startPage;
    let endPage;

    if(currentPage <= 3) {
        startPage = 1;
        endPage = Math.min(windowSize, totalPages);
    } else if(currentPage >= totalPages - 2) {
        startPage = Math.max(totalPages - windowSize + 1, 1);
        endPage = totalPages;
    } else {
        startPage = currentPage - 2;
        endPage = currentPage + 2;
    }

    if(startPage > 1) {
        const first = document.createElement('span');
        first.textContent = '1';
        first.onclick = () => update(1);
        paginationContainer.appendChild(first);

        if(startPage > 2) {
            const dots = document.createElement('span');
            dots.classList.add('ellipsis');
            dots.textContent = '...';
            paginationContainer.appendChild(dots);
        }
    }

    for(let i = startPage; i <= endPage; i++) {
        const span = document.createElement('span');
        span.textContent = i;
        if(i === currentPage) span.classList.add('active');
        span.onclick = () => update(i);
        paginationContainer.appendChild(span);
    }

    if(endPage < totalPages) {
        if(endPage < totalPages - 1) {
            const dots = document.createElement('span');
            dots.classList.add('ellipsis');
            dots.textContent = '...';
            paginationContainer.appendChild(dots);
        }
        const last = document.createElement('span');
        last.textContent = totalPages;
        last.onclick = () => update(totalPages);
        paginationContainer.appendChild(last);
    }

    const right = document.createElement('span');
    right.classList.add('arrow');
    right.innerHTML = rightTriangle;
    right.onclick = () => { if(currentPage < totalPages) update(currentPage + 1); };
    paginationContainer.appendChild(right);
}
