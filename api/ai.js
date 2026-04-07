const DEFAULT_LOCAL_OLLAMA_URL = "http://127.0.0.1:11434";
const DEFAULT_OLLAMA_MODEL = "gemma4";
const DEFAULT_GEMINI_MODEL = "gemma-4-31b-it";
const DEFAULT_MAX_OUTPUT_TOKENS = 1000;
const REQUEST_TIMEOUT_MS = 45000;

const withTimeout = async (url, options, timeoutMs = REQUEST_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
};

const parseJsonSafely = async (response) => {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

const normaliseMessages = (system, messages) => {
  const nextMessages = [];

  if (typeof system === "string" && system.trim()) {
    nextMessages.push({ role: "system", content: system.trim() });
  }

  for (const message of messages) {
    const role =
      message?.role === "assistant" || message?.role === "system"
        ? message.role
        : "user";
    const content = typeof message?.content === "string" ? message.content.trim() : "";

    if (content) nextMessages.push({ role, content });
  }

  return nextMessages;
};

const toGeminiRole = (role) => (role === "assistant" ? "model" : "user");

const extractGeminiText = (data) =>
  data?.candidates?.[0]?.content?.parts
    ?.map((part) => (typeof part?.text === "string" ? part.text : ""))
    .filter(Boolean)
    .join("\n")
    .trim() || "";

const getNoBackendMessage = () => {
  if (process.env.VERCEL) {
    return "No AI backend is configured. To use free Gemma 4 on Vercel, point OLLAMA_BASE_URL at a publicly reachable Ollama server and set OLLAMA_MODEL. Local Ollama on your laptop is not reachable from Vercel.";
  }

  return 'No AI backend is configured. For free local AI, install Ollama, pull a Gemma 4 model, keep Ollama running, and optionally set OLLAMA_MODEL if your tag differs. Example: "ollama pull gemma4".';
};

const requestOllama = async ({ baseUrl, model, messages, system }) => {
  const response = await withTimeout(`${baseUrl.replace(/\/$/, "")}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      stream: false,
      messages: normaliseMessages(system, messages),
    }),
  });

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    const message =
      response.status === 404
        ? `Ollama could not find the "${model}" model. Run "ollama pull ${model}" on the Ollama machine, or set OLLAMA_MODEL to the exact installed tag.`
        : data?.error || data?.raw || "Ollama request failed";

    throw new Error(message);
  }

  const text = typeof data?.message?.content === "string" ? data.message.content.trim() : "";
  if (!text) {
    throw new Error("Ollama returned no text output.");
  }

  return { text, model, provider: "ollama" };
};

const requestGemini = async ({ apiKey, model, messages, system }) => {
  const response = await withTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        system_instruction:
          typeof system === "string" && system.trim()
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

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(data?.error?.message || data?.raw || "Gemma request failed.");
  }

  const text = extractGeminiText(data);
  if (!text) {
    throw new Error("Gemma returned no text output.");
  }

  return { text, model, provider: "gemini" };
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages, system } = req.body ?? {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "A non-empty messages array is required." });
  }

  const errors = [];
  const ollamaBaseUrl =
    process.env.OLLAMA_BASE_URL || (!process.env.VERCEL ? DEFAULT_LOCAL_OLLAMA_URL : "");
  const ollamaModel = process.env.OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL;

  if (ollamaBaseUrl) {
    try {
      const result = await requestOllama({
        baseUrl: ollamaBaseUrl,
        model: ollamaModel,
        messages,
        system,
      });
      return res.status(200).json(result);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Ollama request failed.");
    }
  }

  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (geminiApiKey) {
    try {
      const result = await requestGemini({
        apiKey: geminiApiKey,
        model: process.env.GEMMA_MODEL || DEFAULT_GEMINI_MODEL,
        messages,
        system,
      });
      return res.status(200).json(result);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Gemma fallback request failed.");
    }
  }

  return res.status(500).json({
    error: errors.length > 0 ? `${getNoBackendMessage()} Last error: ${errors[0]}` : getNoBackendMessage(),
  });
}
