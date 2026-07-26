# Trident — Local AI Coding Agent

A local, Claude-Code-like coding agent that runs GGUF models in-process via the Trident CLI. No daemon, no API keys.

Converted from the VS Code extension `trident` (1.0.0) by `transition.sh`.

## What it touches

- Runs on: `<all_urls>` at `document_end` (never in incognito).
- State (settings, globalState, workspaceState) lives under one `tabsage.storage` key, `__vsc_state`.
- Review this section by hand before publishing: describe what the extension actually reads or changes.

## Permissions

`content_scripts`, `notifications`, `dialogs`, `storage`, `badge`. (`page`, `runtime`, and `shortcuts` need no permission.)

## Commands

- **Trident: New Chat** — `trident.newChat`
- **Trident: Resume Session** — `trident.resume`
- **Trident: Toggle Plan Mode** — `trident.togglePlan`
- **Trident: Restart Agent** — `trident.restart`

## Conversion notes

- Entry: `dist/extension.js` (1 module inlined, 17 KB).
- Commands mapped to launcher menu items: 4.
- Keybindings mapped to `tabsage.shortcuts`: none.
- No keybindings were dropped.

### Blockers

- the code requires Node built-ins that do not exist in a content script: child_process. They resolve to stubs that log and do nothing, so every code path through them is dead until you replace it.

### VS Code APIs with no Tab Sage equivalent

These were found in the source and resolve to logged stubs at runtime. Check
`window.__tsVscUnmapped` in a page where the extension ran for the live list.

- window.registerWebviewViewProvider  (sidebar views)

### Dropped from the VS Code manifest

- require(events) is served by the shim's own browser implementation.
- contributes.viewsContainers, contributes.views, contributes.menus has no Tab Sage equivalent and was dropped.

### Before publishing

- [ ] Load it unpacked in Tab Sage and exercise every command.
- [ ] Replace stubbed APIs, or delete the code paths that need them.
- [ ] Rewrite this README to describe the extension, not the conversion.
- [ ] Copy the folder to `extensions/trident/` and open one PR for it.

## Changes

- 1.0.0 — Initial release.
