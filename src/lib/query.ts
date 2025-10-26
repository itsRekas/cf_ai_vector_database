import type { Env } from "./interfaces";
import { getEmbedding, cosineSimilarity, getVectorsFromKV } from "./components";

export default async function query(env: Env, text: string, k: number): Promise<{ id: string; text: string; score: number }[]> {
    try {
        const embedding = await getEmbedding(env, text);
        const allVectors = await getVectorsFromKV(env);
        const similarities = allVectors.map(item => ({
            ...item, score: cosineSimilarity(embedding, item.embedding) }));
        const topResults = similarities.sort((a, b) => b.score - a.score).slice(0, k).map(({ id, text, embedding, score }) => ({ id, text, score }));
        return  topResults;
    } catch (error) {
        console.log(error)
        throw error;
    }
}
