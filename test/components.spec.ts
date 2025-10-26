import { describe, it, expect, vi } from 'vitest';
import type { Env } from '../src/lib/interfaces';
import * as components from '../src/lib/components';

describe('components', () => {
  it('cosineSimilarity: identical vectors => 1', () => {
    const a = [1, 2, 3];
    const b = [1, 2, 3];
    expect(components.cosineSimilarity(a, b)).toBeCloseTo(1);
  });

  it('cosineSimilarity: orthogonal vectors => ~0', () => {
    const a = [1, 0];
    const b = [0, 1];
    expect(components.cosineSimilarity(a, b)).toBeCloseTo(0);
  });

  it('getEmbedding: returns embedding from env.AI.run', async () => {
    const fakeEnv = { AI: { run: vi.fn().mockResolvedValue({ data: [[0.1, 0.2, 0.3]] }) } } as unknown as Env;
    const emb = await components.getEmbedding(fakeEnv, 'hello');
    expect(Array.isArray(emb)).toBe(true);
    expect(emb.length).toBe(3);
    expect((fakeEnv.AI as any).run).toHaveBeenCalled();
  });

  it('getEmbedding: throws when AI missing', async () => {
    const fakeEnv = {} as unknown as Env;
    await expect(components.getEmbedding(fakeEnv, 'hi')).rejects.toThrow(/AI binding is missing/);
  });

  it('getVectorsFromKV: lists and parses values', async () => {
    const kv = {
      list: vi.fn().mockResolvedValue({ keys: [{ name: 'k1' }], list_complete: true }),
      get: vi.fn().mockResolvedValue(JSON.stringify({ text: 'a', embedding: [1, 2, 3] })),
    } as any;
    const env = { VECTOR_KV: kv } as unknown as Env;
    const items = await components.getVectorsFromKV(env);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ id: 'k1', text: 'a' });
    expect(kv.list).toHaveBeenCalled();
    expect(kv.get).toHaveBeenCalledWith('k1');
  });
});
