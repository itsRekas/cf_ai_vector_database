import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src/index';

// For now, you'll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe('worker', () => {
	it('responds with Not Found for / (unit style)', async () => {
		const request = new IncomingRequest('http://example.com');
		// Create an empty context to pass to `worker.fetch()`.
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, { AI: {}, VECTOR_KV: {} } as any, ctx);
		// Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
		await waitOnExecutionContext(ctx);
		expect(await response.text()).toMatchInlineSnapshot(`"Not Found"`);
		expect(response.status).toBe(404);
	});

	it('responds with Not Found for / (integration style)', async () => {
		const response = await SELF.fetch('https://example.com');
		const body = await response.text();
		expect(response.status).toBe(200);
		expect(body).toContain('<!DOCTYPE html>');
	});
});
