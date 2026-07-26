# Oxide Language

Syntax highlighting, error detection, code formatting, and IntelliSense for Oxide (.ox) programming language with OGRE GUI support

Converted from the VS Code extension `oxide-lang` (0.0.1) by `transition.sh`.

## What it touches

- Runs on: `<all_urls>` at `document_end` (never in incognito).
- State (settings, globalState, workspaceState) lives under one `tabsage.storage` key, `__vsc_state`.
- Review this section by hand before publishing: describe what the extension actually reads or changes.

## Permissions

`content_scripts`, `notifications`, `dialogs`, `storage`, `badge`. (`page`, `runtime`, and `shortcuts` need no permission.)

## Commands

- **Oxide: Format Oxide Document** — `oxide.formatDocument`
- **Oxide: Run Oxide File** — `oxide.runFile`
- **Oxide: Run Oxide File in Terminal** — `oxide.runFileInTerminal`
- **Oxide: Run Oxide File with Arguments** — `oxide.runFileWithArgs`
- **Oxide: Stop Running Oxide Process** — `oxide.stopRunning`
- **Oxide: Show Oxide Output** — `oxide.showOutput`
- **Oxide: Show Oxide Debug Console** — `oxide.showDebugConsole`
- **Oxide: Check Syntax** — `oxide.checkSyntax`
- **Oxide: Start Hot Reload** — `oxide.startHotReload`
- **Oxide: Stop Hot Reload** — `oxide.stopHotReload`
- **Oxide: Restart Hot Reload** — `oxide.restartHotReload`
- **Oxide: Select Target Device** — `oxide.selectDevice`
- **Oxide: Run on Device** — `oxide.runOnDevice`

## Conversion notes

- Entry: `out/extension.js` (11 modules inlined, 159 KB).
- Commands mapped to launcher menu items: 13.
- Keybindings mapped to `tabsage.shortcuts`: `Mod+Shift+F` → `oxide.formatDocument`, `Mod+F6` → `oxide.runFileInTerminal`, `Mod+Shift+F6` → `oxide.runFileWithArgs`, `Shift+F5` → `oxide.stopRunning`, `Mod+F5` → `oxide.startHotReload`, `Mod+Shift+F5` → `oxide.restartHotReload`, `Mod+D` → `oxide.selectDevice`.
- Keybindings dropped (chords and bare keys are unsupported): `f5 → oxide.runFile`.

### Blockers

- The code requires Node built-ins that do not exist in a content script: child_process, fs, net. They resolve to stubs that log and do nothing, so every code path through them is dead until you replace it.

### VS Code APIs with no Tab Sage equivalent

These were found in the source and resolve to logged stubs at runtime. Check
`window.__tsVscUnmapped` in a page where the extension ran for the live list.

- languages.*  (completions, hovers, diagnostics)
- window.activeTextEditor  (no editor in a browser page)
- window.createTerminal

### Notes

- `require(path)` is served by the shim's own browser implementation.
- `contributes.languages`, `contributes.grammars`, `contributes.snippets`, `contributes.menus` have no Tab Sage equivalent and were dropped.
- activationEvents (onLanguage:oxide) were dropped — a Tab Sage content script always runs, at document_end.

### Before publishing

- [ ] Load it unpacked in Tab Sage and exercise every command.
- [ ] Replace stubbed APIs, or delete the code paths that need them.
- [ ] Rewrite this README to describe the extension, not the conversion.
- [ ] Copy the folder to `extensions/oxide-lang/` and open one PR for it.

## Changes

- 0.0.1 — Initial release.
