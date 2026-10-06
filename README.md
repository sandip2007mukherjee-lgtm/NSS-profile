# NSS Poster Studio

A mobile-friendly GitHub Pages web app for making editable NSS Group Leader / Group Members posters in the visual style of the supplied reference.

## Features
- 1–10 members: change the count and the grid rebuilds automatically.
- Upload a header person's portrait, leader photo and every member photo.
- Edit group name, title, quote, leader details, member details and footer.
- Per-photo Zoom / X / Y adjustment.
- A4 portrait poster preview.
- High-quality PNG, JPG and A4 PDF export at 1×–4×.
- Save and load a project as JSON.
- No server or database required.
- Works on GitHub Pages.

## Publish on GitHub Pages
1. Create a new public GitHub repository.
2. Upload `index.html`, `styles.css`, `app.js` and this README.
3. Open **Settings → Pages**.
4. Set **Deploy from a branch**, select `main` and `/root`.
5. Save and open the generated GitHub Pages URL.

## Important
The app uses two CDN libraries for export:
- html2canvas
- jsPDF

Therefore the export buttons need an internet connection when the page is opened from GitHub Pages.

## Design
The layout intentionally follows the supplied poster: blue border, watercolor-style background strokes, circular header/leader/member photos, large title, quote block, leader information card, four-column member grid and footer.

You can replace the colors, fonts and exact spacing in `styles.css` if you want a closer match to a particular poster.
