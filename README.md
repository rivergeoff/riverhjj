# River Geoff — Portfolio '26

A single-page, app-style portfolio: sidebar navigation, searchable and filterable
project grid, a project viewer, and an About panel with your details.
Plain HTML/CSS/JS — no build step.

## Edit your details

Everything you see is read from **`data.js`**. Replace anything in `[brackets]`:

- `profile` — name, role, tagline, status, email, phone, location, social links
- `about` — your bio paragraphs
- `stats` — the three number tiles on the overview
- `details` — the key/value list in the About panel (add or remove rows freely)
- `experience`, `skills` — timeline and skill chips
- `projects` — one entry per piece of work; `featured: true` puts it on the overview

## Add your images

Export from Canva (Share → Download → JPG, ~2400px wide) and save into `assets/`:

| File | Used for |
| --- | --- |
| `assets/profile.jpg` | Your photo (portrait works best) |
| `assets/work/page-2.jpg` … `page-6.jpg` | Pages 2–6 of the "contents to be approved" deck |
| `assets/work/sonder.jpg`, `tres-marias.jpg` | Brand identity pages from Portfolio '26 |

Any file name works — just match the `image` path in `data.js`. Until a file
exists, the site shows a labelled "Add …" slot in its place.

## Preview

Open `index.html` in a browser, or run `python3 -m http.server` and visit
http://localhost:8000.

## Publish

On GitHub: Settings → Pages → Deploy from branch → pick this branch, `/ (root)`.
