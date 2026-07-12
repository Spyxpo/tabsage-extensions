/* ──────────────────────────────────────────────────────────────────────────
 *  Tab Sage UI Kit — runtime
 *
 *  Drop-in UI framework for Tab Sage extensions. Reproduces Tab Sage's look
 *  (tokens, fonts, light/dark themes) and gives you Chrome-style dropdown /
 *  dropup / context menus, toolbar-style popups, a corner launcher, plus
 *  buttons, inputs, switches, selects, cards, modals, toasts and tooltips.
 *
 *  Usage — vendor this one file into your extension folder and list it in
 *  manifest content_scripts BEFORE your own script:
 *      "js": ["tabsage-ui.js", "content.js"]
 *  Then in content.js:  TabSageUI.launcher({ label: "My Ext", menu: [...] })
 *
 *  The kit injects its own stylesheet on first use, follows the OS light/dark
 *  setting automatically, and never leaks styles onto the host page (everything
 *  is scoped under the .ts-ui class). No build step, no dependencies.
 *
 *  CSS is embedded at build time (the __TS_UI_CSS__ marker below). When running
 *  the raw src files, load tokens.css/base.css/components.css/icons.js first.
 * ────────────────────────────────────────────────────────────────────────── */
(function (global) {
  "use strict";
  if (global.TabSageUI && global.__TabSageUILoaded) return;

  var VERSION = "1.0.0";
  var CSS = "__TS_UI_CSS__"; // replaced with the concatenated CSS at build time
  var ICONS = typeof TS_ICONS !== "undefined" ? TS_ICONS : {};
  var SVG_NS = "http://www.w3.org/2000/svg";
  var themeMode = "auto"; // 'auto' | 'light' | 'dark'
  var roots = []; // live .ts-ui roots the kit created (for re-theming)

  /* ── style injection ─────────────────────────────────────────────────── */
  function injectCSS() {
    if (typeof document === "undefined") return;
    if (document.getElementById("tabsage-ui-css")) return;
    if (CSS.indexOf("__TS_UI") === 0) return; // placeholder unreplaced (raw src)
    var s = document.createElement("style");
    s.id = "tabsage-ui-css";
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  /* ── small helpers ───────────────────────────────────────────────────── */
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

  // A top-level .ts-ui root: themed + tracked so setTheme() can restyle it.
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

  // Accept an icon name, raw <svg-inner> markup, or an existing Node.
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

  /* ── overlay lifecycle (dismiss on Esc / outside click) ──────────────── */
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
    // Defer so the click that opened us doesn't immediately close it.
    setTimeout(function () {
      if (closed) return;
      if (opts.dismiss !== false)
        document.addEventListener("mousedown", onDown, true);
      document.addEventListener("keydown", onKey, true);
    }, 0);
    return close;
  }

  /* ── viewport-aware positioning (flip up = "dropup", flip left) ──────── */
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
    // an {x,y} point or a MouseEvent
    var x = target.clientX != null ? target.clientX : target.x || 0;
    var y = target.clientY != null ? target.clientY : target.y || 0;
    return { top: y, bottom: y, left: x, right: x, width: 0, height: 0 };
  }

  /* ── primitives ──────────────────────────────────────────────────────── */
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

  /* ── list (open tabs, storage entries, settings rows) ────────────────── */
  function listItem(o) {
    o = o || {};
    var clickable = typeof o.onClick === "function";
    var n = el(
      clickable ? "button" : "div",
      "ts-listitem" + (clickable ? " ts-listitem--btn" : ""),
    );
    if (clickable) n.type = "button";
    if (o.disabled) n.disabled = true;
    var ic = resolveIcon(o.icon);
    if (ic) {
      var iw = el("span", "ts-listitem__icon");
      iw.appendChild(ic);
      n.appendChild(iw);
    }
    var main = el("span", "ts-listitem__main");
    main.appendChild(
      el("span", "ts-listitem__label", o.label != null ? o.label : ""),
    );
    if (o.sublabel != null)
      main.appendChild(el("span", "ts-listitem__sub", o.sublabel));
    n.appendChild(main);
    if (o.trailing != null) {
      var tr = el("span", "ts-listitem__trailing");
      appendChildren(tr, o.trailing);
      n.appendChild(tr);
    }
    if (clickable)
      n.addEventListener("click", function () {
        if (!o.disabled) o.onClick(o);
      });
    return n;
  }

  function list(o) {
    o = o || {};
    var n = el("div", "ts-list");
    (o.items || []).forEach(function (it) {
      if (it && it.nodeType) n.appendChild(it);
      else n.appendChild(listItem(it));
    });
    return n;
  }

  /* ── field (labeled control with optional hint) ──────────────────────── */
  function field(o) {
    o = o || {};
    var n = el("div", "ts-field");
    if (o.label != null) n.appendChild(el("label", "ts-field__label", o.label));
    var ctrl = el("div", "ts-field__control");
    appendChildren(ctrl, o.control);
    n.appendChild(ctrl);
    if (o.hint != null) n.appendChild(el("div", "ts-field__hint", o.hint));
    return n;
  }

  /* ── section (grouped block) + divider ───────────────────────────────── */
  function section(o) {
    o = o || {};
    var n = el("div", "ts-section");
    if (o.title != null) n.appendChild(el("div", "ts-section__title", o.title));
    var body = el("div", "ts-section__body");
    appendChildren(body, o.children != null ? o.children : o.body);
    n.appendChild(body);
    return n;
  }

  function divider() {
    return el("div", "ts-divider");
  }

  /* ── spinner (indeterminate) ─────────────────────────────────────────── */
  function spinner(o) {
    if (typeof o === "number") o = { size: o };
    o = o || {};
    var n = el("span", "ts-spin");
    n.setAttribute("role", "status");
    n.setAttribute("aria-label", "Loading");
    if (o.size != null) {
      var px = typeof o.size === "number" ? o.size + "px" : o.size;
      n.style.width = px;
      n.style.height = px;
      if (typeof o.size === "number")
        n.style.borderWidth = Math.max(2, Math.round(o.size / 8)) + "px";
    }
    return n;
  }

  /* ── kbd (keyboard-shortcut hint chip) ───────────────────────────────── */
  function kbd(text) {
    var wrap = el("span", "ts-kbds");
    var keys = String(text == null ? "" : text).split("+");
    keys.forEach(function (k, i) {
      if (i > 0) wrap.appendChild(el("span", "ts-kbds__plus", "+"));
      wrap.appendChild(el("kbd", "ts-kbd", k.trim()));
    });
    return wrap;
  }

  /* ── notice / banner (inline info bar) ───────────────────────────────── */
  var NOTICE_ICON = { ok: "check", info: "info", warn: "alert", danger: "x-circle" };
  function notice(o) {
    if (typeof o === "string") o = { text: o };
    o = o || {};
    var variant = o.variant || "info";
    var n = el("div", "ts-notice ts-notice--" + variant);
    var iconName = o.icon != null ? o.icon : NOTICE_ICON[variant] || "info";
    var ic = resolveIcon(iconName);
    if (ic) {
      var iw = el("span", "ts-notice__icon");
      iw.appendChild(ic);
      n.appendChild(iw);
    }
    var body = el("span", "ts-notice__body");
    appendChildren(body, o.text);
    n.appendChild(body);
    return n;
  }

  /* ── menus (dropdown / dropup / context) ─────────────────────────────── */
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

    // keyboard nav
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

  /* ── select (custom listbox built on menu) ───────────────────────────── */
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

  /* ── popup panel (toolbar-popup analog) ──────────────────────────────── */
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

  /* ── launcher (floating corner FAB) ──────────────────────────────────── */
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

  /* ── modal ───────────────────────────────────────────────────────────── */
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

    // Close when the scrim (but not the box) is clicked.
    scrim.addEventListener("mousedown", function (e) {
      if (e.target === scrim && o.dismiss !== false) close();
    });
    var close = openOverlay(scrim, { onClose: o.onClose, dismiss: false });
    return { el: scrim, body: body, close: close };
  }

  /* ── toast ───────────────────────────────────────────────────────────── */
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

  /* ── tooltip (hover) ─────────────────────────────────────────────────── */
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

  /* ── theming ─────────────────────────────────────────────────────────── */
  function setTheme(mode) {
    themeMode = mode === "light" || mode === "dark" ? mode : "auto";
    for (var i = roots.length - 1; i >= 0; i--) {
      if (!roots[i] || !roots[i].isConnected) {
        // keep only live nodes
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

  /* ── a bare themed container for your own layouts ────────────────────── */
  function root(extraCls) {
    return makeRoot(extraCls);
  }

  /* ── public surface ──────────────────────────────────────────────────── */
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
    list: list,
    listItem: listItem,
    field: field,
    section: section,
    divider: divider,
    spinner: spinner,
    kbd: kbd,
    notice: notice,
    banner: notice,
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
