# Selection Word Count

Select any text on a page and a small badge appears at the bottom showing the
word and character count of your selection. Deselect and it disappears.

Handy for writers, students, and anyone checking snippet lengths. This is one of
the smallest useful extension shapes: `content_scripts` only, no storage, no
network. It reads the selection through the always-on `page.selection()` host
group when running inside Tab Sage, and falls back to `window.getSelection()`
everywhere else — so the same file works in and out of the app.

## What it touches

- Runs on all http/https pages (`<all_urls>`), never in incognito.
- Reads only the current text selection (via `page.selection()`, no permission
  required). It stores nothing and sends nothing.

## Permissions

`content_scripts`. (`page` needs no permission.)

## Changes

- 1.0.1 — Read the selection via the host `page.selection()` group when
  available, keeping the plain `window.getSelection()` fallback.
- 1.0.0 — Initial release.
