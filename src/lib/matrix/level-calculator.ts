// =============================================
// Matrix Level Calculator
// Recursively determines matrix levels from current user
// =============================================

export interface MemberNode {
  member_id: string;
  sponsor_id: string | null;
  [key: string]: unknown;
}

export interface MemberWithLevel extends MemberNode {
  matrix_level: number;
}

/**
 * Calculate matrix levels for all downline members
 *
 * Matrix Level Rules:
 * - Level 1: Direct enrollees (sponsor_id = currentUserId)
 * - Level 2: Enrollees of Level 1 members
 * - Level 3-5: Continue recursively
 *
 * @param currentUserId - The member_id of the current user
 * @param allMembers - All members in the system
 * @returns Members organized by level (1-5)
 */
export function calculateMatrixLevels(
  currentUserId: string,
  allMembers: MemberNode[]
): Record<number, MemberWithLevel[]> {
  const levelMap: Record<number, MemberWithLevel[]> = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
  };

  // Create a map for quick lookups
  const memberMap = new Map<string, MemberNode>();
  allMembers.forEach((m) => memberMap.set(m.member_id, m));

  // Track processed members to avoid cycles
  const processed = new Set<string>();

  // Recursive function to assign levels
  function assignLevel(memberId: string, level: number) {
    if (level > 5 || processed.has(memberId)) return;

    processed.add(memberId);
    const member = memberMap.get(memberId);
    if (!member) return;

    // Add to level map
    if (level >= 1 && level <= 5) {
      levelMap[level].push({
        ...member,
        matrix_level: level,
      });
    }

    // Find all members enrolled by this member
    const children = allMembers.filter((m) => m.sponsor_id === memberId);

    // Recursively assign next level to children
    children.forEach((child) => {
      assignLevel(child.member_id, level + 1);
    });
  }

  // Start with Level 1: Direct enrollees of current user
  const directEnrollees = allMembers.filter((m) => m.sponsor_id === currentUserId);

  directEnrollees.forEach((enrollee) => {
    assignLevel(enrollee.member_id, 1);
  });

  return levelMap;
}

/**
 * Get max matrix depth based on tech rank
 *
 * From TECH_RANK_REQUIREMENTS:
 * - Starter: L1 only
 * - Bronze: L1-L2
 * - Silver: L1-L3
 * - Gold: L1-L4
 * - Platinum+: L1-L5
 */
export function getMaxMatrixDepth(techRank: string): number {
  const rankDepths: Record<string, number> = {
    starter: 1,
    bronze: 2,
    silver: 3,
    gold: 4,
    platinum: 5,
    ruby: 5,
    diamond: 5,
    crown: 5,
    elite: 5,
  };

  return rankDepths[techRank] || 1;
}
