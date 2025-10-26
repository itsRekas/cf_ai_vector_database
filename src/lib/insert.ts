import type { Env } from "./interfaces";
import { getEmbedding } from "./components";

export default async function insert(env: Env, id: string, text: string): Promise<boolean> {
    try {
        const embedding = await getEmbedding(env, text);
        await env.VECTOR_KV.put(id, JSON.stringify({ text, embedding }));
        return true;
    } catch (error) {
        throw new Error("Error during insert");
    }
    
}