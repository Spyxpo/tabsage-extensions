# UI Kit Demo

A working tour of the **Tab Sage UI Kit** (`TabSageUI`). Load it, open any page,
and click the **UI Kit** button in the bottom-right corner.

It demonstrates, from a single vendored file (`tabsage-ui.js`):

- a **launcher** — a Tab Sage-styled floating corner button;
- a **popup** panel that opens upward from the corner;
- an **input**, a **switch**, and a **select** (custom dropdown);
- a **dropdown/dropup menu** with icons, a separator, and a danger item;
- a **modal** and **toasts**.

Everything matches Tab Sage's look and follows the OS light/dark theme
automatically. No permissions beyond `content_scripts` — the kit builds all UI
in the page.

## How it's wired

`tabsage-ui.js` is listed **first** in the manifest's `content_scripts.js`, so
`TabSageUI` exists before `content.js` runs:

```json
"js": ["tabsage-ui.js", "content.js"]
```

See [DEVELOP.md](../../DEVELOP.md#ui-kit) for the full UI Kit reference.

## What it touches

- Runs on: `<all_urls>` (never in incognito).
- Only draws its own widgets. Reads nothing from the page.

## Permissions

content_scripts

## Changes

- 1.0.0 — Initial release.
