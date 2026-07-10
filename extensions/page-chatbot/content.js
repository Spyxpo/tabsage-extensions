// Page Chatbot: a floating chat button. Ask a question about the current page;
// the on-device AI (same model as the sidebar) answers, and the reply is shown
// in a dialog. Demonstrates combining tabsage.ai.chat with tabsage.dialogs.
(function () {
  if (window.__tsPageChatbot) return;
  window.__tsPageChatbot = true;

  if (typeof tabsage === "undefined" || !tabsage.ai || !tabsage.dialogs) {
    console.warn("Page Chatbot needs the 'ai' and 'dialogs' permissions");
    return;
  }

  console.log("Page Chatbot ready on", location.href);

  function pageText() {
    // News/blog pages often have MANY <article> elements — the real story plus
    // teaser/related-story cards — so the first <article> can be a tiny card.
    // Score every plausible content container by visible text length and keep
    // the richest one; fall back to <body> only if no semantic container exists.
    var sels = [
      "article",
      "main",
      "[role=main]",
      ".article-body",
      ".story-content",
      ".entry-content",
      "#content",
    ];
    var best = null;
    var bestLen = 0;
    sels.forEach(function (sel) {
      var nodes = document.querySelectorAll(sel);
      for (var i = 0; i < nodes.length; i++) {
        var t = nodes[i].innerText ? nodes[i].innerText.trim() : "";
        if (t.length > bestLen) {
          best = nodes[i];
          bestLen = t.length;
        }
      }
    });
    var root = best || document.body;
    return (root && root.innerText ? root.innerText : "").slice(0, 5000);
  }

  // True when an IPC rejection means the host lacks the newer `ai.chat`
  // command (older Tab Sage builds only ship `ai.complete`). The IPC rejects
  // with "ext_api_ai_chat not allowed. Plugin not found".
  function chatUnsupported(e) {
    var s = (
      typeof e === "string" ? e : (e && (e.message || e.toString())) || ""
    ).toLowerCase();
    return (
      s.indexOf("not allowed") !== -1 ||
      s.indexOf("not found") !== -1 ||
      s.indexOf("ext_api_ai_chat") !== -1
    );
  }

  // Ask the on-device assistant. Prefers the chat template but falls back to
  // the raw `ai.complete` completion on builds without `ai.chat`, folding the
  // system persona into the prompt.
  async function aiRespond(message, opts) {
    opts = opts || {};
    if (tabsage.ai.chat) {
      try {
        return await tabsage.ai.chat(message, opts);
      } catch (e) {
        if (!chatUnsupported(e)) throw e;
        console.warn("ai.chat unavailable, using ai.complete fallback:", e);
      }
    }
    var sys = opts.system ? opts.system + "\n\n" : "";
    return tabsage.ai.complete(sys + message, { maxTokens: opts.maxTokens });
  }

  async function ask() {
    // 1) Get the user's question in a dialog.
    var question = await tabsage.dialogs.prompt(
      "Ask a question about this page:",
      "",
      "Page Chatbot",
    );
    if (question == null || !question.trim()) return;

    btn.disabled = true;
    btn.textContent = "…";
    try {
      // 2) Ask the on-device assistant, grounding it in the page text.
      //    Falls back to ai.complete on builds without ai.chat.
      var answer = await aiRespond(
        "Page content:\n" +
          pageText() +
          "\n\nBased only on the page above, answer: " +
          question,
        {
          system:
            "You are a helpful assistant answering questions about the web page the user is viewing. Be concise. If the answer isn't on the page, say so.",
          maxTokens: 400,
        },
      );
      // 3) Show the reply in a dialog.
      await tabsage.dialogs.alert(answer, "Page Chatbot");
    } catch (e) {
      var reason =
        typeof e === "string" ? e : (e && (e.message || e.toString())) || "";
      console.error("Page Chatbot failed:", e);
      await tabsage.dialogs.alert(
        "Couldn't get an answer.\n\n" +
          (reason || "The on-device AI model may not be ready.") +
          "\n\nTip: open Settings → Models, download the model, and set the AI runtime to “llama”.",
        "Page Chatbot",
      );
    } finally {
      btn.disabled = false;
      btn.textContent = "Ask AI";
    }
  }

  var btn = document.createElement("button");
  btn.id = "ts-chatbot-btn";
  btn.textContent = "Ask AI";
  btn.addEventListener("click", ask);
  document.body.appendChild(btn);
})();
