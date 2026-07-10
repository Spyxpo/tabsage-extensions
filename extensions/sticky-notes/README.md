# Sticky Notes

Adds a small 📝 button to the bottom-left of every page. Click it to open a
notepad scoped to the current site (by hostname). Whatever you type is saved
locally and comes back the next time you visit that site.

Good for keeping a running to-do per dashboard, notes on a docs page, or a
reminder on a site you check often.

## What it touches

- Runs on all http/https pages (`<all_urls>`), never in incognito.
- Stores one note per hostname under the key `note:<hostname>` in its own
  sandboxed extension storage. Nothing leaves your device.
- Does not read page content, forms, or anything else.

## Permissions

`content_scripts`, `storage`, `notifications`.

## Changes

- 1.0.0 — Initial release.
