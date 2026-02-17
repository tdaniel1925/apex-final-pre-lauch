import { describe, it, expect } from 'vitest';

describe('Supabase Configuration', () => {
  it('should have required environment variables', () => {
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined();
  });

  it('should have valid Supabase URL format', () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    expect(url).toMatch(/^https:\/\/[\w-]+\.supabase\.co$/);
  });

  it('should have anon key with correct format', () => {
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    expect(key.length).toBeGreaterThan(0);
  });
});

describe('Type Definitions', () => {
  it('should be able to import types module', async () => {
    const types = await import('@/lib/types');
    expect(types).toBeDefined();
  });
});
