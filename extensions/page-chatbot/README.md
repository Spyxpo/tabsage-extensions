# Page Chatbot

Adds an **Ask AI** button (top-left). Click it (or press **Mod+Shift+A**), type a
question about the page you're on, and Tab Sage's on-device AI — the same model
as the sidebar — answers in a dialog. If you have text selected, it answers about
just that selection; otherwise it uses the whole page. Everything runs locally.

This is the reference for the "chatbot in a dialog" pattern: `tabsage.dialog.prompt`
to collect the question, the always-on `page` group (`page.selection` / `page.text`)
to ground it, `tabsage.ai.chat` to answer it, and `tabsage.dialog.alert` to show
the reply.

## Host API used

- `page.selection` — if text is selected, answer about just that selection.
- `page.text` — otherwise ground the answer in the whole page (replaces manual
  DOM scraping; falls back to a scraper on older builds).
- `ai.chat` / `ai.complete` — answer with the local model (chat template,
  falling back to raw completion on builds without `ai.chat`).
- `dialogs.prompt` / `dialogs.alert` — collect the question and show the answer.
- `shortcuts.register` — `Mod+Shift+A` opens the ask box (no permission).

## What it touches

- Runs on all http/https pages (`<all_urls>`), never in incognito.
- Reads up to 5000 characters of the current selection or the page's visible text
  to ground the answer, and sends it to the **local** model. No network requests,
  no storage.

## Permissions

`content_scripts`, `ai`, `dialogs`. (`page` and `shortcuts` need no permission.)

## Requirements

Needs the on-device model downloaded and the AI runtime set to "llama"
(Settings → Models). Without it, the dialog explains what to enable.

## Changes

- 1.2.0 — Ground answers with the host `page.selection` / `page.text` groups
  (answer about a selection when there is one) instead of manual DOM scraping,
  and add a `Mod+Shift+A` shortcut to open the ask box.
- 1.1.0 — Score content containers so multi-`<article>` pages ground on the real
  story; add an `ai.complete` fallback for builds without `ai.chat`.
- 1.0.0 — Initial release.
