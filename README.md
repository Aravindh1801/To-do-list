# To do

A daily to-do list, installable on your phone, hosted for free on GitHub Pages.

## What it does

- Add tasks for today.
- Tap the circle to check a task off (it gets a strikethrough).
- Tap the flag to mark a task as priority — it moves to the top.
- Whenever you open the app on a new day, anything you completed is cleared out, and anything left unfinished is carried forward, highlighted in red, with the date it was first added.
- Everything is stored only on your phone (browser local storage) — nothing is sent anywhere, and nothing syncs between devices.

## Deploy it to GitHub Pages

1. Go to github.com and create a new repository (any name, e.g. `todo-app`). Keep it Public — GitHub Pages on the free plan needs a public repo.
2. Open the new repo, click **Add file → Upload files**, and drag in everything from this folder — `index.html`, `style.css`, `app.js`, `manifest.json`, `service-worker.js`, and the whole `icons` folder (with `icon-192.png` and `icon-512.png` inside it). Keep the folder structure exactly as it is.
3. Commit the files to the `main` branch.
4. In the repo, go to **Settings → Pages**.
5. Under **Build and deployment → Source**, choose **Deploy from a branch**.
6. Under **Branch**, choose `main` and folder `/ (root)`, then **Save**.
7. Wait a minute or two, then refresh that Pages settings screen — it will show your live URL, something like:
   `https://yourusername.github.io/todo-app/`

## Install it on your phone

Open that URL in your phone's browser, then:

- **iPhone (Safari):** tap the Share icon → **Add to Home Screen** → **Add**.
- **Android (Chrome):** tap the **⋮** menu → **Add to Home screen** (or Chrome may show an **Install** banner automatically) → **Add**.

An icon named **To do** will appear on your home screen. Opening it launches the app full-screen, like a normal app.

## Notes

- Because it's stored in the phone's browser storage, uninstalling the app or clearing site data/browsing data for it will erase your tasks.
- If you ever want to reset everything manually, clearing the site's storage from your phone's browser settings does it.
