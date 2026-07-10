// AI Summarize: a floating button that summarizes the current page using Tab
// Sage's on-device AI and shows the result in a dialog over the page. It
// remembers the last summary per URL and toasts when done. It also doubles as
// the reference for the `tabsage` host API (ai + storage + notifications +
// dialogs). Everything runs locally — no network, no accounts.
(function () {
  // Content scripts can run more than once per page (e.g. after in-page
  // navigation), so bail out if we already installed.
  if (window.__tsAiSummarize) return;
  window.__tsAiSummarize = true;

  // The tabsage API is an in-scope local (not on window). Bail cleanly if the
  // 'ai' capability wasn't granted.
  if (typeof tabsage === "undefined" || !tabsage.ai) {
    console.warn("AI Summarize needs the 'ai' permission");
    return;
  }

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

  // Show the summary in a dialog over the page (falls back to an alert if the
  // 'dialogs' permission isn't granted).
  function showSummary(text) {
    if (tabsage.dialog) tabsage.dialog.alert(text, "Page summary");
    else alert(text);
  }

  async function summarize() {
    btn.disabled = true;
    btn.textContent = "Summarizing…";
    try {
      var text = mainText();
      if (text.trim().length < 200) {
        showSummary("Not enough text on this page to summarize.");
        return;
      }
      // Use the same local assistant the AI sidebar uses (chat template) for a
      // cleaner, instruction-following summary.
      var summary = await tabsage.ai.chat(
        "Summarize the following page in 3 short bullet points:\n\n" + text,
        {
          system:
            "You are a concise summarizer. Reply with 3 short bullet points and nothing else.",
          maxTokens: 256,
        },
      );
      showSummary(summary);
      // Remember it so re-opening the page can show the last summary.
      if (tabsage.storage) await tabsage.storage.set(storageKey, summary);
      if (tabsage.notify) tabsage.notify("AI Summarize", "Summary ready");
      console.log("AI Summarize: produced a summary");
    } catch (e) {
      // Surface the real reason (e.g. the on-device model isn't downloaded /
      // the runtime is still on "mock") instead of a generic failure.
      var reason =
        typeof e === "string" ? e : (e && (e.message || e.toString())) || "";
      console.error("AI Summarize failed:", e);
      showSummary(
        "Could not summarize this page.\n\n" +
          (reason || "The on-device AI model may not be ready.") +
          "\n\nTip: open Settings → Models, download the model, and set the AI runtime to “llama”.",
      );
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
})();
