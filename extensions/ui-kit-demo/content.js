// UI Kit Demo — a tour of the Tab Sage UI Kit (TabSageUI). Everything below is
// styled to match Tab Sage and follows the OS light/dark theme automatically.
// tabsage-ui.js is listed first in the manifest, so `TabSageUI` is ready here.
(function () {
  if (window.__tsUiKitDemo) return;
  window.__tsUiKitDemo = true;
  if (typeof TabSageUI === "undefined") return;

  var U = TabSageUI;

  // A floating corner button (Chrome-toolbar style). Clicking it toggles a
  // popup panel; because the button sits in a bottom corner, the panel (and any
  // menu inside it) opens upward — a "dropup" — on its own.
  U.launcher({
    label: "UI Kit",
    icon: "puzzle",
    corner: "bottom-right",
    popup: buildPanel,
  });

  function buildPanel() {
    var body = U.root(); // a themed .ts-ui container to fill
    body.appendChild(U.input({ placeholder: "Type anything…" }));

    var enabled = U.switch({ label: "Feature enabled", checked: true });
    body.appendChild(enabled);

    var mode = U.select({
      options: [
        { value: "concise", label: "Concise" },
        { value: "detailed", label: "Detailed" },
        { value: "bullets", label: "Bullet points" },
      ],
      value: "concise",
      onChange: function (v) {
        U.toast("Mode: " + v);
      },
    });
    body.appendChild(mode);

    // A button that opens a dropdown/dropup menu (auto-flips near edges).
    var menuBtn = U.button({ label: "Actions", icon: "sparkle" });
    menuBtn.addEventListener("click", function () {
      U.menu({
        anchor: menuBtn,
        placement: "auto",
        items: [
          {
            label: "Show a toast",
            icon: "check",
            onClick: function () {
              U.toast("Hello from the UI Kit", { variant: "ok" });
            },
          },
          {
            label: "Open a dialog",
            icon: "info",
            onClick: function () {
              U.modal({
                title: "Tab Sage UI Kit",
                body: "This modal, the menu, and the launcher all come from one vendored file.",
                actions: [{ label: "Nice", variant: "primary" }],
              });
            },
          },
          "separator",
          {
            label: "Remove widget",
            icon: "trash",
            danger: true,
            onClick: function () {
              U.toast("(demo only)", { variant: "warn" });
            },
          },
        ],
      });
    });
    body.appendChild(menuBtn);

    var send = U.button({ label: "Done", variant: "primary", icon: "check" });
    return { title: "UI Kit Demo", content: body, footer: [send], width: 320 };
  }
})();
