# NSS Poster Studio Pro

Advanced static web app for making editable A4 NSS group leader/member posters.

## Features
- 1–10 members with automatic 2/3/4-column layout
- Upload leader, member, header, logo and background photos
- Per-photo Zoom / X / Y adjustment
- Editable all text fields
- Custom accent/card color, font, theme, border and radius
- 1×–4× PNG/JPG/PDF export
- Save/load full project JSON (including uploaded photos)
- Browser auto-save using localStorage
- Demo data, duplicate member, clear photos, reset
- Works as a static GitHub Pages site

## GitHub Pages
Upload **all files in this folder** to the root of the repository. Keep `index.html` exactly at the repository root. In Settings → Pages choose **Deploy from a branch → main → /(root)**.

The export buttons use html2canvas and jsPDF from public CDNs, so an internet connection is needed when exporting.
