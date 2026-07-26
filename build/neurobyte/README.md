# NeuroByte

AI-powered coding assistant using local Ollama models - like Claude Code but fully local

Converted from the VS Code extension `neurobyte` (0.1.0) by `transition.sh`.

## What it touches

- Runs on: `<all_urls>` at `document_end` (never in incognito).
- State (settings, globalState, workspaceState) lives under one `tabsage.storage` key, `__vsc_state`.
- Review this section by hand before publishing: describe what the extension actually reads or changes.

## Permissions

`content_scripts`, `clipboard`, `notifications`, `dialogs`, `storage`, `tabs`, `badge`. (`page`, `runtime`, and `shortcuts` need no permission.)

## Commands

- **NeuroByte: Open Chat (Sidebar)** — `neurobyte.openChat`
- **NeuroByte: Open Chat** — `neurobyte.openChatPanel`
- **NeuroByte: Ask About Selection** — `neurobyte.askAboutSelection`
- **NeuroByte: Explain This Code** — `neurobyte.explainCode`
- **NeuroByte: Fix This Code** — `neurobyte.fixCode`
- **NeuroByte: Refactor This Code** — `neurobyte.refactorCode`
- **NeuroByte: Generate Tests** — `neurobyte.generateTests`
- **NeuroByte: Add Documentation** — `neurobyte.addDocumentation`
- **NeuroByte: Enter Plan Mode** — `neurobyte.enterPlanMode`
- **NeuroByte: Approve Current Plan** — `neurobyte.approvePlan`
- **NeuroByte: Select Model** — `neurobyte.selectModel`
- **NeuroByte: Pull/Download Model** — `neurobyte.pullModel`
- **NeuroByte: Show Device Info** — `neurobyte.showDeviceInfo`
- **NeuroByte: Index Current Project** — `neurobyte.indexProject`
- **NeuroByte: Setup Ollama** — `neurobyte.setupOllama`
- **NeuroByte: Open Settings** — `neurobyte.openSettings`

## Conversion notes

- Entry: `out/extension.js` (8 modules inlined, 132 KB).
- Commands mapped to launcher menu items: 16.
- Keybindings mapped to `tabsage.shortcuts`: `Mod+Shift+N` → `neurobyte.openChatPanel`, `Mod+Shift+A` → `neurobyte.askAboutSelection`.
- No keybindings were dropped.

### Blockers

- The code requires Node built-ins that do not exist in a content script: child_process, fs, os. They resolve to stubs that log and do nothing, so every code path through them is dead until you replace it.
- The code requires npm packages that were not inlined: axios. Bundle them (esbuild --bundle --external:vscode) and convert the bundle with --entry.

### VS Code APIs with no Tab Sage equivalent

These were found in the source and resolve to logged stubs at runtime. Check
`window.__tsVscUnmapped` in a page where the extension ran for the live list.

- window.activeTextEditor  (no editor in a browser page)
- window.createTreeView / TreeDataProvider
- window.registerWebviewViewProvider  (sidebar views)
- window.createTerminal

### Notes

- `require(path)` is served by the shim's own browser implementation.
- `contributes.menus`, `contributes.submenus`, `contributes.viewsContainers`, `contributes.views` have no Tab Sage equivalent and were dropped.
- activationEvents (onStartupFinished) were dropped — a Tab Sage content script always runs, at document_end.

### Before publishing

- [ ] Load it unpacked in Tab Sage and exercise every command.
- [ ] Replace stubbed APIs, or delete the code paths that need them.
- [ ] Rewrite this README to describe the extension, not the conversion.
- [ ] Copy the folder to `extensions/neurobyte/` and open one PR for it.

## Changes

- 0.1.0 — Initial release.
