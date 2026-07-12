# Tab Switcher

A launcher button pinned to the **center-right** of every page. Click it to open
a panel listing every open tab. From there you can:

- **Jump** to a tab — click its row (`tabs.activate`).
- **Close** a tab — click the `✕` on its row (`tabs.close`).
- **Reload this tab** — the tab the panel is open in (`tabs.reload`).
- **Ping other tabs** — broadcast a `ping` and count the `pong` replies from your
  other open tabs, live (`messaging.send` + `messaging.onMessage`).

This is the reference for the v1.2 `tabs` additions and the cross-tab `messaging`
pub/sub group.

## Host API used

- `tabs.list` — enumerate every open tab (`{ id, url, title, active }`).
- `tabs.activate` — focus a tab by id.
- `tabs.close` — close a tab by id.
- `tabs.reload` — reload the tab this script runs in.
- `messaging.send` / `messaging.onMessage` — each tab answers a `ping` with a
  `pong`; the pinging tab counts the replies. Messages route only within this
  extension, and the sender's own broadcast is filtered out by a per-tab id.

## What it touches

- Runs on all http/https pages (`<all_urls>`), never in incognito.
- Lists the id/url/title of your open tabs and can activate, close, or reload
  tabs when you click. Messaging stays inside this extension (same-extension,
  cross-tab only). No network requests, no storage.

## Permissions

`content_scripts`, `tabs`, `messaging`.

## Changes

- 1.0.0 — Initial release.
