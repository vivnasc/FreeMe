import { FREEME_BRAND } from "./brand";

const ANTHROPIC_API_KEY = process.env.FREEME_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || "";
const ANTHROPIC_MODEL = process.env.FREEME_ANTHROPIC_MODEL || "claude-sonnet-4-6";

const IMAGE_BRAND_RULES = `Crias prompts curtos para Flux 1.1 Pro Ultra (estilo Midjourney) para a FreeMe — app terapêutica para mães baseada em constelação familiar sistémica.

ESTILO VISUAL FIXO (incluir sempre):
- Fotografia editorial cinemática, atmosfera maternal quente
- Paleta: deep terracotta #8C4A36, soft cream #FBF4EC, warm sand #F3E4D6, sage green #7D8A6A, charcoal #2E241D
- Materiais permitidos: linho cru, lã quente, cerâmica de terracota, flores secas, madeira natural
- Luz oblíqua de golden hour, chiaroscuro suave, profundidade de campo curta
- Film grain, 8k, sem texto, sem logos, sem watermarks

EVITAR ABSOLUTAMENTE:
- Close-up de caras (sem rostos colados à câmara, sem retratos frontais centrados)
- Still life de objectos a flutuar / abstractos sem contexto
- Imagens genéricas de stock / clichés visuais
- Mãos com mais de 5 dedos (descreve sempre "natural hands")

PREFERIR:
- Pessoas em interacção real (mãe e criança a tocar, gerações em conjunto, mãos a encontrarem-se)
- Pessoas vistas de lado, de costas, parcialmente fora de frame
- Cenas ambientes onde se sente presença humana mesmo sem cara visível
- A imagem DEVE eco visualmente a mensagem específica do slide (não um cliché)

OUTPUT: APENAS JSON, formato exacto:
{
  "prompt": "<prompt em inglês 30-50 palavras, terminar com --ar X:Y --s 750 --style raw>",
  "rationale": "<1 frase em português sobre como esta imagem ecoa a mensagem>"
}`;

interface ImagePromptInput {
  postTitle: string;
  postType: "carousel" | "video";
  postCategory: string;
  slideBody: string;
  slideIndex: number;
  usage: "background" | "split-top";
}

interface ImagePromptResult {
  prompt: string;
  rationale: string;
}

export async function generateImagePrompt(input: ImagePromptInput): Promise<ImagePromptResult> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY nao definido");
  }

  const aspectRatio = input.postType === "carousel" ? "4:5" : "9:16";

  const userMessage = `INPUT:
- Post: ${input.postType} da categoria "${input.postCategory}"
- Título do post: "${input.postTitle}"
- Mensagem específica deste slide: "${input.slideBody}"
- Posição: slide ${input.slideIndex} (${input.usage})
- Aspect ratio para este slide: ${aspectRatio}

Devolve APENAS o JSON, sem markdown nem texto extra.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 600,
      system: [
        {
          type: "text",
          text: IMAGE_BRAND_RULES,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text || "";
  const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*$/g, "").trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`Claude output sem JSON: ${cleaned.slice(0, 150)}`);

  const parsed = JSON.parse(jsonMatch[0]) as ImagePromptResult;
  if (!parsed.prompt) throw new Error("Claude output sem campo 'prompt'");

  return parsed;
}

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
