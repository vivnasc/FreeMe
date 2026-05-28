const REPLICATE_API = "https://api.replicate.com/v1";
const MODEL = "black-forest-labs/flux-1.1-pro-ultra";

export type AspectRatio = "1:1" | "4:5" | "16:9" | "9:16" | "21:9" | "2:3" | "3:2";

export interface GenerateImageInput {
  prompt: string;
  aspectRatio: AspectRatio;
  raw?: boolean;
  outputFormat?: "jpg" | "png" | "webp";
  safetyTolerance?: number;
}

interface ReplicatePrediction {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output: string | string[] | null;
  error: string | null;
  urls: { get: string };
}

export async function generateImage(input: GenerateImageInput): Promise<string> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error("REPLICATE_API_TOKEN nao esta definido nas env vars");

  const res = await fetch(`${REPLICATE_API}/models/${MODEL}/predictions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "wait=55",
    },
    body: JSON.stringify({
      input: {
        prompt: input.prompt,
        aspect_ratio: input.aspectRatio,
        raw: input.raw ?? false,
        output_format: input.outputFormat ?? "jpg",
        safety_tolerance: input.safetyTolerance ?? 2,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Replicate ${res.status}: ${err.slice(0, 200)}`);
  }

  let data = (await res.json()) as ReplicatePrediction;

  // Se o Prefer wait nao deu, faz poll ate succeeded/failed
  const startedAt = Date.now();
  while (data.status === "starting" || data.status === "processing") {
    if (Date.now() - startedAt > 55_000) {
      throw new Error(`Replicate timeout (>55s): ${data.id}`);
    }
    await new Promise((r) => setTimeout(r, 1500));
    const pollRes = await fetch(data.urls.get, {
      headers: { Authorization: `Bearer ${token}` },
    });
    data = (await pollRes.json()) as ReplicatePrediction;
  }

  if (data.status !== "succeeded") {
    throw new Error(`Replicate ${data.status}: ${data.error || "unknown"}`);
  }

  const output = data.output;
  if (!output) throw new Error("Replicate: sem output");
  return typeof output === "string" ? output : output[0];
}
