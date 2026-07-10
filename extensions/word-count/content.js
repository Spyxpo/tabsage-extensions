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

  function update() {
    var sel = String(window.getSelection ? window.getSelection() : "");
    var trimmed = sel.trim();
    if (!trimmed) {
      if (badge) badge.style.display = "none";
      return;
    }
    var words = trimmed.split(/\s+/).length;
    var b = ensureBadge();
    b.textContent =
      words + (words === 1 ? " word" : " words") + " · " + sel.length + " chars";
    b.style.display = "block";
  }

  document.addEventListener("selectionchange", update);
  // Also update on mouseup so a drag-selection settles immediately.
  document.addEventListener("mouseup", function () {
    setTimeout(update, 0);
  });
  console.log("Selection Word Count ready");
})();
