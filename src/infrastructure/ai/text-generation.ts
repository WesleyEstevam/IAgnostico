import "server-only";

export type AIProvider = "openai" | "gemini";
export type AIMessage = { role: "user" | "assistant"; content: string };

type GenerationInput = {
  instructions: string;
  messages: AIMessage[];
  maxOutputTokens: number;
};

type OpenAIResponse = {
  output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
};

type ProviderError = { error?: { code?: number; message?: string; status?: string } };

function selectedProvider(): AIProvider {
  return process.env.AI_PROVIDER?.trim().toLocaleLowerCase("en-US") === "gemini"
    ? "gemini"
    : "openai";
}

function selectedModel(provider: AIProvider) {
  const configuredModel = process.env.AI_MODEL?.trim();
  if (configuredModel) return configuredModel;
  if (provider === "openai") return process.env.OPENAI_CHAT_MODEL?.trim() || "gpt-5.6-luna";
  return "gemini-3.6-flash";
}

function extractOpenAIText(payload: OpenAIResponse) {
  return payload.output
    ?.flatMap((item) => item.content ?? [])
    .filter((content) => content.type === "output_text" && typeof content.text === "string")
    .map((content) => content.text!.trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

async function generateWithOpenAI(input: GenerationInput) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: selectedModel("openai"),
      instructions: input.instructions,
      input: input.messages,
      max_output_tokens: input.maxOutputTokens,
      store: false,
    }),
    signal: AbortSignal.timeout(12_000),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Provedor OpenAI não respondeu", { status: response.status, error: error.slice(0, 500) });
    return null;
  }
  return extractOpenAIText((await response.json()) as OpenAIResponse) || null;
}

async function generateWithGemini(input: GenerationInput) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  const model = selectedModel("gemini").replace(/^models\//, "");
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const contents = input.messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: input.instructions }] },
      contents,
      generationConfig: {
        maxOutputTokens: input.maxOutputTokens,
        temperature: 0.4,
        thinkingConfig: { thinkingLevel: "minimal" },
      },
    }),
    signal: AbortSignal.timeout(12_000),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as ProviderError;
    console.error("Provedor Gemini não respondeu", {
      status: response.status,
      code: payload.error?.status,
      message: payload.error?.message,
    });
    return null;
  }

  const payload = (await response.json()) as GeminiResponse;
  return payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text?.trim() ?? "")
    .filter(Boolean)
    .join("\n")
    .trim() || null;
}

export function generateText(input: GenerationInput) {
  return selectedProvider() === "gemini" ? generateWithGemini(input) : generateWithOpenAI(input);
}
