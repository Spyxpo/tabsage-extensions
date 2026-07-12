# Clipboard Tools

A small floating toolbar pinned to the **top-center** of every page, with
one-click buttons to copy the current page's **Title**, **URL**, or your
**Selection** to the clipboard. Each copy flashes a green `✓` badge on the
extension's toolbar row (cleared after ~1.5s) and shows a toast. You can also
copy the URL with **Mod+Shift+C**.

This is the reference for the new v1.2 capability groups: `clipboard` (write
text) and `badge` (a quick status flash), grounded by the always-on `page` group
(`page.meta` for the title/URL, `page.selection` for the highlighted text).

## Host API used

- `clipboard.writeText` — copy the chosen text.
- `page.meta` — read the page title and URL (no permission).
- `page.selection` — read the current selection (no permission).
- `badge.set` / `badge.clear` — flash a `✓`, then clear it after ~1.5s.
- `notifications.show` — toast what was copied.
- `shortcuts.register` — `Mod+Shift+C` copies the URL (no permission).

Every host group is feature-detected, so the toolbar still shows (and degrades
gracefully) if a capability is missing.

## What it touches

- Runs on all http/https pages (`<all_urls>`), never in incognito.
- Reads the page title, URL, and your current selection only when you click a
  button. It writes to the clipboard, shows a toast, and stores nothing. No
  network requests.

## Permissions

`content_scripts`, `clipboard`, `badge`, `notifications`. (`page` and `shortcuts`
need no permission.)

## Changes

- 1.0.0 — Initial release.
