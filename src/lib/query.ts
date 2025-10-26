import type { Env } from "./interfaces";
import { getEmbedding, cosineSimilarity, getVectorsFromKV } from "./components";

export default async function query(env: Env, text: string, top_k: number): Promise<{ id: string; text: string; embedding: number[]; score: number }[]> {
    try {
        const embedding = await getEmbedding(env, text);
        const allVectors = await getVectorsFromKV(env);
        const similarities = allVectors.map(item => ({
            ...item, score: cosineSimilarity(embedding, item.embedding) }));
        const topResults = similarities.sort((a, b) => b.score - a.score).slice(0, top_k);
        return topResults;
    } catch (error) {
        throw new Error("Error during query");
    }
}
