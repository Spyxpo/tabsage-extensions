// Page Chatbot: a floating chat button. Ask a question about the current page;
// the on-device AI (same model as the sidebar) answers, and the reply is shown
// in a dialog. Demonstrates combining tabsage.ai.chat with tabsage.dialog.
(function () {
  if (window.__tsPageChatbot) return;
  window.__tsPageChatbot = true;

  if (typeof tabsage === "undefined" || !tabsage.ai || !tabsage.dialog) {
    console.warn("Page Chatbot needs the 'ai' and 'dialogs' permissions");
    return;
  }

  console.log("Page Chatbot ready on", location.href);

  function pageText() {
    var root =
      document.querySelector("article") ||
      document.querySelector("main") ||
      document.body;
    return (root && root.innerText ? root.innerText : "").slice(0, 5000);
  }

  async function ask() {
    // 1) Get the user's question in a dialog.
    var question = await tabsage.dialog.prompt(
      "Ask a question about this page:",
      "",
      "Page Chatbot",
    );
    if (question == null || !question.trim()) return;

    btn.disabled = true;
    btn.textContent = "…";
    try {
      // 2) Ask the on-device assistant, grounding it in the page text.
      var answer = await tabsage.ai.chat(
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
      await tabsage.dialog.alert(answer, "Page Chatbot");
    } catch (e) {
      var reason =
        typeof e === "string" ? e : (e && (e.message || e.toString())) || "";
      console.error("Page Chatbot failed:", e);
      await tabsage.dialog.alert(
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
