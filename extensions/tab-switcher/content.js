// Tab Switcher: a launcher button (center-right) that opens a panel listing all
// open tabs. Click a row to activate that tab, use the ✕ to close it, or hit
// "Reload this tab". Demonstrates the v1.2 tabs additions (list / activate /
// close / reload) and the messaging pub/sub group: "Ping other tabs" broadcasts
// a `ping` and counts the `pong` replies from your other open tabs.
(function () {
  if (window.__tsTabSwitcher) return;
  window.__tsTabSwitcher = true;

  var T = typeof tabsage !== "undefined" ? tabsage : null;
  if (!T || !T.tabs || !T.tabs.list) {
    console.warn("Tab Switcher needs the 'tabs' permission");
    return;
  }

  console.log("Tab Switcher ready on", location.href);

  // A per-tab id so pings can tell tabs apart (messaging is same-extension,
  // cross-tab, and includes the sender, so we route replies by this token).
  var TAB_ID = "tab-" + Math.random().toString(36).slice(2) + "-" + Date.now();

  // --- messaging: answer pings from other tabs with a pong -----------------
  if (T.messaging && T.messaging.onMessage) {
    T.messaging.onMessage("ping", function (data) {
      // Ignore our own broadcast (messaging echoes to the sender's tab too).
      if (!data || data.from === TAB_ID) return;
      T.messaging.send("pong", {
        to: data.from,
        from: TAB_ID,
        nonce: data.nonce,
      });
    });
  }

  // --- UI ------------------------------------------------------------------
  var launcher = document.createElement("button");
  launcher.id = "ts-tabswitch-launch";
  launcher.className = "ts-tabswitch-launch";
  launcher.type = "button";
  launcher.textContent = "Tabs";
  launcher.title = "Open tabs";
  document.body.appendChild(launcher);

  var panel = document.createElement("div");
  panel.id = "ts-tabswitch-panel";
  panel.className = "ts-tabswitch-panel";
  panel.style.display = "none";
  panel.innerHTML =
    '<div class="ts-tabswitch-head">' +
    '<span class="ts-tabswitch-title">Open tabs</span>' +
    '<button class="ts-tabswitch-close" type="button" title="Hide">✕</button>' +
    "</div>" +
    '<div class="ts-tabswitch-list" id="ts-tabswitch-list"></div>' +
    '<div class="ts-tabswitch-actions">' +
    '<button class="ts-tabswitch-action" id="ts-tabswitch-reload" type="button">Reload this tab</button>' +
    '<button class="ts-tabswitch-action" id="ts-tabswitch-ping" type="button">Ping other tabs</button>' +
    "</div>" +
    '<div class="ts-tabswitch-status" id="ts-tabswitch-status"></div>';
  document.body.appendChild(panel);

  var listEl = panel.querySelector("#ts-tabswitch-list");
  var statusEl = panel.querySelector("#ts-tabswitch-status");
  var isOpen = false;

  function setStatus(msg) {
    statusEl.textContent = msg || "";
  }

  function open(show) {
    isOpen = show;
    panel.style.display = show ? "flex" : "none";
    launcher.style.display = show ? "none" : "block";
    if (show) refreshList();
  }

  launcher.addEventListener("click", function () {
    open(true);
  });
  panel
    .querySelector(".ts-tabswitch-close")
    .addEventListener("click", function () {
      open(false);
    });

  function rowLabel(tab) {
    var title = (tab.title || "").trim();
    if (title) return title;
    try {
      return new URL(tab.url).hostname || tab.url;
    } catch (e) {
      return tab.url || "(untitled)";
    }
  }

  async function refreshList() {
    setStatus("");
    listEl.textContent = "";
    var tabs;
    try {
      tabs = await T.tabs.list();
    } catch (e) {
      console.error("Tab Switcher: tabs.list failed", e);
      setStatus("Couldn't read the tab list.");
      return;
    }
    if (!tabs || !tabs.length) {
      setStatus("No tabs reported.");
      return;
    }
    tabs.forEach(function (tab) {
      var row = document.createElement("div");
      row.className =
        "ts-tabswitch-row" + (tab.active ? " ts-tabswitch-row--active" : "");

      var name = document.createElement("button");
      name.className = "ts-tabswitch-name";
      name.type = "button";
      name.textContent = rowLabel(tab);
      name.title = tab.url || "";
      name.addEventListener("click", function () {
        if (T.tabs.activate) {
          T.tabs
            .activate(tab.id)
            .then(function () {
              open(false);
            })
            .catch(function (e) {
              console.error("activate failed", e);
              setStatus("Couldn't switch to that tab.");
            });
        }
      });

      var close = document.createElement("button");
      close.className = "ts-tabswitch-x";
      close.type = "button";
      close.textContent = "✕";
      close.title = "Close tab";
      close.addEventListener("click", function (ev) {
        ev.stopPropagation();
        if (!T.tabs.close) return;
        T.tabs
          .close(tab.id)
          .then(function () {
            refreshList();
          })
          .catch(function (e) {
            console.error("close failed", e);
            setStatus("Couldn't close that tab.");
          });
      });

      row.appendChild(name);
      row.appendChild(close);
      listEl.appendChild(row);
    });
  }

  panel
    .querySelector("#ts-tabswitch-reload")
    .addEventListener("click", function () {
      if (T.tabs.reload) T.tabs.reload();
    });

  // Ping every other open tab and count the pongs that come back within a short
  // window — a live count of your other tabs, entirely over the messaging group.
  panel
    .querySelector("#ts-tabswitch-ping")
    .addEventListener("click", function () {
      if (!T.messaging || !T.messaging.send || !T.messaging.onMessage) {
        setStatus("Messaging isn't available.");
        return;
      }
      var nonce = Math.random().toString(36).slice(2);
      var replies = 0;
      setStatus("Pinging…");
      var unsub = T.messaging.onMessage("pong", function (data) {
        if (data && data.to === TAB_ID && data.nonce === nonce) replies++;
      });
      T.messaging.send("ping", { from: TAB_ID, nonce: nonce });
      setTimeout(function () {
        if (typeof unsub === "function") unsub();
        setStatus(
          replies === 1
            ? "1 other tab replied."
            : replies + " other tabs replied.",
        );
      }, 600);
    });

  open(false);
})();
