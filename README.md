# Tab Sage Extensions

This is the official extension registry for [Tab Sage](https://www.spyxpo.com/downloads/tab-sage), a privacy-first browser that runs its AI entirely on your device.

Every extension in this repository lives in its own folder under `extensions/`, was submitted by its author through a pull request, and was reviewed by Spyxpo before being merged. Tab Sage reads its extension catalog directly from this repository, so anything you see here is what users can install from Settings > Extensions inside the browser.

Because all extension source code is public, you can read exactly what an extension does before you install it. There is no store backend, no accounts, and no tracking. The only network request Tab Sage makes for extensions is fetching this repository's contents, and it only does that while you have the Extensions page open.

## How extensions work

A Tab Sage extension is a folder containing a `manifest.json` file and the scripts and stylesheets it references. When a page loads in a normal tab, Tab Sage checks the page URL against each enabled extension's match patterns and injects the matching content scripts and CSS into the page.

Extensions do not run in incognito tabs. They cannot reach your passwords, history, bookmarks, or cookies. A content script runs inside the web page with the same access an ordinary script on that page would have — plus, if the manifest asks for them, a small set of opt-in host capabilities through the `tabsage` API: per-extension storage, the on-device AI model, tab metadata, and notifications (see [The tabsage API](#the-tabsage-api)). Nothing else.

Installing, enabling, disabling, and removing extensions happens in Settings > Extensions, where you can also search installed and catalog extensions, open any extension to see its full manifest, and watch its live activity — an extension's activation and console output show up there so you can confirm it is working. The puzzle icon in the toolbar lists your installed extensions with quick enable and disable toggles and links to the same settings page. Changes take effect the next time a page loads.

## Repository layout

```text
extensions/
  reading-time/
    manifest.json
    content.js
    style.css
    README.md
```

One folder per extension. The folder name must equal the `id` in the manifest.

## Writing an extension

Start by copying `extensions/reading-time/`. It is a complete working extension in about sixty lines and covers everything the format supports.

Every extension needs a `manifest.json`:

```json
{
  "id": "reading-time",
  "name": "Reading Time",
  "version": "1.0.0",
  "description": "Shows an estimated reading time on articles.",
  "author": "Your Name",
  "homepage": "https://github.com/your-name",
  "permissions": ["content_scripts"],
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
| `id` | yes | Unique identifier. Lowercase letters, digits, and hyphens only. Must match the folder name. |
| `name` | yes | Display name shown in the extension manager. |
| `version` | yes | Semantic version, for example `1.0.0`. Bump it with every update. |
| `description` | yes | One or two sentences describing what the extension does. |
| `author` | yes | Your name or handle. |
| `homepage` | no | Link to your site or profile. |
| `permissions` | yes | What the extension needs. `content_scripts` is required to inject anything; add `storage`, `ai`, `tabs`, and/or `notifications` to use the matching parts of the `tabsage` API (see [The tabsage API](#the-tabsage-api)). |
| `content_scripts` | yes | Which scripts and styles run on which pages. See below. |

Each entry in `content_scripts` takes:

| Field | Meaning |
| --- | --- |
| `matches` | URL patterns the scripts apply to. `<all_urls>` matches every http and https page. You can also use globs such as `https://*.example.com/*` or `https://example.com/articles/*`. |
| `js` | Script files to inject, relative to the extension folder. |
| `css` | Stylesheets to inject. Optional. |
| `run_at` | `document_start` to run before the page's own scripts, or `document_end` to run after the DOM is ready. Defaults to `document_end`. |

A few practical notes:

- Your script may run more than once on the same page (for example after in-page navigation), so guard against double execution. The example extension shows one way to do this.
- Keep extensions dependency free. There is no build step. What is in the folder is what runs.
- Each extension folder should include a `README.md` that says what the extension does, which pages it touches, and lists changes per version. Reviewers read it, and so do users deciding whether to install.

A manifest that requests an unknown permission is rejected at install time, so an older browser never silently ignores a capability your extension depends on.

## The tabsage API

Inside a content script your code gets a `tabsage` object with the capabilities your manifest asked for. Each capability is a permission you add to `permissions` alongside `content_scripts`. If you don't request a permission, that part of the API is simply absent, so feature-detect before you call:

```js
if (tabsage.storage) {
  await tabsage.storage.set("seen", "1");
}
```

Every method returns a Promise. All data stays on the device.

### `storage` — per-extension key/value

A small persistent store, namespaced to your extension id and scoped to the active profile. Values are strings (stringify your own JSON). Survives reloads and restarts.

| Method | Returns | Notes |
| --- | --- | --- |
| `tabsage.storage.get(key)` | `string \| null` | The stored value, or null. |
| `tabsage.storage.set(key, value)` | `void` | Value must be a string ≤ 64 KB. |
| `tabsage.storage.remove(key)` | `void` | |
| `tabsage.storage.keys()` | `string[]` | All keys you've stored. |

### `ai` — the on-device model

Prompt the same local model that powers Tab Sage's assistant. Runs fully offline; no network, no accounts.

| Method | Returns | Notes |
| --- | --- | --- |
| `tabsage.ai.prompt(text, opts?)` | `string` | `opts.maxTokens` caps the reply (1–1024, default 512). Prompt is capped at 8000 chars. |

```js
const summary = await tabsage.ai.prompt("Summarize in one line: " + document.title);
```

### `tabs` — tab metadata

Read-only page/tab information plus opening a new tab. Metadata only — never history, cookies, passwords, or bookmarks.

| Method | Returns | Notes |
| --- | --- | --- |
| `tabsage.tabs.current()` | `{ id, url, title }` | The tab your script runs in (resolved in-page). |
| `tabsage.tabs.list()` | `{ id, url, title, active }[]` | All open tabs. |
| `tabsage.tabs.open(url)` | `void` | Opens a new tab. `http`/`https` only. |

### `notifications` — a toast

| Method | Returns | Notes |
| --- | --- | --- |
| `tabsage.notify(title, body)` | `void` | Shows a short toast in the browser UI. |

### Security model

Content scripts run in the page's own JavaScript world, not an isolated one, so the `tabsage` bridge is technically reachable by page script too. Because of that, the API deliberately exposes **no secret surfaces**: there is no access to history, cookies, passwords, or bookmarks, `storage` is namespaced per extension id, and inputs are size-capped. `tabs` returns only URLs and titles. The trust model is the same as the rest of the registry: every extension is public and reviewed before it is merged, so what an extension does with these capabilities is auditable in its source. Extensions still never run in incognito tabs.

## Testing locally

You do not need this repository to develop an extension. Put your extension folder anywhere on disk, open Tab Sage, go to Settings > Extensions, and use "Load unpacked" to point at the folder. The extension installs immediately.

After you edit your files, load the folder again to pick up the changes, then reload the page you are testing against. Extensions never run in incognito tabs, so test in a normal one.

## Submitting an extension

1. Fork this repository.
2. Add your extension as a single new folder under `extensions/`. The folder name must match your manifest `id`.
3. Open a pull request.

Rules for pull requests:

- One extension per pull request.
- Only touch your own extension's folder. Pull requests that modify another author's extension, or anything outside `extensions/`, will be closed. This rule exists so that no update can slip malicious code into someone else's extension.
- The extension must be your own work, and you must be fine with it being public under this repository.
- Updates to an existing extension go through the same process: a pull request from the original author that bumps `version` and notes the changes in the extension's `README.md`.

## Review and verification

Spyxpo reviews every pull request before merging. We read the code and check that:

- The extension does what its description and README say, and nothing else.
- It does not exfiltrate page content, inject remote scripts, or phone home.
- It does not break pages it matches or degrade browser performance in an obvious way.
- The manifest is valid and the requested permissions match what the code actually uses.

A merged extension is a verified extension. That is the entire verification model: merged means reviewed, and the source stays public so anyone can check our work. If you find a problem in a published extension, open an issue here.

Review is done by people and takes time. Small, readable extensions get through faster than clever ones.

## Privacy

Tab Sage is local-first and has no telemetry, and the extension system follows the same rules. There is no tracking of installs, no analytics, and no server other than GitHub itself. The catalog is fetched only while the Extensions settings page is open, never in the background. Extension code runs on your machine, sandboxed inside the page it was injected into. If an extension needs to talk to the network, that traffic is visible in its source code in this repository, and it is part of what we review.

## Questions

Open an issue in this repository for questions about the extension format or the submission process. Bugs in the browser itself belong in the [Tab Sage repository](https://github.com/Spyxpo/tabsage-extensions/issues).
