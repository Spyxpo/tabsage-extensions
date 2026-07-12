# Tab Sage UI Kit

A drop-in UI/UX framework for **Tab Sage** extensions. It reproduces Tab Sage's
own look — design tokens, system fonts, and light/dark themes — and gives you
ready-made **buttons, inputs, cards, switches, selects, lists, fields, sections,
inline notices, spinners, keyboard hints, Chrome-style dropdown / dropup / context
menus, toolbar-style popups, a corner launcher, modals and toasts**. One vendored
file, no build step, no dependencies, no network.

> Product name is **Tab Sage**; the global is `TabSageUI`, CSS classes are
> prefixed `ts-`, and the CLI binary is `tabsage`.

Extensions run inside the browsed page, in a separate document from Tab Sage's
own UI, so they can't see the app's stylesheet. This kit ports that design
system into a self-contained file you ship with your extension.

## Install (via GitHub Releases)

The kit is published as release assets on tags named `ui-v*`.

1. Download **`tabsage-ui.min.js`** from a
   [release](https://github.com/Spyxpo/tabsage-extensions/releases) and drop it
   into your `extensions/<id>/` folder.
2. List it **before** your own script in the manifest:

   ```json
   "content_scripts": [
     { "matches": ["<all_urls>"], "js": ["tabsage-ui.js", "content.js"] }
   ]
   ```

Or let the CLI do it. The `@tabsage/cli` package isn't on npm yet — run it locally
from a clone of this repo (from the repo root); once published, `npx @tabsage/cli`
will work identically.

```bash
# scaffold a new extension already wired for the kit
node cli/tabsage.mjs new my-ext --ui --author "You"

# or add the kit to an existing extension folder
node cli/tabsage.mjs ui add extensions/my-ext            # latest ui-v* release
node cli/tabsage.mjs ui add extensions/my-ext --version ui-v1.0.0
```

The file **self-injects its stylesheet** on first use and **follows the OS
light/dark setting** automatically, so `TabSageUI.*` is all you need.

## Quick start

```js
// content.js
if (typeof TabSageUI !== "undefined") {
  TabSageUI.launcher({
    label: "My Ext",
    icon: "sparkle",
    corner: "bottom-right",     // its menu opens upward from a bottom corner
    menu: [
      { label: "Summarize", icon: "sparkle", onClick: () => TabSageUI.toast("Done", { variant: "ok" }) },
      { label: "Settings", icon: "settings", onClick: () => {} },
      "separator",
      { label: "Remove", icon: "trash", danger: true, onClick: () => {} },
    ],
  });
}
```

## API

Every factory returns a DOM node (or a `{ el, close }` handle for overlays).
Place primitives inside a themed container from `TabSageUI.root()`, a popup body,
or a modal — overlays and the launcher theme themselves.

### Theming
| Call | Effect |
| --- | --- |
| `TabSageUI.setTheme("light" \| "dark" \| "auto")` | Force a theme or follow the OS (`auto`, the default). |
| `TabSageUI.getTheme()` | Current mode. |
| `TabSageUI.root(extraClass?)` | A themed `.ts-ui` container to fill with primitives. |

### Primitives
| Call | Notes |
| --- | --- |
| `button({ label, variant, icon, onClick, disabled, title })` | `variant`: `"primary" \| "ghost" \| "danger"`. |
| `iconButton({ icon, title, onClick, variant })` | 32×32 icon button; `variant`: `"active" \| "accent"`. |
| `input({ placeholder, value, type, onInput, onEnter })` | |
| `textarea({ placeholder, value, rows, onInput })` | |
| `switch({ label, checked, onChange })` | Alias: `toggle`. `.tsGet()/.tsSet(v)`. |
| `select({ options, value, onChange, placeholder })` | `options: {value,label}[]`. `.tsGet()/.tsSet(v)`. |
| `card({ title, children, muted })` · `chip({ label, status })` · `badge(text)` | `status`: `"ok" \| "warn" \| "danger"`. |
| `list({ items })` | Vertical list (open tabs, storage entries). `items` are `listItem` configs or DOM nodes. |
| `listItem({ icon, label, sublabel, trailing, onClick })` | One row; renders as a `<button>` when `onClick` is given, else a `<div>`. `trailing` is a string or node (e.g. a `badge`/`kbd`). |
| `field({ label, control, hint })` | Labeled control with an optional hint line. `control` is a node/array (input, select, switch…). |
| `section({ title, children })` · `divider()` | Grouping block with an uppercase title / a horizontal rule. |
| `spinner({ size })` | Indeterminate spinner. `size` is px (number) or any CSS length; defaults to 16px. |
| `kbd(text)` | Keyboard-shortcut chip. Splits on `+`, e.g. `kbd("Ctrl+K")` renders `Ctrl` `+` `K`. |
| `notice({ text, variant })` | Inline banner. `variant`: `"ok" \| "info" \| "warn" \| "danger"` (default `info`). Alias: `banner`. |
| `icon(name)` | Returns an `<svg>`. Names: `sparkle, settings, search, send, trash, copy, check, close, chevron-down/up/right, info, alert, lock, home, plus, reload, refresh, puzzle, pencil, bookmark, back, forward, download, clipboard, bell, keyboard, layers, external-link, x-circle`. |

### Menus (dropdown / dropup / context)
| Call | Notes |
| --- | --- |
| `menu({ items, anchor, placement })` | `placement`: `"auto" \| "down" \| "up"`. `auto` flips to a **dropup** near the viewport bottom. Returns `{ el, close }`. |
| `dropdown(triggerEl, items)` / `dropup(triggerEl, items)` | Force direction. |
| `contextMenu(elOrEvent, items)` | For `contextmenu` handlers. |

Item shape: `{ label, icon?, onClick?, danger?, disabled?, shortcut?, keepOpen? }`,
the string `"separator"`, or `{ heading: true, label }`.

### Overlays
| Call | Notes |
| --- | --- |
| `popup({ anchor, title, content, footer, width, placement })` | Toolbar-style panel anchored to a button. Returns `{ el, body, close }`. |
| `launcher({ label, icon, corner, menu \| popup, onClick })` | Floating FAB. `corner`: `top-left/top-right/bottom-left/bottom-right/bottom-center`. `menu` is an items array; `popup` is a config object or a function returning one; clicking toggles it. |
| `modal({ title, body, actions })` | `actions: { label, variant?, onClick?, close? }[]`. Returns `{ el, body, close }`. |
| `toast(message, { variant, timeout })` | `variant`: `"ok" \| "warn" \| "danger"`. |
| `tooltip(targetEl, label)` | Hover tooltip. |

### CSS classes

If you'd rather write markup, the same styles are available as classes under a
`.ts-ui` root: `ts-btn` (`--primary/--ghost/--danger`), `ts-iconbtn`, `ts-input`,
`ts-textarea`, `ts-field`, `ts-card`, `ts-chip`, `ts-badge`, `ts-switch`,
`ts-list` (`ts-listitem`), `ts-section`, `ts-divider`, `ts-spin`, `ts-kbd`,
`ts-notice` (`--ok/--info/--warn/--danger`), `ts-menu`, `ts-popup`, `ts-modal`,
`ts-toast`, `ts-tooltip`. Tokens: `--ts-bg`, `--ts-fg`,
`--ts-accent`, `--ts-border`, `--ts-radius-md`, … (see `src/tokens.css`). Ship
`tabsage-ui.css` alongside if you use classes without the JS.

## Local development

```bash
node ui-kit/build.mjs      # rebuild dist/ from src/
open ui-kit/examples/demo.html   # preview every component in light + dark
```

`src/` is the source (`tokens.css`, `base.css`, `components.css`, `icons.js`,
`tabsage-ui.js`); `build.mjs` concatenates it into `dist/`, embedding the
minified CSS into the JS so the shipped file is self-contained. To cut a release,
push a tag like `ui-v1.0.0` — `.github/workflows/release-ui-kit.yml` builds and
attaches the assets.
