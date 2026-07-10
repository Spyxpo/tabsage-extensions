// Sticky Notes: a small floating notepad, one note per site (keyed by hostname),
// saved locally through tabsage.storage so it reappears on your next visit.
(function () {
  if (window.__tsStickyNotes) return;
  window.__tsStickyNotes = true;

  if (!window.tabsage || !tabsage.storage) {
    console.warn("Sticky Notes needs the 'storage' permission");
    return;
  }

  var key = "note:" + location.hostname;
  var saveTimer = null;

  var wrap = document.createElement("div");
  wrap.id = "ts-notes";
  wrap.innerHTML =
    '<div id="ts-notes-bar"><span>Notes · ' +
    location.hostname +
    '</span><button id="ts-notes-close" title="Hide">×</button></div>' +
    '<textarea id="ts-notes-text" placeholder="Type a note for this site…"></textarea>';
  document.body.appendChild(wrap);

  var toggle = document.createElement("button");
  toggle.id = "ts-notes-toggle";
  toggle.textContent = "📝";
  toggle.title = "Sticky Notes";
  document.body.appendChild(toggle);

  var text = wrap.querySelector("#ts-notes-text");

  function open(show) {
    wrap.style.display = show ? "flex" : "none";
    toggle.style.display = show ? "none" : "block";
  }

  toggle.addEventListener("click", function () {
    open(true);
    text.focus();
  });
  wrap.querySelector("#ts-notes-close").addEventListener("click", function () {
    open(false);
  });

  // Debounced save so we don't hit storage on every keystroke.
  text.addEventListener("input", function () {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      tabsage.storage.set(key, text.value).then(function () {
        if (tabsage.notify) tabsage.notify("Sticky Notes", "Saved");
      });
    }, 600);
  });

  // Restore the saved note and start hidden behind the toggle.
  tabsage.storage
    .get(key)
    .then(function (saved) {
      if (saved) text.value = saved;
      console.log("Sticky Notes ready for", location.hostname);
    })
    .catch(function () {});
  open(false);
})();
