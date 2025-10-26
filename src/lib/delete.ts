import { Env } from "./interfaces";

export default async function deleteFromKV(env: Env, id: string): Promise<boolean> {
    try {
        await env.VECTOR_KV.delete(id);
        return true;
    } catch (error) {
        throw new Error("Error during delete");
    }
}