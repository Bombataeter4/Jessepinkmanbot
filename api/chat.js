export default async function handler(req, res) {
  const ALLOWED = process.env.ALLOWED_ORIGIN || "*";

  // CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", ALLOWED);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Access-Control-Allow-Origin", ALLOWED);
    return res.status(405).json({ error: "Use POST /api/chat" });
  }

  try {
    const { message, history = [] } = req.body || {};
    if (!message) {
      res.setHeader("Access-Control-Allow-Origin", ALLOWED);
      return res.status(400).json({ error: "Missing 'message'" });
    }

    // Jij beheert je persona prompt via Vercel: Settings → Environment Variables → SYSTEM_PROMPT
    const system = process.env.SYSTEM_PROMPT || "You are a helpful assistant.";

    const input = [
      { role: "system", content: system },
      ...history,
      { role: "user", content: message }
    ];

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input
      })
    });

    if (!r.ok) {
      const text = await r.text();
      res.setHeader("Access-Control-Allow-Origin", ALLOWED);
      return res.status(500).json({ error: text });
    }

    const json = await r.json();
    const reply =
      json.output_text ??
      json.output?.[0]?.content?.[0]?.text ??
      "(geen tekst)";

    res.setHeader("Access-Control-Allow-Origin", ALLOWED);
    return res.status(200).json({ reply });
  } catch (e) {
    res.setHeader("Access-Control-Allow-Origin", ALLOWED);
    return res.status(500).json({ error: e.message });
  }
}
