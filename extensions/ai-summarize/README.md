# AI Summarize

Adds a floating **Summarize** button to every page. Click it and Tab Sage's
on-device AI produces a short bullet-point summary of the page's main text, shown
in a small panel. The last summary for each URL is remembered, so revisiting a
page shows it instantly. A toast confirms when a new summary is ready.

This is also the reference extension for the `tabsage` host API: it uses `ai`
(prompt the local model), `storage` (remember the last summary per page), and
`notifications` (the toast).

## What it touches

- Runs on all http/https pages (`<all_urls>`), never in incognito.
- Reads the visible text of the page's main article/`main`/`body` (capped at
  6000 characters) and sends it to the **local** model. No network requests.
- Stores one string per visited URL under the key `summary:<url>` in its own
  sandboxed extension storage.

## Permissions

`content_scripts`, `ai`, `storage`, `notifications`.

## Confirming it works

Open Settings > Extensions, click **AI Summarize**, and watch the Activity panel:
you'll see an "activated on …" line plus its console output as you use it.

## Changes

- 1.0.0 — Initial release.
