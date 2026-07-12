# AI Summarize

Adds a floating **Summarize** button (bottom-right) to every page. Click it (or
press **Mod+Shift+U**) and Tab Sage's on-device AI produces a short bullet-point
summary of the page's main text, shown in a dialog over the page. The last
summary for each URL is remembered, and a toast confirms when a new summary is
ready.

This is also the reference extension for the `tabsage` host API: it uses `ai`
(prompt the local model), `storage` (remember the last summary per page),
`notifications` (the toast), and `dialogs` (show the summary), plus the always-on
`page` group (`page.text` / `page.meta` to read the page) and `shortcuts`
(the hotkey).

## Host API used

- `page.text` — extract the page's visible text (replaces hand-rolled scraping;
  falls back to a content-container scraper on older builds).
- `page.meta` — pull the page title to include in the summarize prompt.
- `ai.chat` / `ai.complete` — summarize with the local model (chat template,
  falling back to raw completion on builds without `ai.chat`).
- `storage.set` — remember the last summary per URL.
- `notifications.show` — the "Summary ready" toast.
- `dialogs.alert` — show the summary.
- `shortcuts.register` — `Mod+Shift+U` triggers a summary (no permission).

## What it touches

- Runs on all http/https pages (`<all_urls>`), never in incognito.
- Reads the page's visible text (capped at 6000 characters) via `page.text` and
  sends it to the **local** model. No network requests.
- Stores one string per visited URL under the key `summary:<url>` in its own
  sandboxed extension storage.

## Permissions

`content_scripts`, `ai`, `storage`, `notifications`, `dialogs`.

## Confirming it works

Open Settings > Extensions, click **AI Summarize**, and watch the Activity panel:
you'll see an "activated on …" line plus its console output as you use it.

## Changes

- 1.2.0 — Read the page with the host `page.text` / `page.meta` groups instead
  of hand-rolled DOM scraping, and add a `Mod+Shift+U` summarize shortcut. The
  chat/complete fallback is unchanged.
- 1.1.0 — Score content containers so multi-`<article>` pages summarize the real
  story; add an `ai.complete` fallback for builds without `ai.chat`.
- 1.0.0 — Initial release.
