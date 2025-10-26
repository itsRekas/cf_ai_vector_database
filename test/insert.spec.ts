import { describe, it, expect, vi } from 'vitest';
import insert from '../src/lib/insert';
import type { Env } from '../src/lib/interfaces';

describe('insert', () => {
  it('stores embedding and text in KV', async () => {
    const fakeKV = { put: vi.fn().mockResolvedValue(undefined) };
    const env = {
      VECTOR_KV: fakeKV,
      AI: { run: vi.fn().mockResolvedValue({ data: [[0.5, 0.5]] }) },
    } as unknown as Env;

    const res = await insert(env, 'id1', 'hello world');
    expect(res).toBe(true);
    expect(fakeKV.put).toHaveBeenCalledTimes(1);
    const [key, value] = fakeKV.put.mock.calls[0];
    expect(key).toBe('id1');
    const parsed = JSON.parse(value);
    expect(parsed.text).toBe('hello world');
    expect(Array.isArray(parsed.embedding)).toBe(true);
  });
});
