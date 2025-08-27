// Zet hier je Worker/Proxy URL (deel 2). Voorbeeld:
// const PROXY_URL = "https://jouw-worker.subdomain.workers.dev/chat";
const PROXY_URL = "VUL_HIER_JE_PROXY_URL_IN";

const chatEl = document.getElementById("chat");
const form = document.getElementById("form");
const input = document.getElementById("msg");
const uncensorEl = document.getElementById("uncensor");

const history = []; // bewaar een simpele chatgeschiedenis

function addBubble(text, who) {
  const div = document.createElement("div");
  div.className = `msg ${who}`;
  div.textContent = text;
  chatEl.appendChild(div);
  chatEl.scrollTop = chatEl.scrollHeight;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message || PROXY_URL.includes("VUL_HIER")) {
    alert("Vul eerst je PROXY_URL in app.js in.");
    return;
  }
  input.value = "";
  addBubble(message, "user");
  history.push({ role: "user", content: message });

  try {
    const res = await fetch(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        history,
        uncensor: uncensorEl.checked
      })
    });
    const data = await res.json();
    const reply = data.reply || "(geen antwoord)";
    addBubble(reply, "assistant");
    history.push({ role: "assistant", content: reply });
  } catch (err) {
    addBubble("Foutje bij het ophalen van het antwoord.", "assistant");
    console.error(err);
  }
});
