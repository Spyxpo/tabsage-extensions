# Developing Tab Sage extensions

This is the complete guide to building an extension: the manifest format, how
content scripts run, every `tabsage` host API with examples, how to see your
extension working, and how to test and submit it. For a shorter overview see
[README.md](README.md).

- [What an extension is](#what-an-extension-is)
- [Quick start](#quick-start)
- [The manifest](#the-manifest)
- [Content scripts](#content-scripts)
- [The `tabsage` API](#the-tabsage-api)
  - [`storage`](#storage)
  - [`ai`](#ai)
  - [`tabs`](#tabs)
  - [`notifications`](#notifications)
  - [`dialogs`](#dialogs)
  - [`adblock`](#adblock)
  - [`cutout`](#cutout)
  - [`clipboard`](#clipboard)
  - [`downloads`](#downloads)
  - [`badge`](#badge)
  - [`messaging`](#messaging)
  - [`page`, `runtime`, `shortcuts`](#page-runtime-shortcuts)
- [Seeing your extension work](#seeing-your-extension-work)
- [UI placement](#ui-placement)
- [The UI Kit](#ui-kit)
- [Security & privacy](#security--privacy)
- [Testing locally](#testing-locally)
- [A complete example](#a-complete-example)
- [Submitting](#submitting)

---

## What an extension is

A Tab Sage extension is a folder with a `manifest.json` and the JavaScript and
CSS it references. When a page loads in a normal (non-incognito) tab, Tab Sage
checks the page's URL against each enabled extension's match patterns and injects
the matching content scripts and styles into the page.

A content script runs **inside the web page**, in the page's own JavaScript
world — with the same access to that page any script the page loads would have,
plus the opt-in `tabsage` host API for capabilities you declare in the manifest.
There is no build step: what is in the folder is what runs.

Extensions never run in incognito tabs.

## Quick start

From the repository root, scaffold a new extension:

```bash
# macOS / Linux
./create.sh --id my-extension --name "My Extension" \
  --description "What it does." --author "Your Name" \
  --permissions content_scripts,ai,dialogs
```

```bat
:: Windows
create.bat --id my-extension --name "My Extension" ^
  --description "What it does." --author "Your Name" ^
  --permissions content_scripts,ai,dialogs
```

Run the scaffolder (`create.sh` on macOS/Linux, `create.bat` on Windows) with no
arguments to be prompted for every manifest field; any field you omit from the
command line is asked for interactively. It creates `extensions/<id>/` with a
`manifest.json`, a guarded `content.js`, a `style.css`, and a `README.md`. Then
load it: in Tab Sage go to **Settings → Extensions → Load unpacked** and point at
the folder.

## The manifest

`manifest.json` is required. Example with every field:

```json
{
  "id": "my-extension",
  "name": "My Extension",
  "version": "1.0.0",
  "description": "One or two sentences about what it does.",
  "author": "Your Name",
  "homepage": "https://github.com/you",
  "permissions": ["content_scripts", "ai", "dialogs"],
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "css": ["style.css"],
      "run_at": "document_end"
    }
  ]
}
```

| Field | Required | Meaning |
| --- | --- | --- |
| `id` | yes | Unique id. Lowercase letters, digits, hyphens only. Must equal the folder name. |
| `name` | yes | Display name in the manager. |
| `version` | yes | `MAJOR.MINOR.PATCH`, e.g. `1.0.0`. Bump it on every update — the PR check requires it to increase (see [Submitting](#submitting)). |
| `description` | yes | One or two sentences. |
| `author` | yes | Your name or handle. |
| `homepage` | no | Link to your site or profile. |
| `permissions` | yes | Capabilities you need — see below. `content_scripts` is required. |
| `content_scripts` | yes | Which scripts/styles run on which pages. |

**Permissions.** `content_scripts` lets you inject JS/CSS. The rest each unlock
one group of the `tabsage` API:

| Permission | Unlocks |
| --- | --- |
| `content_scripts` | Injecting your `js`/`css` into matched pages (required). |
| `storage` | `tabsage.storage` — per-extension key/value. |
| `ai` | `tabsage.ai` — the on-device model (`chat`/`complete`). |
| `tabs` | `tabsage.tabs` — tab metadata + open a tab. |
| `notifications` | `tabsage.notifications` — a toast. |
| `dialogs` | `tabsage.dialogs` — alert/confirm/prompt modals. |
| `adblock` | `tabsage.adblock` — toggle the blocker on this tab. |
| `cutout` | `tabsage.cutout` — element removal mode on this tab. |
| `clipboard` | `tabsage.clipboard` — read/write the system clipboard. |
| `downloads` | `tabsage.downloads` — hand a URL to the browser's Downloads panel. |
| `badge` | `tabsage.badge` — a badge on this extension's toolbar-menu row. |
| `messaging` | `tabsage.messaging` — cross-tab pub/sub within this extension. |

The `page`, `runtime`, and `shortcuts` groups need **no permission** — they ride
`content_scripts` and are always on `tabsage` in any content script.

A manifest requesting an unknown permission is rejected at install time.

Each `content_scripts` entry:

| Field | Meaning |
| --- | --- |
| `matches` | URL patterns. `<all_urls>` = any http/https page. Globs like `https://*.example.com/*` also work. |
| `js` | Script files to inject, relative to the folder. |
| `css` | Stylesheets to inject (optional). |
| `run_at` | `document_start` (before the page's scripts) or `document_end` (after the DOM is ready). Defaults to `document_end`. |

## Content scripts

Your script may run more than once on the same page (for example after in-page
navigation), so guard against double execution:

```js
(function () {
  if (window.__myExtRan) return;
  window.__myExtRan = true;

  // ... your code ...
})();
```

`console.log`/`console.error` from your script are forwarded to the Extensions
settings panel (see [Seeing your extension work](#seeing-your-extension-work)),
so they double as a status signal.

## The `tabsage` API

If your manifest requests host permissions, your content script gets a `tabsage`
object with the matching capability groups.

> **`tabsage` is an in-scope local variable, not `window.tabsage`.** Referencing
> `window.tabsage` returns `undefined`. Feature-detect the group before using it:

```js
if (typeof tabsage !== "undefined" && tabsage.ai) {
  const reply = await tabsage.ai.chat("Hello!");
}
```

Every method returns a Promise. All data stays on the device. (The `runtime`
group is the exception: its members are plain, synchronous values, not Promises.)

Tab Sage runs on macOS, Windows, and Linux, and the extension API is identical on
all three. For keyboard shortcuts, prefer the `Mod` accelerator so a single
binding works everywhere — it matches Cmd on macOS and Ctrl on Windows and Linux.

> **Method names (v1.1).** The surface was made consistent: `ai.complete` (was
> `ai.prompt`), `notifications.show(...)` (was `notify(...)`), `dialogs.*` (was
> `dialog.*`), and `cutout.enable/disable` (was `start/stop`). The old names
> still work as deprecated aliases; use the canonical names below in new code.
>
> **New in v1.2.** `storage` gained `getAll`/`clear`/`getJSON`/`setJSON`; `tabs`
> gained `reload`/`activate`/`close`; `notifications.show` takes an `opts.timeout`;
> and there are new groups `clipboard`, `downloads`, `badge`, and `messaging`,
> plus the always-on `page`, `runtime`, and `shortcuts` (no permission required).

### `storage`

Per-extension key/value store, namespaced to your id and scoped to the active
profile. Values are strings (stringify your own JSON). Survives reloads.

| Method | Returns |
| --- | --- |
| `tabsage.storage.get(key)` | `string \| null` |
| `tabsage.storage.set(key, value)` | `void` (value ≤ 64 KB) |
| `tabsage.storage.remove(key)` | `void` |
| `tabsage.storage.keys()` | `string[]` |
| `tabsage.storage.getAll()` | `object` — every entry as `{ [key]: value }` |
| `tabsage.storage.clear()` | `void` — removes all of this extension's keys |
| `tabsage.storage.getJSON(key)` | `any \| null` — parses stored JSON (null if absent/invalid) |
| `tabsage.storage.setJSON(key, value)` | `void` — JSON-stringifies `value` (≤ 64 KB) |

```js
await tabsage.storage.set("count", "1");
const raw = await tabsage.storage.get("count");
```

### `ai`

The **same on-device GGUF model that powers Tab Sage's AI sidebar** — identical
runtime and chat template, not a separate or smaller model. Fully offline. `chat`
uses the assistant chat template (better instruction-following); `complete` is a
raw completion.

| Method | Returns | Notes |
| --- | --- | --- |
| `tabsage.ai.chat(message, opts?)` | `string` | Same pipeline and model as the sidebar. `opts.system` sets the persona; `opts.maxTokens` (1–1024, default 768). |
| `tabsage.ai.complete(text, opts?)` | `string` | Raw completion on the same model. `opts.maxTokens` (1–1024, default 512). Alias: `ai.prompt`. |

```js
const answer = await tabsage.ai.chat("Summarize this in 3 bullets:\n" + text, {
  system: "You are a concise summarizer.",
  maxTokens: 200,
});
```

Both require the model downloaded and the runtime set to "llama" (Settings →
Models). Without a model they reject with a message you can show the user — the
recommended pattern is to show AI replies (and errors) in a dialog:

```js
try {
  const reply = await tabsage.ai.chat(question);
  await tabsage.dialogs.alert(reply, "Answer");
} catch (e) {
  const reason = typeof e === "string" ? e : (e && e.message) || "";
  await tabsage.dialogs.alert(
    "Couldn't get an answer.\n\n" + reason +
      "\n\nTip: download the model in Settings → Models and set the runtime to “llama”.",
    "Answer",
  );
}
```

### `tabs`

Tab metadata (URLs/titles only — never content, cookies, history, or passwords)
plus opening a tab.

| Method | Returns | Notes |
| --- | --- | --- |
| `tabsage.tabs.current()` | `{ id, url, title }` | The tab your script runs in. |
| `tabsage.tabs.list()` | `{ id, url, title, active }[]` | All open tabs. |
| `tabsage.tabs.open(url)` | `void` | `http`/`https` only. |
| `tabsage.tabs.reload()` | `void` | Reloads the tab this script runs in. |
| `tabsage.tabs.activate(id)` | `void` | Focus a tab by an `id` from `list()`. |
| `tabsage.tabs.close(id)` | `void` | Close a tab by an `id` from `list()`. |

### `notifications`

| Method | Returns |
| --- | --- |
| `tabsage.notifications.show(title, body, opts?)` | `void` (a short toast). `opts.timeout` = display time in ms (500–15000). |

Alias: `tabsage.notify(title, body)`.

### `dialogs`

Styled in-page modals that work even where a page blocks the native
`alert/confirm/prompt`.

| Method | Returns |
| --- | --- |
| `tabsage.dialogs.alert(message, title?)` | `void` |
| `tabsage.dialogs.confirm(message, title?)` | `boolean` |
| `tabsage.dialogs.prompt(message, default?, title?)` | `string \| null` |

Alias: the whole group is also reachable as `tabsage.dialog.*`.

```js
const name = await tabsage.dialogs.prompt("Your name?", "");
if (name) await tabsage.dialogs.alert("Hi, " + name + "!");
```

### `adblock`

Toggle Tab Sage's built-in ad/content blocker for the current tab, in place (no
reload).

| Method | Returns |
| --- | --- |
| `tabsage.adblock.enable()` | `void` |
| `tabsage.adblock.disable()` | `void` |
| `tabsage.adblock.set(on)` | `void` |

### `cutout`

Start the mode where the user clicks a page section to remove it (Escape exits).

| Method | Returns |
| --- | --- |
| `tabsage.cutout.enable()` | `void` |
| `tabsage.cutout.disable()` | `void` |

Aliases: `cutout.start()` / `cutout.stop()`.

### `clipboard`

Read and write plain text on the system clipboard.

| Method | Returns |
| --- | --- |
| `tabsage.clipboard.writeText(text)` | `void` (falls back to a hidden textarea where needed) |
| `tabsage.clipboard.readText()` | `string` (may reject where the browser blocks clipboard reads) |

```js
await tabsage.clipboard.writeText(document.title);
```

### `downloads`

Hand a URL to the browser's own Downloads panel.

| Method | Returns |
| --- | --- |
| `tabsage.downloads.download(url, filename?)` | `void` — accepts `http(s):`, `blob:`, or `data:` URLs (other schemes rejected); triggers a native anchor-click |

```js
const blob = new Blob([document.body.innerText], { type: "text/plain" });
await tabsage.downloads.download(URL.createObjectURL(blob), "page.txt");
```

### `badge`

A small badge on this extension's row in the toolbar puzzle-icon menu.

| Method | Returns |
| --- | --- |
| `tabsage.badge.set(text, color?)` | `void` — text clipped to 6 chars (empty clears); `color` is a CSS color (hex/name/`rgb()`) |
| `tabsage.badge.clear()` | `void` |
| `tabsage.badge.setColor(color)` | `void` — recolor the current text |

```js
await tabsage.badge.set("3", "#e11d48");
```

### `messaging`

A tiny pub/sub bus carrying JSON between this extension's content scripts in every
open tab. Messages stay within your extension id — nothing routes to another
extension.

| Method | Returns |
| --- | --- |
| `tabsage.messaging.send(channel, data)` | `void` — broadcasts JSON-serializable `data` to every open tab, including the sender's own |
| `tabsage.messaging.onMessage(channel, handler)` | `function` — subscribes `handler(data, channel)`; returns an unsubscribe function |

```js
const off = tabsage.messaging.onMessage("ping", (data) => console.log(data));
await tabsage.messaging.send("ping", { at: Date.now() });
// later: off();
```

### `page`, `runtime`, `shortcuts`

These three groups need **no permission** — they ride `content_scripts` and are
present on `tabsage` in every content script.

**`page`** — the current page's text and metadata:

| Method | Returns |
| --- | --- |
| `tabsage.page.text()` | `string` — `document.body.innerText`, trimmed |
| `tabsage.page.html()` | `string` — `documentElement.outerHTML` |
| `tabsage.page.selection()` | `string` — the current selection text |
| `tabsage.page.meta()` | `{ title, url, description, lang, wordCount, favicon }` |

**`runtime`** — your own manifest. Unlike the rest of the API, these are
**synchronous** — plain values and properties, not Promises:

| Member | Returns |
| --- | --- |
| `tabsage.runtime.id` | `string` (property) |
| `tabsage.runtime.version` | `string` (property) |
| `tabsage.runtime.name` | `string` (property) |
| `tabsage.runtime.manifest` | `{ id, name, version, permissions }` (property) |
| `tabsage.runtime.getManifest()` | `{ id, name, version, permissions }` (same object) |
| `tabsage.runtime.hasPermission(p)` | `boolean` |

**`shortcuts`** — keyboard accelerators:

| Method | Returns |
| --- | --- |
| `tabsage.shortcuts.register(accelerator, handler)` | `function` — runs `handler(event)` on keydown (preventDefault applied); returns an unregister function |
| `tabsage.shortcuts.unregister(accelerator)` | `void` |

Accelerators are `+`-separated and case-insensitive: modifiers `Ctrl`/`Control`,
`Cmd`/`Meta`/`Super`/`Win`, `Alt`/`Option`, `Shift`, and `Mod` (matches **either**
Cmd or Ctrl — prefer it for cross-platform bindings), then the key — e.g.
`"Mod+K"`, `"Ctrl+Shift+K"`, `"Cmd+/"`, `"Alt+Enter"`.

```js
const off = tabsage.shortcuts.register("Mod+K", () => {
  console.log("Selected:", tabsage.page.selection());
});
// later: off();
```

## Seeing your extension work

Open **Settings → Extensions** and click your extension. The detail panel shows:

- whether it **matches the current page**,
- its full manifest (id, homepage, permissions, and each content script's
  matches/js/css/run_at),
- a live **Activity** log — your extension's `console` output and an
  "activated on …" line as it runs.

If several extensions draw overlapping widgets, click an extension in the
toolbar's puzzle-icon menu: the page dims and the extension's UI is spotlighted
with a pulsing highlight so you can see where it is. For that spotlight to find
your UI, append your top-level elements to `document.body` from your content
script's synchronous run (Tab Sage tags them automatically).

## UI placement

Content scripts share the page. If you add a floating widget, pick a corner and a
high `z-index`, and keep it out of the way. The bundled examples deliberately use
different corners so they don't collide:

| Extension | Corner |
| --- | --- |
| `reading-time` | top-right |
| `page-chatbot` | top-left |
| `ai-summarize` | bottom-right |
| `sticky-notes` | bottom-left |
| `word-count` | bottom-center |
| `clipboard-tools` | top-center |
| `tab-switcher` | center-right |

Prefix your element ids/classes (e.g. `ts-myext-…`) so they don't clash with the
page or other extensions.

## UI Kit

Building UI from raw DOM is fine for a single button, but it won't match Tab
Sage and it's a lot of CSS. The **Tab Sage UI Kit** is a drop-in framework that
reproduces Tab Sage's tokens, system fonts, and light/dark themes and gives you
ready-made components — including the Chrome-style **dropdown / dropup / context
menus** and **toolbar-style popups** most extensions want.

It's a single vendored file with no build step, no dependencies, and no network:
everything is exposed on a `TabSageUI` global, styles are injected automatically
and scoped under a `.ts-ui` class so they never leak onto the page, and the theme
follows the OS light/dark setting on its own.

### Install (via GitHub Releases)

The kit ships as release assets on tags named `ui-v*`. Three ways to get it. (The
`tabsage` CLI isn't published to npm yet — run it locally with `node cli/tabsage.mjs`
from a clone of this repo. Once published, `npx @tabsage/cli` will work identically.)

```bash
# 1. Scaffold a new extension already wired for the kit
./create.sh --id my-ext --name "My Ext" --description "…" --author "You" --ui
node cli/tabsage.mjs new my-ext --author "You" --ui

# 2. Add it to an existing extension folder (pins the latest ui-v* release)
node cli/tabsage.mjs ui add extensions/my-ext
node cli/tabsage.mjs ui add extensions/my-ext --version ui-v1.0.0

# 3. By hand: download tabsage-ui.min.js from a release and save it as
#    extensions/my-ext/tabsage-ui.js
```

Then list it **before** your own script so `TabSageUI` exists when it runs:

```json
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["tabsage-ui.js", "content.js"] }
]
```

Pin a specific `ui-v*` version and re-vendor deliberately (`node cli/tabsage.mjs ui update`) —
the file lives in your extension folder, so nothing changes under you. Because a
vendored `tabsage-ui.js` sits inside your own `extensions/<id>/` folder and is
referenced from your manifest, it passes the PR check like any other file.

### A minimal UI Kit extension

```js
(function () {
  if (window.__myExtRan) return;
  window.__myExtRan = true;
  if (typeof TabSageUI === "undefined") return;

  // A themed floating button; in a bottom corner its menu opens upward.
  TabSageUI.launcher({
    label: "My Ext",
    icon: "sparkle",
    corner: "bottom-right",
    menu: [
      { label: "Do it", icon: "sparkle", onClick: () => TabSageUI.toast("Done", { variant: "ok" }) },
      { label: "Settings", icon: "settings", onClick: () => {} },
      "separator",
      { label: "Remove", icon: "trash", danger: true, onClick: () => {} },
    ],
  });
})();
```

### Components

Overlays and the launcher theme themselves; place primitives inside a
`TabSageUI.root()` container, a popup body, or a modal.

#### Theme

| Call | Effect |
| --- | --- |
| `TabSageUI.setTheme("light" \| "dark" \| "auto")` | Force a theme or follow the OS (`auto`, default). |
| `TabSageUI.getTheme()` | Current mode. |
| `TabSageUI.root(extraClass?)` | A themed `.ts-ui` container to fill. |

#### Primitives

Each returns a DOM node.

| Call | Notes |
| --- | --- |
| `button({ label, variant, icon, onClick, disabled, title })` | `variant`: `primary` / `ghost` / `danger`. |
| `iconButton({ icon, title, onClick, variant })` | 32×32; `variant`: `active` / `accent`. |
| `input({ placeholder, value, type, onInput, onEnter })` · `textarea({ … })` | |
| `switch({ label, checked, onChange })` | Alias `toggle`. `.tsGet()` / `.tsSet(v)`. |
| `select({ options, value, onChange })` | `options: {value,label}[]`. `.tsGet()` / `.tsSet(v)`. |
| `card({ title, children })` · `chip({ label, status })` · `badge(text)` | `status`: `ok` / `warn` / `danger`. |
| `icon(name)` | e.g. `sparkle, settings, search, send, trash, copy, check, close, chevron-down, info, alert, lock, puzzle`. |

#### Menus (dropdown, dropup, context)

All three come from one call.

| Call | Notes |
| --- | --- |
| `menu({ items, anchor, placement })` | `placement`: `auto` / `down` / `up`. `auto` flips to a **dropup** near the viewport bottom, and right-aligns near the edge. Returns `{ el, close }`. |
| `dropdown(triggerEl, items)` / `dropup(triggerEl, items)` | Force direction. |
| `contextMenu(elOrEvent, items)` | Use from a `contextmenu` handler. |

Item: `{ label, icon?, onClick?, danger?, disabled?, shortcut?, keepOpen? }`, the
string `"separator"`, or `{ heading: true, label }`.

#### Overlays

| Call | Notes |
| --- | --- |
| `popup({ anchor, title, content, footer, width, placement })` | Toolbar-style panel anchored to a button. Returns `{ el, body, close }`. |
| `launcher({ label, icon, corner, menu \| popup, onClick })` | Floating corner button. `corner`: `top-left` / `top-right` / `bottom-left` / `bottom-right` / `bottom-center`. Pass `menu` (items array) or `popup` (config object, or a function returning one); clicking toggles it. |
| `modal({ title, body, actions })` | `actions: { label, variant?, onClick?, close? }[]`. Dismiss on scrim click or Esc. |
| `toast(message, { variant, timeout })` · `tooltip(el, label)` | |

Prefer writing markup? The same styles are available as classes under a `.ts-ui`
root (`ts-btn`, `ts-menu`, `ts-popup`, …) using the `--ts-*` tokens; ship
`tabsage-ui.css` alongside if you use classes without the JS. Full reference:
[ui-kit/README.md](ui-kit/README.md). Working example: the `ui-kit-demo`
extension.

## Security & privacy

- Extensions **cannot** read Tab Sage's saved passwords, autofill, cookies,
  history, bookmarks, or any security/privacy/parental settings. No permission
  exposes them.
- `storage` is namespaced per extension — you can't read another extension's data.
- `tabs` is metadata only.
- Content scripts run in the page world, so the `tabsage` bridge is technically
  reachable by page script too; that's why it exposes no secret surfaces.
- Everything runs on-device. If your extension makes a network request, it's
  visible in your source and is part of review.
- No extension runs in incognito tabs.

## Testing locally

You don't need this repo to develop. Put your folder anywhere, open **Settings →
Extensions → Load unpacked**, and point at it — it installs immediately. After
editing, load it again to pick up changes, then reload the page you're testing.
Test in a normal (non-incognito) tab.

## A complete example

A minimal AI extension that answers a question about the page in a dialog
(`permissions: ["content_scripts", "ai", "dialogs"]`):

```js
(function () {
  if (window.__askPageRan) return;
  window.__askPageRan = true;
  if (typeof tabsage === "undefined" || !tabsage.ai || !tabsage.dialogs) return;

  var btn = document.createElement("button");
  btn.textContent = "Ask AI";
  btn.style.cssText =
    "position:fixed;left:16px;top:16px;z-index:2147483646;padding:8px 14px;" +
    "border:0;border-radius:999px;background:#0ea5e9;color:#fff;cursor:pointer";
  btn.addEventListener("click", async function () {
    var q = await tabsage.dialogs.prompt("Ask about this page:", "");
    if (!q) return;
    try {
      var text = (document.body.innerText || "").slice(0, 4000);
      var a = await tabsage.ai.chat("Page:\n" + text + "\n\nQ: " + q, {
        system: "Answer concisely using only the page text.",
        maxTokens: 300,
      });
      await tabsage.dialogs.alert(a, "Answer");
    } catch (e) {
      await tabsage.dialogs.alert("Couldn't answer: " + e, "Answer");
    }
  });
  document.body.appendChild(btn);
})();
```

A second example uses three of the newer groups: a keyboard shortcut (no
permission) that copies the page title to the clipboard and flashes a badge
(`permissions: ["content_scripts", "clipboard", "badge"]`):

```js
(function () {
  if (window.__copyTitleRan) return;
  window.__copyTitleRan = true;
  if (typeof tabsage === "undefined" || !tabsage.clipboard || !tabsage.badge) return;

  // Mod matches Cmd on macOS and Ctrl on Windows/Linux.
  tabsage.shortcuts.register("Mod+Shift+C", async function () {
    await tabsage.clipboard.writeText(document.title);
    await tabsage.badge.set("OK", "#16a34a");
    setTimeout(function () { tabsage.badge.clear(); }, 1500);
  });
})();
```

See the `extensions/` folder for the full working versions: `reading-time`,
`word-count`, `sticky-notes`, `ai-summarize`, `page-chatbot`, `clipboard-tools`
(clipboard + badge + shortcuts), and `tab-switcher` (tabs control + messaging).

## Submitting

1. Fork this repository.
2. Add your extension as a single new folder under `extensions/`, named to match
   your manifest `id`.
3. Open a pull request that touches only your own folder.

Every pull request runs an automated check (`.github/workflows/validate-extension.yml`)
before review. It must pass, and it enforces:

- exactly **one** `extensions/<id>/` folder changed, nothing outside it;
- a valid manifest (`id` == folder name and `^[a-z0-9-]+$`, required fields
  present, known permissions, referenced `js`/`css` files exist, `version` is
  `MAJOR.MINOR.PATCH`);
- a **new** extension's folder name is unique;
- an **update** **increases** `version` above the currently published one.

### Updating your extension

An update is just another pull request from you that changes only your folder.
**Bump `version`** (the check rejects an equal or lower version) and note the
change in your extension's `README.md`. Because a reused folder name reads as an
update, choose a unique `id` for a brand-new extension.

Spyxpo reviews every PR before merging; small, readable extensions get through
faster. See [README.md](README.md#submitting-an-extension) for the full rules.
