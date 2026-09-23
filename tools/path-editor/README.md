# 步步 Path Editor

A local program for placing the scenery on the learning path. It reads the path
straight from the app every time it opens, and saves back into the app.

## Start it

Double-click **`start.bat`**. A window opens with the server (keep it open) and the
editor opens in your browser. Close the window to stop the editor.

Needs Node.js (any recent LTS). Nothing else to install.

## What it does

- **Always current.** Chapters, stones, stone characters, art and the saved layout
  come from `app.js`, `data.js` and `images/path/` when it loads. If those files
  change while it's open, it reloads them, or asks first if you have unsaved edits.
- **Any screen.** Pick a phone, iPad or computer, or a custom size, and rotate
  it. The editor loads the real app at that size in the preview and measures the
  path there, so the stage matches the app exactly. Dashed lines mark where each
  screenful ends.
- **Live preview.** The panel on the right is the real app, redrawing as you edit
  and following your scroll.
- **Save** (Ctrl+S) writes the layout into `PATH_LAYOUT` in `app.js` and bumps the
  build number so phones pick it up. The previous `app.js` is kept in `backups/`
  (the newest 30).
- **Publish** commits `app.js`, `index.html` and `sw.js` and pushes them. Any other
  changed files are left out.
- **Drafts.** Unsaved edits survive closing the browser; you're offered them back
  next time.

## One layout, every screen

The app has one hand-placed layout for all screens. Each piece hangs off a
stone: its sideways offset and width scale with the path's width, and its vertical
offset stays in pixels. Screens 700px and wider use bigger stones. So a change
made on the iPad view also moves things on the phone. Check both before publishing.

## Files

- `server.js`: the local server. It reads and writes the app's files and runs git.
- `ui/`: the editor.
- `backups/`: copies of `app.js` from before each save (not committed).

The preview relies on a small hook in `app.js` that only runs on `localhost`: it
reads an unsaved layout from `localStorage` (`bubu.dev.pathLayout`) and redraws.
