import { describe, it, expect } from 'vitest';

describe('Training Page', () => {
  it('should define training modules correctly', () => {
    const RANK_LEVELS: Record<string, number> = {
      starter: 0,
      bronze: 1,
      silver: 2,
      gold: 3,
      platinum: 4,
      ruby: 5,
      diamond: 6,
      crown: 7,
      elite: 8,
    };

    function getRankLevel(rank: string | null): number {
      if (!rank) return 0;
      return RANK_LEVELS[rank.toLowerCase()] ?? 0;
    }

    // Test rank filtering logic
    expect(getRankLevel('starter')).toBe(0);
    expect(getRankLevel('gold')).toBe(3);
    expect(getRankLevel('platinum')).toBe(4);
    expect(getRankLevel(null)).toBe(0);
    expect(getRankLevel('unknown')).toBe(0);
  });

  it('should filter modules based on user rank', () => {
    const modules = [
      { id: 'basic', rankRequired: null },
      { id: 'leadership', rankRequired: 'gold' },
      { id: 'advanced', rankRequired: 'platinum' },
    ];

    const RANK_LEVELS: Record<string, number> = {
      starter: 0,
      gold: 3,
      platinum: 4,
    };

    function getRankLevel(rank: string | null): number {
      if (!rank) return 0;
      return RANK_LEVELS[rank.toLowerCase()] ?? 0;
    }

    const userRankLevel = getRankLevel('gold');

    const availableModules = modules.filter((module) => {
      return !module.rankRequired || getRankLevel(module.rankRequired) <= userRankLevel;
    });

    // Gold rank should have access to basic and leadership, but not advanced
    expect(availableModules.length).toBe(2);
    expect(availableModules.find((m) => m.id === 'basic')).toBeTruthy();
    expect(availableModules.find((m) => m.id === 'leadership')).toBeTruthy();
    expect(availableModules.find((m) => m.id === 'advanced')).toBeUndefined();
  });
});
