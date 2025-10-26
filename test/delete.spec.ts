import { describe, it, expect, vi } from 'vitest';
import deleteFromKV from '../src/lib/delete';
import type { Env } from '../src/lib/interfaces';

describe('deleteFromKV', () => {
  it('calls KV.delete and returns true', async () => {
    const fakeKV = { delete: vi.fn().mockResolvedValue(undefined) };
    const env = { VECTOR_KV: fakeKV } as unknown as Env;
    const res = await deleteFromKV(env, 'id1');
    expect(res).toBe(true);
    expect(fakeKV.delete).toHaveBeenCalledWith('id1');
  });

  it('throws a generic error when delete fails', async () => {
    const fakeKV = { delete: vi.fn().mockRejectedValue(new Error('boom')) };
    const env = { VECTOR_KV: fakeKV } as unknown as Env;
    await expect(deleteFromKV(env, 'id2')).rejects.toThrow('Error during delete');
  });
});
