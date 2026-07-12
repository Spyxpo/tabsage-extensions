# Sticky Notes

Adds a small note button to the bottom-left of every page. Click it (or press
**Mod+Shift+S**) to open a notepad scoped to the current site (by hostname).
Whatever you type is saved locally and comes back the next time you visit that
site. A small badge on the extension's toolbar row shows how many sites you have
notes saved on.

Good for keeping a running to-do per dashboard, notes on a docs page, or a
reminder on a site you check often.

Icons are inline [Font Awesome Free](https://fontawesome.com/license/free)
(CC BY 4.0) SVGs — embedded directly, so the extension stays dependency-free.

## Host API used

- `storage.get` / `storage.set` — save and restore the per-hostname note.
- `storage.getAll` — count every `note:<hostname>` entry for the badge.
- `badge.set` / `badge.clear` — show the saved-notes count on the toolbar row.
- `page.meta` — label the toggle tooltip with the page title (no permission).
- `shortcuts.register` — `Mod+Shift+S` toggles the notepad (no permission).
- `notifications.show` — a "Saved" toast after a save.

## What it touches

- Runs on all http/https pages (`<all_urls>`), never in incognito.
- Stores one note per hostname under the key `note:<hostname>` in its own
  sandboxed extension storage. Nothing leaves your device.
- Reads only its own saved notes (for the badge count) and the page title/URL
  metadata for the tooltip; it does not read page content, forms, or anything
  else.

## Permissions

`content_scripts`, `storage`, `notifications`, `badge`. (`page` and `shortcuts`
need no permission.)

## Changes

- 1.2.1 — Fix the toggle button's pencil icon not staying centered after the
  notepad was opened and closed (the button was reset to `display:block`,
  dropping its flex centering; now kept as `flex`).
- 1.2.0 — Add a saved-notes count badge (`storage.getAll` + `badge`), a
  `Mod+Shift+S` toggle shortcut, and a page-title tooltip via `page.meta`.
- 1.1.0 — Per-site notepad with a "Saved" toast.
- 1.0.0 — Initial release.
