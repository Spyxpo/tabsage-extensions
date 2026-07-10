# Page Chatbot

Adds an **Ask AI** button (top-left). Click it, type a question about the page
you're on, and Tab Sage's on-device AI — the same model as the sidebar — answers
in a dialog. Everything runs locally.

This is the reference for the "chatbot in a dialog" pattern: `tabsage.dialog.prompt`
to collect the question, `tabsage.ai.chat` to answer it, and `tabsage.dialog.alert`
to show the reply.

## What it touches

- Runs on all http/https pages (`<all_urls>`), never in incognito.
- Reads up to 5000 characters of the page's visible text to ground the answer,
  and sends it to the **local** model. No network requests, no storage.

## Permissions

`content_scripts`, `ai`, `dialogs`.

## Requirements

Needs the on-device model downloaded and the AI runtime set to "llama"
(Settings → Models). Without it, the dialog explains what to enable.

## Changes

- 1.0.0 — Initial release.
