var TS_ICONS = {
  back: '<path d="M15 18l-6-6 6-6"/>',
  forward: '<path d="M9 6l6 6-6 6"/>',
  reload: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>',
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  "chevron-down": '<path d="M6 9l6 6 6-6"/>',
  "chevron-up": '<path d="M6 15l6-6 6 6"/>',
  "chevron-right": '<path d="M9 6l6 6-6 6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  settings:
    '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.2.6.8 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  sparkle: '<path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4z"/>',
  send: '<path d="M19 12l-14-7 4 7-4 7z"/>',
  trash:
    '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  alert:
    '<path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.42 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  puzzle:
    '<path d="M9 3a2 2 0 0 1 4 0c0 .7.5 1 1 1h2a1 1 0 0 1 1 1v2c0 .5.3 1 1 1a2 2 0 0 1 0 4c-.7 0-1 .5-1 1v3a1 1 0 0 1-1 1h-3c-.5 0-1-.3-1-1a2 2 0 0 0-4 0c0 .7-.5 1-1 1H4a1 1 0 0 1-1-1v-3c0-.5-.3-1-1-1a2 2 0 0 1 0-4c.7 0 1-.5 1-1V5a1 1 0 0 1 1-1h2c.5 0 1-.3 1-1z"/>',
  pencil:
    '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  bookmark: '<path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/>',
};
if (typeof module !== "undefined" && module.exports) {
  module.exports = TS_ICONS;
}
(function (global) {
  "use strict";
  if (global.TabSageUI && global.__TabSageUILoaded) return;
  var VERSION = "1.0.0";
  var CSS = ".ts-ui{--ts-font-ui:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,Inter,\"Helvetica Neue\",Arial,sans-serif;--ts-font-mono:ui-monospace,SFMono-Regular,\"JetBrains Mono\",Menlo,Consolas,monospace;--ts-radius-sm:6px;--ts-radius-md:10px;--ts-radius-lg:14px;--ts-shadow-1:0 1px 2px rgba(0,0,0,0.06);--ts-shadow-2:0 8px 24px rgba(0,0,0,0.12);--ts-transition:160ms cubic-bezier(0.2,0.8,0.2,1);color-scheme:light;--ts-bg:#f6f7f9;--ts-bg-elev:#ffffff;--ts-bg-subtle:#eef0f4;--ts-fg:#14161a;--ts-fg-muted:#5b6271;--ts-fg-faint:#8a92a3;--ts-border:#e3e6eb;--ts-border-strong:#cdd2db;--ts-accent:#4f7cff;--ts-accent-fg:#ffffff;--ts-accent-soft:rgba(79,124,255,0.12);--ts-danger:#d6444d;--ts-ok:#2eb87a;--ts-warn:#d99021}@media (prefers-color-scheme:dark){.ts-ui:not([data-ts-theme=\"light\"]){color-scheme:dark;--ts-bg:#0f1115;--ts-bg-elev:#161922;--ts-bg-subtle:#1c2030;--ts-fg:#e7e9ee;--ts-fg-muted:#a3a9b9;--ts-fg-faint:#6c7385;--ts-border:#262a37;--ts-border-strong:#353a4a;--ts-accent:#6c8fff;--ts-accent-fg:#0a0d14;--ts-accent-soft:rgba(108,143,255,0.18);--ts-danger:#ff6a72;--ts-ok:#45d39a;--ts-warn:#ffb44a}}.ts-ui[data-ts-theme=\"dark\"]{color-scheme:dark;--ts-bg:#0f1115;--ts-bg-elev:#161922;--ts-bg-subtle:#1c2030;--ts-fg:#e7e9ee;--ts-fg-muted:#a3a9b9;--ts-fg-faint:#6c7385;--ts-border:#262a37;--ts-border-strong:#353a4a;--ts-accent:#6c8fff;--ts-accent-fg:#0a0d14;--ts-accent-soft:rgba(108,143,255,0.18);--ts-danger:#ff6a72;--ts-ok:#45d39a;--ts-warn:#ffb44a}.ts-ui,.ts-ui *{box-sizing:border-box}.ts-ui{font-family:var(--ts-font-ui);font-size:14px;line-height:1.45;color:var(--ts-fg);-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;-webkit-text-size-adjust:100%}.ts-ui.ts-layer{position:fixed;z-index:2147483000}.ts-ui button,.ts-ui input,.ts-ui textarea,.ts-ui select{font-family:inherit;font-size:inherit;color:inherit}.ts-ui a{color:var(--ts-accent);text-decoration:none}.ts-ui a:hover{text-decoration:underline}.ts-ui:focus-visible{outline:none;box-shadow:0 0 0 3px var(--ts-accent-soft)}.ts-ui .ts-mono{font-family:var(--ts-font-mono)}.ts-ui .ts-muted{color:var(--ts-fg-muted)}.ts-ui .ts-faint{color:var(--ts-fg-faint)}.ts-ui .ts-row{display:flex;align-items:center;gap:8px}.ts-ui .ts-col{display:flex;flex-direction:column;gap:8px}.ts-ui .ts-grow{flex:1 1 auto}.ts-ui .ts-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:6px 12px;font-size:13px;font-weight:500;line-height:1;color:var(--ts-fg);background:var(--ts-bg-elev);border:1px solid var(--ts-border);border-radius:var(--ts-radius-md);cursor:pointer;user-select:none;transition:background var(--ts-transition),border-color var(--ts-transition),color var(--ts-transition),transform var(--ts-transition)}.ts-ui .ts-btn:hover{border-color:var(--ts-border-strong)}.ts-ui .ts-btn:active{transform:translateY(0.5px)}.ts-ui .ts-btn:disabled{opacity:0.5;cursor:not-allowed}.ts-ui .ts-btn svg{width:16px;height:16px}.ts-ui .ts-btn--primary{color:var(--ts-accent-fg);background:var(--ts-accent);border-color:transparent}.ts-ui .ts-btn--primary:hover{filter:brightness(1.05);border-color:transparent}.ts-ui .ts-btn--ghost{background:transparent;border-color:transparent}.ts-ui .ts-btn--ghost:hover{background:var(--ts-bg-subtle);border-color:transparent}.ts-ui .ts-btn--danger{color:#fff;background:var(--ts-danger);border-color:transparent}.ts-ui .ts-btn--danger:hover{filter:brightness(1.05);border-color:transparent}.ts-ui .ts-iconbtn{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;padding:0;color:var(--ts-fg);background:transparent;border:1px solid transparent;border-radius:var(--ts-radius-md);cursor:pointer;transition:background var(--ts-transition),color var(--ts-transition)}.ts-ui .ts-iconbtn:hover{background:var(--ts-bg-subtle)}.ts-ui .ts-iconbtn svg{width:18px;height:18px}.ts-ui .ts-iconbtn--active{color:var(--ts-accent);background:var(--ts-accent-soft)}.ts-ui .ts-iconbtn--accent{color:var(--ts-accent-fg);background:var(--ts-accent)}.ts-ui .ts-input,.ts-ui .ts-textarea{width:100%;padding:8px 10px;font-size:13px;color:var(--ts-fg);background:var(--ts-bg-elev);border:1px solid var(--ts-border);border-radius:var(--ts-radius-md);transition:border-color var(--ts-transition),box-shadow var(--ts-transition)}.ts-ui .ts-textarea{min-height:72px;resize:vertical;line-height:1.45}.ts-ui .ts-input::placeholder,.ts-ui .ts-textarea::placeholder{color:var(--ts-fg-faint)}.ts-ui .ts-input:focus,.ts-ui .ts-textarea:focus{outline:none;border-color:var(--ts-accent);box-shadow:0 0 0 3px var(--ts-accent-soft)}.ts-ui .ts-field{display:flex;flex-direction:column;gap:6px}.ts-ui .ts-field__label{font-size:12px;font-weight:500;color:var(--ts-fg-muted)}.ts-ui .ts-card{padding:14px;background:var(--ts-bg-elev);border:1px solid var(--ts-border);border-radius:var(--ts-radius-lg);box-shadow:var(--ts-shadow-1)}.ts-ui .ts-card--muted{background:var(--ts-bg-subtle)}.ts-ui .ts-card__title{margin:0 0 8px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:var(--ts-fg-muted)}.ts-ui .ts-panel{display:flex;flex-direction:column;gap:12px}.ts-ui .ts-chip{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;font-size:12px;color:var(--ts-fg-muted);background:var(--ts-bg-subtle);border:1px solid var(--ts-border);border-radius:999px}.ts-ui .ts-chip__dot{width:6px;height:6px;border-radius:999px;background:var(--ts-fg-faint)}.ts-ui .ts-chip__dot.is-ok{background:var(--ts-ok)}.ts-ui .ts-chip__dot.is-warn{background:var(--ts-warn)}.ts-ui .ts-chip__dot.is-danger{background:var(--ts-danger)}.ts-ui .ts-badge{display:inline-flex;align-items:center;padding:2px 8px;font-size:11px;font-weight:600;color:var(--ts-accent);background:var(--ts-accent-soft);border-radius:999px}.ts-ui .ts-switch{position:relative;display:inline-flex;align-items:center;gap:8px;cursor:pointer;user-select:none;font-size:13px}.ts-ui .ts-switch input{position:absolute;opacity:0;width:0;height:0}.ts-ui .ts-switch__track{position:relative;flex:0 0 auto;width:36px;height:20px;background:var(--ts-bg-subtle);border:1px solid var(--ts-border);border-radius:999px;transition:background var(--ts-transition),border-color var(--ts-transition)}.ts-ui .ts-switch__thumb{position:absolute;top:2px;left:2px;width:14px;height:14px;background:var(--ts-bg-elev);border-radius:999px;box-shadow:var(--ts-shadow-1);transition:left var(--ts-transition)}.ts-ui .ts-switch input:checked + .ts-switch__track{background:var(--ts-accent-soft);border-color:var(--ts-accent)}.ts-ui .ts-switch input:checked + .ts-switch__track .ts-switch__thumb{left:18px;background:var(--ts-accent)}.ts-ui .ts-switch input:focus-visible + .ts-switch__track{box-shadow:0 0 0 3px var(--ts-accent-soft)}.ts-ui .ts-select{position:relative;display:inline-block}.ts-ui .ts-select__btn{display:inline-flex;align-items:center;justify-content:space-between;gap:8px;min-width:140px;padding:7px 10px;font-size:13px;color:var(--ts-fg);background:var(--ts-bg-elev);border:1px solid var(--ts-border);border-radius:var(--ts-radius-md);cursor:pointer}.ts-ui .ts-select__btn:hover{border-color:var(--ts-border-strong)}.ts-ui .ts-select__btn svg{width:16px;height:16px;color:var(--ts-fg-faint)}.ts-ui.ts-menu,.ts-ui .ts-menu{min-width:180px;max-width:320px;padding:6px;background:var(--ts-bg-elev);border:1px solid var(--ts-border);border-radius:var(--ts-radius-md);box-shadow:var(--ts-shadow-2);animation:ts-fade 120ms ease}.ts-ui .ts-menu__item{display:flex;align-items:center;gap:10px;width:100%;padding:8px 10px;font-size:13px;color:var(--ts-fg);background:transparent;border:0;border-radius:var(--ts-radius-sm);text-align:left;cursor:pointer}.ts-ui .ts-menu__item:hover,.ts-ui .ts-menu__item.is-active{background:var(--ts-bg-subtle)}.ts-ui .ts-menu__item svg{width:16px;height:16px;flex:0 0 auto;color:var(--ts-fg-muted)}.ts-ui .ts-menu__item--danger{color:var(--ts-danger)}.ts-ui .ts-menu__item--danger svg{color:var(--ts-danger)}.ts-ui .ts-menu__item:disabled{opacity:0.45;cursor:not-allowed}.ts-ui .ts-menu__sep{height:1px;margin:6px 4px;background:var(--ts-border)}.ts-ui .ts-menu__label{padding:6px 10px 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:var(--ts-fg-faint)}.ts-ui.ts-popup{display:flex;flex-direction:column;width:300px;max-width:calc(100vw - 24px);max-height:calc(100vh - 24px);background:var(--ts-bg-elev);border:1px solid var(--ts-border);border-radius:var(--ts-radius-lg);box-shadow:var(--ts-shadow-2);overflow:hidden;animation:ts-fade 120ms ease}.ts-ui .ts-popup__header{display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid var(--ts-border)}.ts-ui .ts-popup__title{flex:1 1 auto;margin:0;font-size:14px;font-weight:600}.ts-ui .ts-popup__body{padding:14px;overflow-y:auto}.ts-ui .ts-popup__footer{display:flex;justify-content:flex-end;gap:8px;padding:12px 14px;border-top:1px solid var(--ts-border)}.ts-ui.ts-modal-scrim{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,0.5);animation:ts-fade 120ms ease}.ts-ui .ts-modal{display:flex;flex-direction:column;width:min(560px,92vw);max-height:min(720px,88vh);background:var(--ts-bg-elev);border:1px solid var(--ts-border);border-radius:var(--ts-radius-lg);box-shadow:var(--ts-shadow-2);overflow:hidden}.ts-ui .ts-modal__header{display:flex;align-items:center;gap:8px;padding:14px 16px;border-bottom:1px solid var(--ts-border)}.ts-ui .ts-modal__title{flex:1 1 auto;margin:0;font-size:16px;font-weight:600}.ts-ui .ts-modal__body{padding:16px;overflow-y:auto;color:var(--ts-fg)}.ts-ui .ts-modal__footer{display:flex;justify-content:flex-end;gap:8px;padding:14px 16px;border-top:1px solid var(--ts-border)}.ts-ui.ts-toast-wrap{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none}.ts-ui .ts-toast{display:flex;align-items:center;gap:10px;max-width:360px;padding:10px 14px;font-size:13px;color:var(--ts-fg);background:var(--ts-bg-elev);border:1px solid var(--ts-border);border-radius:var(--ts-radius-md);box-shadow:var(--ts-shadow-2);pointer-events:auto;animation:ts-fade 140ms ease}.ts-ui .ts-toast__dot{width:8px;height:8px;flex:0 0 auto;border-radius:999px;background:var(--ts-accent)}.ts-ui .ts-toast--ok .ts-toast__dot{background:var(--ts-ok)}.ts-ui .ts-toast--warn .ts-toast__dot{background:var(--ts-warn)}.ts-ui .ts-toast--danger .ts-toast__dot{background:var(--ts-danger)}.ts-ui.ts-tooltip{padding:5px 9px;font-size:12px;color:var(--ts-bg-elev);background:var(--ts-fg);border-radius:var(--ts-radius-sm);box-shadow:var(--ts-shadow-2);animation:ts-fade 100ms ease;pointer-events:none;white-space:nowrap}.ts-ui.ts-launcher{position:fixed;display:inline-flex;align-items:center;gap:8px;padding:10px 14px;font-size:13px;font-weight:600;color:var(--ts-accent-fg);background:var(--ts-accent);border:0;border-radius:999px;box-shadow:var(--ts-shadow-2);cursor:pointer;transition:filter var(--ts-transition),transform var(--ts-transition)}.ts-ui.ts-launcher:hover{filter:brightness(1.06)}.ts-ui.ts-launcher:active{transform:translateY(0.5px)}.ts-ui.ts-launcher svg{width:18px;height:18px}.ts-ui.ts-launcher--icononly{padding:0;width:44px;height:44px;justify-content:center}.ts-ui .ts-spin{display:inline-block;width:16px;height:16px;border:2px solid var(--ts-border);border-top-color:var(--ts-accent);border-radius:999px;animation:ts-spin 700ms linear infinite}.ts-ui .ts-dots{display:inline-flex;gap:4px}.ts-ui .ts-dots span{width:6px;height:6px;border-radius:999px;background:var(--ts-fg-faint);animation:ts-dot 1s ease-in-out infinite}.ts-ui .ts-dots span:nth-child(2){animation-delay:0.15s}.ts-ui .ts-dots span:nth-child(3){animation-delay:0.3s}@keyframes ts-fade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}@keyframes ts-spin{to{transform:rotate(360deg)}}@keyframes ts-dot{0%,100%{opacity:0.3;transform:translateY(0)}50%{opacity:1;transform:translateY(-3px)}}"; // replaced with the concatenated CSS at build time
  var ICONS = typeof TS_ICONS !== "undefined" ? TS_ICONS : {};
  var SVG_NS = "http://www.w3.org/2000/svg";
  var themeMode = "auto"; // 'auto' | 'light' | 'dark'
  var roots = []; // live .ts-ui roots the kit created (for re-theming)
  function injectCSS() {
    if (typeof document === "undefined") return;
    if (document.getElementById("tabsage-ui-css")) return;
    if (CSS.indexOf("__TS_UI") === 0) return; // placeholder unreplaced (raw src)
    var s = document.createElement("style");
    s.id = "tabsage-ui-css";
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function stampTheme(node) {
    if (themeMode === "auto") node.removeAttribute("data-ts-theme");
    else node.setAttribute("data-ts-theme", themeMode);
  }
  function makeRoot(extraCls) {
    injectCSS();
    var n = el("div", "ts-ui" + (extraCls ? " " + extraCls : ""));
    stampTheme(n);
    roots.push(n);
    return n;
  }
  function svgEl(inner) {
    var s = document.createElementNS(SVG_NS, "svg");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("fill", "none");
    s.setAttribute("stroke", "currentColor");
    s.setAttribute("stroke-width", "1.8");
    s.setAttribute("stroke-linecap", "round");
    s.setAttribute("stroke-linejoin", "round");
    s.innerHTML = inner;
    return s;
  }
  function resolveIcon(icon) {
    if (!icon) return null;
    if (icon.nodeType) return icon;
    if (typeof icon === "string") {
      if (ICONS[icon]) return svgEl(ICONS[icon]);
      if (icon.charAt(0) === "<") return svgEl(icon);
      var span = el("span");
      span.textContent = icon; // treat as text/emoji
      return span;
    }
    return null;
  }
  function openOverlay(node, opts) {
    opts = opts || {};
    document.body.appendChild(node);
    var closed = false;
    function close() {
      if (closed) return;
      closed = true;
      document.removeEventListener("mousedown", onDown, true);
      document.removeEventListener("keydown", onKey, true);
      if (node.parentNode) node.parentNode.removeChild(node);
      var i = roots.indexOf(node);
      if (i >= 0) roots.splice(i, 1);
      if (opts.onClose) opts.onClose();
    }
    function onDown(e) {
      if (node.contains(e.target)) return;
      if (opts.ignore && opts.ignore.contains(e.target)) return;
      close();
    }
    function onKey(e) {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    }
    setTimeout(function () {
      if (closed) return;
      if (opts.dismiss !== false)
        document.addEventListener("mousedown", onDown, true);
      document.addEventListener("keydown", onKey, true);
    }, 0);
    return close;
  }
  function placeFloating(node, rect, placement, gap) {
    gap = gap == null ? 6 : gap;
    node.style.position = "fixed";
    node.style.top = "-9999px";
    node.style.left = "-9999px";
    var w = node.offsetWidth;
    var h = node.offsetHeight;
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var below = rect.bottom + gap;
    var above = rect.top - gap - h;
    var openUp;
    if (placement === "up") openUp = true;
    else if (placement === "down") openUp = false;
    else openUp = below + h > vh && above >= 0; // auto
    var top = openUp ? Math.max(8, above) : below;
    if (!openUp && top + h > vh) top = Math.max(8, vh - h - 8);
    var left = rect.left;
    if (left + w > vw - 8) left = Math.max(8, rect.right - w); // right-align
    if (left < 8) left = 8;
    node.style.top = Math.round(top) + "px";
    node.style.left = Math.round(left) + "px";
    node.dataset.tsPlaced = openUp ? "up" : "down";
  }
  function rectOf(target) {
    if (target && target.nodeType === 1) return target.getBoundingClientRect();
    var x = target.clientX != null ? target.clientX : target.x || 0;
    var y = target.clientY != null ? target.clientY : target.y || 0;
    return { top: y, bottom: y, left: x, right: x, width: 0, height: 0 };
  }
  function button(o) {
    o = o || {};
    var b = el("button", "ts-btn" + (o.variant ? " ts-btn--" + o.variant : ""));
    b.type = "button";
    if (o.title) b.title = o.title;
    if (o.disabled) b.disabled = true;
    var ic = resolveIcon(o.icon);
    if (ic) b.appendChild(ic);
    if (o.label) b.appendChild(el("span", null, o.label));
    if (o.onClick) b.addEventListener("click", o.onClick);
    return b;
  }
  function iconButton(o) {
    o = o || {};
    var b = el(
      "button",
      "ts-iconbtn" + (o.variant ? " ts-iconbtn--" + o.variant : ""),
    );
    b.type = "button";
    if (o.title) {
      b.title = o.title;
      b.setAttribute("aria-label", o.title);
    }
    var ic = resolveIcon(o.icon);
    if (ic) b.appendChild(ic);
    if (o.onClick) b.addEventListener("click", o.onClick);
    return b;
  }
  function input(o) {
    o = o || {};
    var i = el("input", "ts-input");
    i.type = o.type || "text";
    if (o.placeholder) i.placeholder = o.placeholder;
    if (o.value != null) i.value = o.value;
    if (o.onInput)
      i.addEventListener("input", function () {
        o.onInput(i.value, i);
      });
    if (o.onEnter)
      i.addEventListener("keydown", function (e) {
        if (e.key === "Enter") o.onEnter(i.value, i);
      });
    return i;
  }
  function textarea(o) {
    o = o || {};
    var t = el("textarea", "ts-textarea");
    if (o.placeholder) t.placeholder = o.placeholder;
    if (o.value != null) t.value = o.value;
    if (o.rows) t.rows = o.rows;
    if (o.onInput)
      t.addEventListener("input", function () {
        o.onInput(t.value, t);
      });
    return t;
  }
  function switchControl(o) {
    o = o || {};
    var wrap = el("label", "ts-switch");
    var cb = el("input");
    cb.type = "checkbox";
    cb.checked = !!o.checked;
    var track = el("span", "ts-switch__track");
    track.appendChild(el("span", "ts-switch__thumb"));
    wrap.appendChild(cb);
    wrap.appendChild(track);
    if (o.label) wrap.appendChild(el("span", null, o.label));
    cb.addEventListener("change", function () {
      if (o.onChange) o.onChange(cb.checked, cb);
    });
    wrap.tsGet = function () {
      return cb.checked;
    };
    wrap.tsSet = function (v) {
      cb.checked = !!v;
    };
    return wrap;
  }
  function card(o) {
    o = o || {};
    var c = el("div", "ts-card" + (o.muted ? " ts-card--muted" : ""));
    if (o.title) c.appendChild(el("div", "ts-card__title", o.title));
    appendChildren(c, o.children != null ? o.children : o.body);
    return c;
  }
  function chip(o) {
    if (typeof o === "string") o = { label: o };
    o = o || {};
    var c = el("span", "ts-chip");
    if (o.status) {
      var d = el("span", "ts-chip__dot is-" + o.status);
      c.appendChild(d);
    }
    c.appendChild(el("span", null, o.label || ""));
    return c;
  }
  function badge(label) {
    return el("span", "ts-badge", label);
  }
  function icon(name) {
    return resolveIcon(name) || svgEl(ICONS.info);
  }
  function appendChildren(parent, children) {
    if (children == null) return;
    if (typeof children === "string") {
      parent.appendChild(document.createTextNode(children));
    } else if (children.nodeType) {
      parent.appendChild(children);
    } else if (children.length != null) {
      for (var i = 0; i < children.length; i++)
        appendChildren(parent, children[i]);
    }
  }
  function buildMenuItems(node, items, close) {
    var buttons = [];
    (items || []).forEach(function (it) {
      if (it === "separator" || it === "-" || (it && it.separator)) {
        node.appendChild(el("div", "ts-menu__sep"));
        return;
      }
      if (it && it.label != null && it.heading) {
        node.appendChild(el("div", "ts-menu__label", it.label));
        return;
      }
      var b = el(
        "button",
        "ts-menu__item" + (it.danger ? " ts-menu__item--danger" : ""),
      );
      b.type = "button";
      if (it.disabled) b.disabled = true;
      var ic = resolveIcon(it.icon);
      if (ic) b.appendChild(ic);
      b.appendChild(el("span", "ts-grow", it.label));
      if (it.shortcut) b.appendChild(el("span", "ts-faint", it.shortcut));
      b.addEventListener("click", function () {
        if (it.disabled) return;
        if (it.keepOpen !== true) close();
        if (it.onClick) it.onClick(it);
      });
      node.appendChild(b);
      buttons.push(b);
    });
    return buttons;
  }
  function menu(o) {
    o = o || {};
    var node = makeRoot("ts-menu ts-layer");
    var closeRef = { fn: null };
    var buttons = buildMenuItems(node, o.items, function () {
      if (closeRef.fn) closeRef.fn();
    });
    var anchorEl = o.anchor && o.anchor.nodeType === 1 ? o.anchor : null;
    var close = openOverlay(node, { onClose: o.onClose, ignore: anchorEl });
    closeRef.fn = close;
    placeFloating(node, rectOf(o.anchor || { x: 0, y: 0 }), o.placement, o.gap);
    var idx = -1;
    node.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        var dir = e.key === "ArrowDown" ? 1 : -1;
        for (var n = 0; n < buttons.length; n++) {
          idx = (idx + dir + buttons.length) % buttons.length;
          if (!buttons[idx].disabled) break;
        }
        buttons[idx] && buttons[idx].focus();
      }
    });
    if (buttons[0]) setTimeout(function () { buttons[0].focus(); }, 0);
    return { el: node, close: close };
  }
  function contextMenu(target, items, opts) {
    opts = opts || {};
    if (target && target.preventDefault) target.preventDefault();
    return menu({
      items: items,
      anchor: target,
      placement: opts.placement || "down",
      onClose: opts.onClose,
    });
  }
  function dropdown(trigger, items, opts) {
    opts = opts || {};
    return menu({
      items: items,
      anchor: trigger,
      placement: "down",
      onClose: opts.onClose,
    });
  }
  function dropup(trigger, items, opts) {
    opts = opts || {};
    return menu({
      items: items,
      anchor: trigger,
      placement: "up",
      onClose: opts.onClose,
    });
  }
  function select(o) {
    o = o || {};
    var options = o.options || [];
    var current = o.value != null ? o.value : (options[0] && options[0].value);
    var wrap = makeRoot("ts-select");
    var btn = el("button", "ts-select__btn");
    btn.type = "button";
    var labelSpan = el("span", "ts-grow");
    btn.appendChild(labelSpan);
    btn.appendChild(svgEl(ICONS["chevron-down"]));
    wrap.appendChild(btn);
    function labelFor(v) {
      for (var i = 0; i < options.length; i++)
        if (options[i].value === v) return options[i].label;
      return o.placeholder || "";
    }
    function render() {
      labelSpan.textContent = labelFor(current);
    }
    render();
    btn.addEventListener("click", function () {
      menu({
        anchor: btn,
        placement: "auto",
        items: options.map(function (opt) {
          return {
            label: opt.label,
            icon: opt.value === current ? "check" : null,
            onClick: function () {
              current = opt.value;
              render();
              if (o.onChange) o.onChange(current);
            },
          };
        }),
      });
    });
    wrap.tsGet = function () {
      return current;
    };
    wrap.tsSet = function (v) {
      current = v;
      render();
    };
    return wrap;
  }
  function popup(o) {
    o = o || {};
    var node = makeRoot("ts-popup ts-layer");
    if (o.width) node.style.width =
      typeof o.width === "number" ? o.width + "px" : o.width;
    if (o.title || o.closable !== false) {
      var head = el("div", "ts-popup__header");
      if (o.title) head.appendChild(el("h3", "ts-popup__title", o.title));
      else head.appendChild(el("span", "ts-grow"));
      var x = iconButton({
        icon: "close",
        title: "Close",
        onClick: function () {
          close();
        },
      });
      head.appendChild(x);
      node.appendChild(head);
    }
    var body = el("div", "ts-popup__body");
    appendChildren(body, o.content);
    node.appendChild(body);
    if (o.footer) {
      var foot = el("div", "ts-popup__footer");
      appendChildren(foot, o.footer);
      node.appendChild(foot);
    }
    var anchorEl = o.anchor && o.anchor.nodeType === 1 ? o.anchor : null;
    var close = openOverlay(node, { onClose: o.onClose, ignore: anchorEl });
    placeFloating(node, rectOf(o.anchor || centerRect()), o.placement, o.gap);
    return { el: node, body: body, close: close };
  }
  function centerRect() {
    var x = window.innerWidth / 2;
    var y = window.innerHeight / 2;
    return { top: y, bottom: y, left: x, right: x, width: 0, height: 0 };
  }
  function launcher(o) {
    o = o || {};
    injectCSS();
    var corner = o.corner || "bottom-right";
    var iconOnly = !o.label;
    var b = el(
      "button",
      "ts-ui ts-launcher" + (iconOnly ? " ts-launcher--icononly" : ""),
    );
    stampTheme(b);
    roots.push(b);
    b.type = "button";
    if (o.title) b.title = o.title;
    var ic = resolveIcon(o.icon || "sparkle");
    if (ic) b.appendChild(ic);
    if (o.label) b.appendChild(el("span", null, o.label));
    positionCorner(b, corner);
    var openCtl = null;
    b.addEventListener("click", function () {
      if (openCtl) {
        openCtl.close();
        openCtl = null;
        return;
      }
      if (o.onClick) {
        o.onClick(b);
        return;
      }
      var placement = corner.indexOf("top") === 0 ? "down" : "up";
      if (o.menu) {
        openCtl = menu({
          anchor: b,
          placement: placement,
          items: o.menu,
          onClose: function () {
            openCtl = null;
          },
        });
      } else if (o.popup) {
        var conf = typeof o.popup === "function" ? o.popup() : o.popup;
        openCtl = popup(
          Object.assign({ anchor: b, placement: placement }, conf, {
            onClose: function () {
              openCtl = null;
            },
          }),
        );
      }
    });
    document.body.appendChild(b);
    b.tsClose = function () {
      if (openCtl) openCtl.close();
    };
    return b;
  }
  function positionCorner(node, corner) {
    node.style.position = "fixed";
    var m = "16px";
    node.style.top = node.style.bottom = node.style.left = node.style.right = "";
    if (corner === "top-left") {
      node.style.top = m;
      node.style.left = m;
    } else if (corner === "top-right") {
      node.style.top = m;
      node.style.right = m;
    } else if (corner === "bottom-left") {
      node.style.bottom = m;
      node.style.left = m;
    } else if (corner === "bottom-center") {
      node.style.bottom = m;
      node.style.left = "50%";
      node.style.transform = "translateX(-50%)";
    } else {
      node.style.bottom = m;
      node.style.right = m;
    }
  }
  function modal(o) {
    o = o || {};
    var scrim = makeRoot("ts-modal-scrim");
    var box = el("div", "ts-modal");
    scrim.appendChild(box);
    var head = el("div", "ts-modal__header");
    head.appendChild(el("h2", "ts-modal__title", o.title || ""));
    head.appendChild(
      iconButton({
        icon: "close",
        title: "Close",
        onClick: function () {
          close();
        },
      }),
    );
    box.appendChild(head);
    var body = el("div", "ts-modal__body");
    appendChildren(body, o.body);
    box.appendChild(body);
    var actions = o.actions || [];
    if (actions.length) {
      var foot = el("div", "ts-modal__footer");
      actions.forEach(function (a) {
        foot.appendChild(
          button({
            label: a.label,
            variant: a.variant,
            onClick: function () {
              if (a.close !== false) close();
              if (a.onClick) a.onClick();
            },
          }),
        );
      });
      box.appendChild(foot);
    }
    scrim.addEventListener("mousedown", function (e) {
      if (e.target === scrim && o.dismiss !== false) close();
    });
    var close = openOverlay(scrim, { onClose: o.onClose, dismiss: false });
    return { el: scrim, body: body, close: close };
  }
  var toastWrap = null;
  function toast(message, o) {
    o = o || {};
    if (!toastWrap || !toastWrap.parentNode) {
      toastWrap = makeRoot("ts-toast-wrap ts-layer");
      document.body.appendChild(toastWrap);
    }
    var t = el("div", "ts-toast" + (o.variant ? " ts-toast--" + o.variant : ""));
    t.appendChild(el("span", "ts-toast__dot"));
    t.appendChild(el("span", "ts-grow", message));
    toastWrap.appendChild(t);
    var timeout = o.timeout == null ? 2600 : o.timeout;
    if (timeout > 0)
      setTimeout(function () {
        if (t.parentNode) t.parentNode.removeChild(t);
      }, timeout);
    return t;
  }
  function tooltip(target, label) {
    if (!target) return;
    var tip = null;
    function show() {
      tip = makeRoot("ts-tooltip ts-layer");
      tip.textContent = label;
      document.body.appendChild(tip);
      placeFloating(tip, target.getBoundingClientRect(), "up", 6);
    }
    function hide() {
      if (tip && tip.parentNode) tip.parentNode.removeChild(tip);
      tip = null;
    }
    target.addEventListener("mouseenter", show);
    target.addEventListener("mouseleave", hide);
    target.addEventListener("blur", hide);
  }
  function setTheme(mode) {
    themeMode = mode === "light" || mode === "dark" ? mode : "auto";
    for (var i = roots.length - 1; i >= 0; i--) {
      if (!roots[i] || !roots[i].isConnected) {
        if (roots[i] && !roots[i].isConnected) roots.splice(i, 1);
        continue;
      }
      stampTheme(roots[i]);
    }
    return themeMode;
  }
  function getTheme() {
    return themeMode;
  }
  function root(extraCls) {
    return makeRoot(extraCls);
  }
  var TabSageUI = {
    version: VERSION,
    setTheme: setTheme,
    getTheme: getTheme,
    injectCSS: injectCSS,
    root: root,
    icon: icon,
    icons: ICONS,
    button: button,
    iconButton: iconButton,
    input: input,
    textarea: textarea,
    switch: switchControl,
    toggle: switchControl,
    select: select,
    card: card,
    chip: chip,
    badge: badge,
    menu: menu,
    contextMenu: contextMenu,
    dropdown: dropdown,
    dropup: dropup,
    popup: popup,
    launcher: launcher,
    modal: modal,
    toast: toast,
    tooltip: tooltip,
  };
  global.TabSageUI = TabSageUI;
  global.__TabSageUILoaded = true;
  if (typeof module !== "undefined" && module.exports) module.exports = TabSageUI;
})(typeof window !== "undefined" ? window : this);
