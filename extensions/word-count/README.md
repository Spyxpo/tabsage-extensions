# Selection Word Count

Select any text on a page and a small badge appears at the bottom showing the
word and character count of your selection. Deselect and it disappears.

Handy for writers, students, and anyone checking snippet lengths. This is the
smallest useful extension shape: `content_scripts` only, no host API, no storage,
no network.

## What it touches

- Runs on all http/https pages (`<all_urls>`), never in incognito.
- Reads only the current text selection. It stores nothing and sends nothing.

## Permissions

`content_scripts`.

## Changes

- 1.0.0 — Initial release.
