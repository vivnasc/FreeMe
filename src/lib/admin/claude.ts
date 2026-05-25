import { FREEME_BRAND } from "./brand";

const ANTHROPIC_API_KEY = process.env.FREEME_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || "";
const ANTHROPIC_MODEL = process.env.FREEME_ANTHROPIC_MODEL || "claude-sonnet-4-6";

const CAROUSEL_SCHEMA = {
  name: "save_carousel",
  description: "Grava um carrossel para Instagram/TikTok",
  input_schema: {
    type: "object" as const,
    properties: {
      title: { type: "string" as const },
      slides: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            layout: { type: "string" as const, enum: ["capa", "conteudo", "citacao", "cta", "assinatura"] },
            body: { type: "string" as const },
          },
          required: ["layout", "body"],
        },
      },
      caption: { type: "string" as const },
      hashtags: { type: "string" as const },
    },
    required: ["title", "slides", "caption"],
  },
};

const VIDEO_SCHEMA = {
  name: "save_video",
  description: "Grava um vídeo kinetic-text para Reels/TikTok",
  input_schema: {
    type: "object" as const,
    properties: {
      title: { type: "string" as const },
      scenes: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            text: { type: "string" as const },
            duration_sec: { type: "number" as const },
          },
          required: ["text"],
        },
      },
      caption: { type: "string" as const },
      hashtags: { type: "string" as const },
      music_prompt: { type: "string" as const },
    },
    required: ["title", "scenes", "caption"],
  },
};

interface ClaudeToolResult {
  title: string;
  slides?: { layout: string; body: string }[];
  scenes?: { text: string; duration_sec?: number }[];
  caption: string;
  hashtags?: string;
  music_prompt?: string;
}

export async function generateContent(
  type: "carousel" | "video",
  brief: string,
): Promise<ClaudeToolResult> {
  const schema = type === "carousel" ? CAROUSEL_SCHEMA : VIDEO_SCHEMA;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 4096,
      system: [
        {
          type: "text",
          text: FREEME_BRAND.persona,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: brief }],
      tools: [schema],
      tool_choice: { type: "tool", name: schema.name },
    }),
  });

  const data = await res.json();
  const toolBlock = data.content?.find(
    (b: { type: string }) => b.type === "tool_use",
  );

  if (!toolBlock) throw new Error("Claude did not return tool output");
  return toolBlock.input as ClaudeToolResult;
}
