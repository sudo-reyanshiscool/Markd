const DEFAULT_MODEL = "gemma-4-31b-it";
const DEFAULT_MAX_OUTPUT_TOKENS = 1000;

const toGeminiRole = (role) => (role === "assistant" ? "model" : "user");

const extractText = (data) =>
  data?.candidates?.[0]?.content?.parts
    ?.map((part) => (typeof part?.text === "string" ? part.text : ""))
    .filter(Boolean)
    .join("\n")
    .trim() || "";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Missing GEMINI_API_KEY environment variable" });
  }

  const { messages, system } = req.body ?? {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "A non-empty messages array is required" });
  }

  const model = process.env.GEMMA_MODEL || DEFAULT_MODEL;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          system_instruction: typeof system === "string" && system.trim()
            ? { parts: [{ text: system.trim() }] }
            : undefined,
          contents: messages.map((message) => ({
            role: toGeminiRole(message.role),
            parts: [{ text: String(message.content || "") }],
          })),
          generationConfig: {
            maxOutputTokens: DEFAULT_MAX_OUTPUT_TOKENS,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "Gemma request failed",
      });
    }

    const text = extractText(data);
    if (!text) {
      return res.status(502).json({
        error: "Gemma returned no text output",
      });
    }

    return res.status(200).json({ text, model });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unexpected AI proxy error",
    });
  }
}
