// Reading Time: shows an estimated reading time badge on text-heavy pages.
// This is the reference extension for the Tab Sage extension format.
(function () {
  // Content scripts can be injected more than once per page (e.g. after
  // in-page navigation), so bail out if we already ran.
  if (window.__tsExtReadingTime) return;
  window.__tsExtReadingTime = true;

  var WORDS_PER_MINUTE = 220;
  var MIN_WORDS = 400; // skip pages that are not really articles

  function wordCount() {
    var root =
      document.querySelector("article") ||
      document.querySelector("main") ||
      document.body;
    if (!root) return 0;
    var text = root.innerText || "";
    var words = text.trim().split(/\s+/);
    return words[0] === "" ? 0 : words.length;
  }

  function render() {
    var words = wordCount();
    if (words < MIN_WORDS) return;

    var minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
    var badge = document.createElement("div");
    badge.className = "ts-reading-time";
    badge.textContent = minutes + " min read";
    badge.title = words.toLocaleString() + " words. Click to dismiss.";
    badge.addEventListener("click", function () {
      badge.remove();
    });
    document.body.appendChild(badge);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
