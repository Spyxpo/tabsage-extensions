// Sticky Notes: a small floating notepad, one note per site (keyed by hostname),
// saved locally through tabsage.storage so it reappears on your next visit.
// It also shows a badge with how many sites you've saved notes on
// (tabsage.storage.getAll + tabsage.badge) and can be toggled with a keyboard
// shortcut (tabsage.shortcuts, Mod+Shift+S).
(function () {
  if (window.__tsStickyNotes) return;
  window.__tsStickyNotes = true;

  if (typeof tabsage === "undefined" || !tabsage.storage) {
    console.warn("Sticky Notes needs the 'storage' permission");
    return;
  }

  // Inline Font Awesome Free icons (CC BY 4.0) — embedded as SVG so the
  // extension stays dependency-free (no external stylesheet or network load).
  var ICON_NOTE =
    '<svg viewBox="0 0 512 512" width="18" height="18" fill="currentColor" aria-hidden="true">' +
    '<path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z"/></svg>';
  var ICON_CLOSE =
    '<svg viewBox="0 0 384 512" width="14" height="14" fill="currentColor" aria-hidden="true">' +
    '<path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>';

  // One note per hostname. Every note this extension saves shares the "note:"
  // key prefix so storage.getAll() can find them all for the badge count.
  var PREFIX = "note:";
  var key = PREFIX + location.hostname;
  var saveTimer = null;
  var isOpen = false;

  var wrap = document.createElement("div");
  wrap.id = "ts-notes";
  wrap.innerHTML =
    '<div id="ts-notes-bar"><span id="ts-notes-title">Notes · ' +
    location.hostname +
    '</span><button id="ts-notes-close" title="Hide">' +
    ICON_CLOSE +
    "</button></div>" +
    '<textarea id="ts-notes-text" placeholder="Type a note for this site…"></textarea>';
  document.body.appendChild(wrap);

  var toggle = document.createElement("button");
  toggle.id = "ts-notes-toggle";
  toggle.innerHTML = ICON_NOTE;
  toggle.title = "Sticky Notes (Mod+Shift+S)";
  document.body.appendChild(toggle);

  var text = wrap.querySelector("#ts-notes-text");

  function open(show) {
    isOpen = show;
    wrap.style.display = show ? "flex" : "none";
    // Keep "flex" (not "block") so the button's CSS keeps the icon centered.
    toggle.style.display = show ? "none" : "flex";
  }

  toggle.addEventListener("click", function () {
    open(true);
    text.focus();
  });
  wrap.querySelector("#ts-notes-close").addEventListener("click", function () {
    open(false);
  });

  // Count every site with a non-empty saved note (via storage.getAll) and show
  // it as a toolbar badge, so you can see how many notepads you've got.
  function refreshBadge() {
    if (!tabsage.badge || !tabsage.storage.getAll) return;
    tabsage.storage
      .getAll()
      .then(function (all) {
        var count = 0;
        Object.keys(all || {}).forEach(function (k) {
          if (k.indexOf(PREFIX) === 0 && String(all[k]).trim()) count++;
        });
        if (count > 0) tabsage.badge.set(String(count), "#f59e0b");
        else if (tabsage.badge.clear) tabsage.badge.clear();
      })
      .catch(function () {});
  }

  // Debounced save so we don't hit storage on every keystroke.
  text.addEventListener("input", function () {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      tabsage.storage.set(key, text.value).then(function () {
        if (tabsage.notifications)
          tabsage.notifications.show("Sticky Notes", "Saved");
        refreshBadge();
      });
    }, 600);
  });

  // Use the always-on page group to label the notepad with the page title, so
  // the header tooltip shows what you were reading when you wrote the note.
  if (tabsage.page && tabsage.page.meta) {
    tabsage.page
      .meta()
      .then(function (m) {
        if (m && m.title)
          toggle.title = "Sticky Notes — " + m.title + " (Mod+Shift+S)";
      })
      .catch(function () {});
  }

  // Toggle the notepad from the keyboard (shortcuts need no permission).
  if (tabsage.shortcuts && tabsage.shortcuts.register) {
    tabsage.shortcuts.register("Mod+Shift+S", function () {
      open(!isOpen);
      if (isOpen) text.focus();
    });
  }

  // Restore the saved note and start hidden behind the toggle.
  tabsage.storage
    .get(key)
    .then(function (saved) {
      if (saved) text.value = saved;
      refreshBadge();
      console.log("Sticky Notes ready for", location.hostname);
    })
    .catch(function () {});
  open(false);
})();
