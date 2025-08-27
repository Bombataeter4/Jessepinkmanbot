export default async function handler(req, res) {
  const ORIGIN = process.env.ALLOWED_ORIGIN || "*";
  const send = (status, data) => {
    res.status(status);
    res.setHeader("Access-Control-Allow-Origin", ORIGIN);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.json(data);
  };

  if (req.method === "OPTIONS") return send(200, { ok: true });
  if (req.method !== "POST") return send(405, { error: "Use POST /api/chat" });

  if (!process.env.OPENAI_API_KEY) {
    return send(500, { error: "Missing OPENAI_API_KEY (Vercel env var)." });
  }

  // --- Body veilig parsen (soms is req.body al object, soms string)
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return send(400, { error: "Invalid JSON body." }); }
  }
  const { message, history = [] } = body || {};
  if (!message || typeof message !== "string") {
    return send(400, { error: "Missing 'message' (string) in body." });
  }

  const system = process.env.SYSTEM_PROMPT || "You are a helpful assistant.";
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  const input = [
    { role: "system", content: system },
    ...(Array.isArray(history) ? history : []),
    { role: "user", content: message }
  ];

  try {
    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({ model, input })
    });

    const text = await r.text();
    if (!r.ok) {
      // Geef OpenAI-fout terug zodat jij ’m ziet in de browser
      return send(502, { error: "OpenAI error", details: text });
    }

    let json;
    try { json = JSON.parse(text); } catch { return send(500, { error: "Bad JSON from OpenAI", raw: text }); }

    const reply =
      json.output_text ??
      json.output?.[0]?.content?.[0]?.text ??
      null;

    if (!reply) return send(500, { error: "No text in OpenAI response.", raw: json });

    return send(200, { reply });
  } catch (e) {
    return send(500, { error: "Server exception", details: String(e) });
  }
}

    res.setHeader("Access-Control-Allow-Origin", ALLOWED);
    return res.status(500).json({ error: e.message });
  }
}
