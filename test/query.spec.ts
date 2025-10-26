import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import query from '../src/lib/query';
import * as components from '../src/lib/components';

describe('query', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns top-k items sorted by cosine similarity', async () => {
    // stub getEmbedding and getVectorsFromKV
    vi.spyOn(components, 'getEmbedding').mockResolvedValue([1, 0]);
    vi.spyOn(components, 'getVectorsFromKV').mockResolvedValue([
      { id: 'a', text: 'A', embedding: [1, 0] },
      { id: 'b', text: 'B', embedding: [0, 1] },
      { id: 'c', text: 'C', embedding: [0.9, 0.1] },
    ] as any);

    const results = await query({} as any, 'query text', 2);
    expect(results).toHaveLength(2);
    // highest similarity should be 'a', then 'c'
    expect(results[0].id).toBe('a');
    expect(results[1].id).toBe('c');
    expect(typeof results[0].score).toBe('number');
  });
});
