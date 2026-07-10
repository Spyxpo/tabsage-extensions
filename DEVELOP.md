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
- [Seeing your extension work](#seeing-your-extension-work)
- [UI placement](#ui-placement)
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
./create.sh --id my-extension --name "My Extension" \
  --description "What it does." --author "Your Name" \
  --permissions content_scripts,ai,dialogs
```

Run `./create.sh` with no arguments to be prompted for each field. It creates
`extensions/<id>/` with a `manifest.json`, a guarded `content.js`, a `style.css`,
and a `README.md`. Then load it: in Tab Sage go to **Settings → Extensions →
Load unpacked** and point at the folder.

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
| `version` | yes | Semantic version, e.g. `1.0.0`. Bump it on every update. |
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
| `ai` | `tabsage.ai` — the on-device model (chat/prompt). |
| `tabs` | `tabsage.tabs` — tab metadata + open a tab. |
| `notifications` | `tabsage.notify` — a toast. |
| `dialogs` | `tabsage.dialog` — alert/confirm/prompt modals. |
| `adblock` | `tabsage.adblock` — toggle the blocker on this tab. |
| `cutout` | `tabsage.cutout` — element removal mode on this tab. |

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

Every method returns a Promise. All data stays on the device.

### `storage`

Per-extension key/value store, namespaced to your id and scoped to the active
profile. Values are strings (stringify your own JSON). Survives reloads.

| Method | Returns |
| --- | --- |
| `tabsage.storage.get(key)` | `string \| null` |
| `tabsage.storage.set(key, value)` | `void` (value ≤ 64 KB) |
| `tabsage.storage.remove(key)` | `void` |
| `tabsage.storage.keys()` | `string[]` |

```js
await tabsage.storage.set("count", "1");
const raw = await tabsage.storage.get("count");
```

### `ai`

The same on-device model that powers Tab Sage's AI sidebar (the "chatbot"). Fully
offline. `chat` uses the assistant chat template (better instruction-following);
`prompt` is a raw completion.

| Method | Returns | Notes |
| --- | --- | --- |
| `tabsage.ai.chat(message, opts?)` | `string` | `opts.system` sets the persona; `opts.maxTokens` (1–1024, default 768). |
| `tabsage.ai.prompt(text, opts?)` | `string` | `opts.maxTokens` (1–1024, default 512). |

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
  await tabsage.dialog.alert(reply, "Answer");
} catch (e) {
  const reason = typeof e === "string" ? e : (e && e.message) || "";
  await tabsage.dialog.alert(
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

### `notifications`

| Method | Returns |
| --- | --- |
| `tabsage.notify(title, body)` | `void` (a short toast) |

### `dialogs`

Styled in-page modals that work even where a page blocks the native
`alert/confirm/prompt`.

| Method | Returns |
| --- | --- |
| `tabsage.dialog.alert(message, title?)` | `void` |
| `tabsage.dialog.confirm(message, title?)` | `boolean` |
| `tabsage.dialog.prompt(message, default?, title?)` | `string \| null` |

```js
const name = await tabsage.dialog.prompt("Your name?", "");
if (name) await tabsage.dialog.alert("Hi, " + name + "!");
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
| `tabsage.cutout.start()` | `void` |
| `tabsage.cutout.stop()` | `void` |

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

Prefix your element ids/classes (e.g. `ts-myext-…`) so they don't clash with the
page or other extensions.

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
  if (typeof tabsage === "undefined" || !tabsage.ai || !tabsage.dialog) return;

  var btn = document.createElement("button");
  btn.textContent = "Ask AI";
  btn.style.cssText =
    "position:fixed;left:16px;top:16px;z-index:2147483646;padding:8px 14px;" +
    "border:0;border-radius:999px;background:#0ea5e9;color:#fff;cursor:pointer";
  btn.addEventListener("click", async function () {
    var q = await tabsage.dialog.prompt("Ask about this page:", "");
    if (!q) return;
    try {
      var text = (document.body.innerText || "").slice(0, 4000);
      var a = await tabsage.ai.chat("Page:\n" + text + "\n\nQ: " + q, {
        system: "Answer concisely using only the page text.",
        maxTokens: 300,
      });
      await tabsage.dialog.alert(a, "Answer");
    } catch (e) {
      await tabsage.dialog.alert("Couldn't answer: " + e, "Answer");
    }
  });
  document.body.appendChild(btn);
})();
```

See the `extensions/` folder for the full working versions: `reading-time`,
`word-count`, `sticky-notes`, `ai-summarize`, and `page-chatbot`.

## Submitting

1. Fork this repository.
2. Add your extension as a single new folder under `extensions/`, named to match
   your manifest `id`.
3. Open a pull request that touches only your own folder.

Bump `version` and note changes in your extension's `README.md` for updates.
Spyxpo reviews every PR before merging; small, readable extensions get through
faster. See [README.md](README.md#submitting-an-extension) for the full rules.
