// Selection Word Count: shows a small floating badge with the word and character
// count of whatever text you have selected. Needs no permissions beyond
// content_scripts — it only reads the current selection.
(function () {
  if (window.__tsWordCount) return;
  window.__tsWordCount = true;

  var badge = null;

  function ensureBadge() {
    if (badge && badge.isConnected) return badge;
    badge = document.createElement("div");
    badge.id = "ts-wordcount";
    document.body.appendChild(badge);
    return badge;
  }

  // Prefer the host's page.selection() (always available, no permission needed);
  // fall back to window.getSelection so the badge still works outside Tab Sage.
  function readSelection() {
    if (
      typeof tabsage !== "undefined" &&
      tabsage.page &&
      tabsage.page.selection
    ) {
      return tabsage.page.selection().catch(function () {
        return String(window.getSelection ? window.getSelection() : "");
      });
    }
    return Promise.resolve(
      String(window.getSelection ? window.getSelection() : ""),
    );
  }

  function update() {
    readSelection().then(function (sel) {
      var trimmed = (sel || "").trim();
      var b = ensureBadge();
      if (!trimmed) {
        // Idle hint so the badge is always visible (and can be highlighted from
        // the toolbar), not only while text is selected.
        b.textContent = "Select text to count";
        b.classList.add("is-idle");
        return;
      }
      var words = trimmed.split(/\s+/).length;
      b.classList.remove("is-idle");
      b.textContent =
        words +
        (words === 1 ? " word" : " words") +
        " · " +
        sel.length +
        " chars";
    });
  }

  document.addEventListener("selectionchange", update);
  // Also update on mouseup so a drag-selection settles immediately.
  document.addEventListener("mouseup", function () {
    setTimeout(update, 0);
  });
  update(); // show the idle badge right away
  console.log("Selection Word Count ready");
})();
