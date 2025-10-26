import type { Env } from "./interfaces";

export async function getEmbedding(env: Env, text: string): Promise<number[]> {
  if (!env.AI) throw new Error("AI binding is missing in deployment");

  try {
    const ai_response = await env.AI.run("@cf/baai/bge-m3", {
        text: text,
        size: 256
    });
    return ai_response.data[0];
  } catch (err) {
    console.error("AI call failed:", err);
    throw new Error("Error generating embedding: " + (err as Error).message);
  }
}


export function cosineSimilarity(vector_A: number[], vector_B: number[]): number {
    const dotProduct = vector_A.reduce((sum, a, idx) => sum + a * vector_B[idx], 0);
    const magnitudeA = Math.sqrt(vector_A.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vector_B.reduce((sum, b) => sum + b * b, 0));
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
}

export async function getVectorsFromKV(env: Env): Promise<{ id: string; text: string; embedding: number[] }[]> {
    const list: { id: string; text: string; embedding: number[] }[] = [];
    let cursor: string | undefined = undefined;
    try{
        while (true) {
            const res : any = await env.VECTOR_KV.list({ cursor });
            for (const key of res.keys) {
                const value = await env.VECTOR_KV.get(key.name);
                if (value) {
                    const parsed = JSON.parse(value);
                    list.push({ id: key.name, ...parsed });
                }
            }
            if (res.list_complete) break;
            cursor = res.cursor;
        }

        return list;
    } catch (error) {
        throw new Error("Error fetching vectors from KV");
    }
}