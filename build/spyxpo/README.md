# Spyxpo

An official extension for Spyxpo.

Converted from the VS Code extension `spyxpo` (1.0.0) by `transition.sh`.

## What it touches

- Runs on: `<all_urls>` at `document_end` (never in incognito).
- State (settings, globalState, workspaceState) lives under one `tabsage.storage` key, `__vsc_state`.
- Review this section by hand before publishing: describe what the extension actually reads or changes.

## Permissions

`content_scripts`, `notifications`. (`page`, `runtime`, and `shortcuts` need no permission.)

## Commands

- **Hello World** — `spyxpo.helloWorld`

## Conversion notes

- Entry: `extension.js` (2 modules inlined, 2 KB).
- Commands mapped to launcher menu items: 1.
- Keybindings mapped to `tabsage.shortcuts`: none.
- No keybindings were dropped.

### Blockers

- None.

### VS Code APIs with no Tab Sage equivalent

These were found in the source and resolve to logged stubs at runtime. Check
`window.__tsVscUnmapped` in a page where the extension ran for the live list.

- None.

### Notes

- activationEvents (onCommand:spyxpo.helloWorld) were dropped — a Tab Sage content script always runs, at document_end.

### Before publishing

- [ ] Load it unpacked in Tab Sage and exercise every command.
- [ ] Replace stubbed APIs, or delete the code paths that need them.
- [ ] Rewrite this README to describe the extension, not the conversion.
- [ ] Copy the folder to `extensions/spyxpo/` and open one PR for it.

## Changes

- 1.0.0 — Initial release.
