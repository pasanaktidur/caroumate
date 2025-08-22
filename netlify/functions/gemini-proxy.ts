// netlify/functions/gemini-proxy.ts (Node runtime)
import fetch from "node-fetch"; // jika tidak tersedia global (Netlify Node 18/20 biasanya sudah ada)

export async function handler(event: any) {
  // CORS / preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors(), body: "" };
  }
  try {
    if (event.httpMethod !== "POST") {
      return json(405, { error: "Method not allowed" });
    }

    const { action, payload } = JSON.parse(event.body || "{}");
    const apiKey = process.env.API_KEY; // <- samakan dengan env di Netlify
    if (!apiKey) return json(500, { error: "Missing API_KEY" });

    // === contoh panggilan ke Gemini (HTTP biasa) ===
    if (action === "generateCarouselContent") {
      const r = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: payload?.topic || "Hello from CarouMate" }]}],
          }),
        }
      );
      const out = await r.json();
      return json(r.ok ? 200 : r.status, out);
    }

    // Tambah case lain: generateSlideImage, getAiAssistance, dll…
    return json(400, { error: "Unknown action" });
  } catch (e: any) {
    return json(500, { error: e?.message || "Unknown error" });
  }
}

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
  };
}
function json(status: number, body: any) {
  return { statusCode: status, headers: cors(), body: JSON.stringify(body) };
}
