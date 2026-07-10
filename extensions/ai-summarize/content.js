// AI Summarize: a floating button that summarizes the current page using Tab
// Sage's on-device AI, remembers the last summary per URL, and toasts when done.
// It also doubles as the reference for the `tabsage` host API (ai + storage +
// notifications). Everything runs locally — no network, no accounts.
(function () {
  // Content scripts can run more than once per page (e.g. after in-page
  // navigation), so bail out if we already installed.
  if (window.__tsAiSummarize) return;
  window.__tsAiSummarize = true;

  // `console.*` output is forwarded to Settings > Extensions, so these lines are
  // how you confirm the extension is alive on a page.
  console.log("AI Summarize ready on", location.href);

  var storageKey = "summary:" + location.href;

  function mainText() {
    var root =
      document.querySelector("article") ||
      document.querySelector("main") ||
      document.body;
    return (root && root.innerText ? root.innerText : "").slice(0, 6000);
  }

  function showPanel(text) {
    var panel = document.getElementById("ts-ai-summary");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "ts-ai-summary";
      document.body.appendChild(panel);
    }
    panel.textContent = text;
    panel.style.display = "block";
  }

  async function summarize() {
    if (!window.tabsage || !tabsage.ai) {
      console.warn("AI Summarize: the 'ai' permission is not available");
      return;
    }
    btn.disabled = true;
    btn.textContent = "Summarizing…";
    try {
      var text = mainText();
      if (text.trim().length < 200) {
        showPanel("Not enough text on this page to summarize.");
        return;
      }
      var summary = await tabsage.ai.prompt(
        "Summarize the following page in 3 short bullet points:\n\n" + text,
        { maxTokens: 256 },
      );
      showPanel(summary);
      // Remember it so re-opening the page shows the last summary instantly.
      if (tabsage.storage) await tabsage.storage.set(storageKey, summary);
      if (tabsage.notify) tabsage.notify("AI Summarize", "Summary ready");
      console.log("AI Summarize: produced a summary");
    } catch (e) {
      console.error("AI Summarize failed:", e);
      showPanel("Could not summarize this page.");
    } finally {
      btn.disabled = false;
      btn.textContent = "Summarize";
    }
  }

  var btn = document.createElement("button");
  btn.id = "ts-ai-summary-btn";
  btn.textContent = "Summarize";
  btn.addEventListener("click", summarize);
  document.body.appendChild(btn);

  // If we summarized this page before, show the cached summary right away.
  if (window.tabsage && tabsage.storage) {
    tabsage.storage
      .get(storageKey)
      .then(function (prev) {
        if (prev) showPanel(prev);
      })
      .catch(function () {});
  }
})();
