/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import type { Env, InsertRequest, QueryRequest, DeleteRequest } from "./lib/interfaces";
import insert from "./lib/insert";
import query from "./lib/query";
import deleteFromKV from "./lib/delete";

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		switch (url.pathname) {
			case "/insert":
				if (request.method !== "POST") {
					return new Response("Method Not Allowed", { status: 405 });
				}
				try{
					const { id, text } = (await request.json()) as InsertRequest;
					const success = await insert(env, id, text);
					return new Response(JSON.stringify({ success }), { status: success ? 200 : 500 });
				} catch (error) {
					return new Response("Bad Request", { status: 400, statusText: (error as Error).message });
				}
				
			case "/query":
				if (request.method !== "POST") {
					return new Response("Method Not Allowed", { status: 405 });
				}
				try{
					const { text, top_k=5 } = (await request.json()) as QueryRequest;
					const results = await query(env, text, top_k);
					return new Response(JSON.stringify({ results }), { status: 200 });
				} catch (error) {
					return new Response("Bad Request", { status: 400, statusText: (error as Error).message });
				}
				
			case "/delete":
				if (request.method !== "POST") {
					return new Response("Method Not Allowed", { status: 405 });
				}
				try{
					const { id } = (await request.json()) as DeleteRequest;
					const success = await deleteFromKV(env, id);
					return new Response(JSON.stringify({ success }), { status: success ? 200 : 500 });
				} catch (error) {
					return new Response("Bad Request", { status: 400, statusText: (error as Error).message });
				}

			default:
				return new Response("Not Found", { status: 404 });
		}
	},
} satisfies ExportedHandler<Env>;
