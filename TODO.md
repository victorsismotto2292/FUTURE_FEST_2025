# TODO List for Home Page Adjustments

## 1. Enhance Graphs in Income Cards
- Modify SVG structures in each `.income-card` to include axes, grid lines, and filled area under the line for a more realistic line graph appearance.
- Update CSS in `style/inicial.css` for better graph styling (e.g., axes, grid).

## 2. Add Functionality to "Adicionar uma nova carteira ou conta bancária" Button
- Convert the `.add-card-btn` div to a button element with onclick event calling `addNewCard()`.
- Implement JavaScript function `addNewCard()` to dynamically generate and append a new card to the columns, matching existing card styles (colors, hovers, fonts).

## 3. Make Cards Editable
- Add onclick event to existing and new cards to toggle edit mode.
- In edit mode, replace title, number, and value with input fields.
- Add save functionality on blur or via a save button.
- Implement JS functions `makeEditable(card)` and `saveCard(card)`.

## 4. Implement Login Check
- Add JavaScript to check login status on page load using `isLoggedIn()` (simulate with localStorage, assuming 'user' key).
- If not logged in, hide cards and show a lock icon with defocus effect and message ("Faça login para acessar suas carteiras e contas.").
- If logged in, show cards normally.

## 5. Embed JavaScript in inicial.html
- Add script tag with functions: `isLoggedIn()`, `addNewCard()`, `makeEditable(card)`, `saveCard(card)`, and page load logic.

## 6. Update CSS for New Features
- Add styles for lock overlay (defocus, lock icon).
- Add styles for editable inputs.
- Add styles for enhanced graph elements (axes, grid).

## 7. Test and Verify
- Run server.js to test locally.
- Verify graphs, add functionality, editing, and login behavior.
- Ensure responsiveness on mobile.
