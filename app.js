// Vervang dit zo met jouw Vercel-URL (stap 4):
const PROXY_URL = "https://<jouw-project>.vercel.app/api/chat";

const chatEl = document.getElementById("chat");
const form = document.getElementById("form");
const input = document.getElementById("msg");
const history = [];

function bubble(text, who) {
  const d = document.createElement("div");
  d.className = `msg ${who}`;
  d.textContent = text;
  chatEl.appendChild(d);
  chatEl.scrollTop = chatEl.scrollHeight;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message) return;

  input.value = "";
  bubble(message, "user");
  history.push({ role: "user", content: message });

  try {
    const r = await fetch(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history })
    });
    const data = await r.json();
    const reply = data.reply || "(geen antwoord)";
    bubble(reply, "assistant");
    history.push({ role: "assistant", content: reply });
  } catch (err) {
    bubble("Er ging iets mis met de server.", "assistant");
    console.error(err);
  }
});

