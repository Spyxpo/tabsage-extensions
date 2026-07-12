// Clipboard Tools: a small floating toolbar (top-center) with one-click buttons
// to copy the page Title, URL, or your current Selection to the clipboard.
// Demonstrates tabsage.clipboard.writeText together with the always-on page
// group (page.meta / page.selection), a quick badge flash, notifications, and a
// keyboard shortcut. Every host group is feature-detected so the toolbar
// degrades gracefully.
(function () {
  if (window.__tsClipTools) return;
  window.__tsClipTools = true;

  var T = typeof tabsage !== "undefined" ? tabsage : null;
  if (!T || !T.clipboard || !T.clipboard.writeText) {
    console.warn("Clipboard Tools needs the 'clipboard' permission");
    return;
  }

  console.log("Clipboard Tools ready on", location.href);

  // Page metadata (title/url) via the always-on page group, with a plain DOM
  // fallback for builds without it.
  function meta() {
    if (T.page && T.page.meta) return T.page.meta();
    return Promise.resolve({ title: document.title, url: location.href });
  }
  function selection() {
    if (T.page && T.page.selection) return T.page.selection();
    return Promise.resolve(
      String(window.getSelection ? window.getSelection() : ""),
    );
  }

  // Flash a "✓" badge on the extension's toolbar row, clear it after ~1.5s, and
  // toast what was copied. Both groups are optional.
  var badgeTimer = null;
  function flash(message) {
    if (T.badge && T.badge.set) {
      T.badge.set("✓", "#16a34a");
      if (badgeTimer) clearTimeout(badgeTimer);
      badgeTimer = setTimeout(function () {
        if (T.badge.clear) T.badge.clear();
      }, 1500);
    }
    if (T.notifications && T.notifications.show) {
      T.notifications.show("Clipboard Tools", message);
    }
  }

  function toast(message) {
    if (T.notifications && T.notifications.show)
      T.notifications.show("Clipboard Tools", message);
  }

  async function copy(text, label) {
    if (!text) {
      toast("Nothing to copy for " + label + ".");
      return;
    }
    try {
      await T.clipboard.writeText(text);
      flash(label + " copied to clipboard");
      console.log("Clipboard Tools: copied", label);
    } catch (e) {
      console.error("Clipboard Tools copy failed:", e);
      toast("Couldn't copy the " + label + ".");
    }
  }

  async function copyTitle() {
    var m = await meta();
    await copy((m && m.title) || document.title || "", "Title");
  }
  async function copyUrl() {
    var m = await meta();
    await copy((m && m.url) || location.href, "URL");
  }
  async function copySelection() {
    var s = ((await selection()) || "").trim();
    if (!s) {
      toast("Select some text first.");
      return;
    }
    await copy(s, "Selection");
  }

  // Build the toolbar with raw DOM (no ui-kit dependency).
  var bar = document.createElement("div");
  bar.id = "ts-cliptools";
  bar.className = "ts-cliptools";

  function addButton(label, handler) {
    var b = document.createElement("button");
    b.className = "ts-cliptools-btn";
    b.type = "button";
    b.textContent = label;
    b.addEventListener("click", handler);
    bar.appendChild(b);
  }

  var tag = document.createElement("span");
  tag.className = "ts-cliptools-tag";
  tag.textContent = "Copy";
  bar.appendChild(tag);

  addButton("Title", copyTitle);
  addButton("URL", copyUrl);
  addButton("Selection", copySelection);

  document.body.appendChild(bar);

  // Copy the URL from the keyboard (shortcuts need no permission).
  if (T.shortcuts && T.shortcuts.register) {
    T.shortcuts.register("Mod+Shift+C", copyUrl);
  }
})();
