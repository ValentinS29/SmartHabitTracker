/**
 * Calculate the XP required to reach a specific level
 * Formula: 100 + (level - 1) * 25
 */
export const getRequiredXP = (level: number): number => {
  return 100 + (level - 1) * 25;
};

/**
 * Calculate cumulative XP needed to reach a level from level 1
 */
export const getCumulativeXP = (targetLevel: number): number => {
  let total = 0;
  for (let level = 1; level < targetLevel; level++) {
    total += getRequiredXP(level);
  }
  return total;
};

/**
 * Calculate current level from total XP
 */
export const computeLevelFromXP = (xpTotal: number): number => {
  let level = 1;
  let cumulativeXP = 0;

  while (cumulativeXP + getRequiredXP(level) <= xpTotal) {
    cumulativeXP += getRequiredXP(level);
    level++;
  }

  return level;
};

/**
 * Calculate XP progress within current level
 */
export const getXPIntoLevel = (xpTotal: number, level: number): number => {
  const cumulativeXP = getCumulativeXP(level);
  return xpTotal - cumulativeXP;
};

/**
 * Calculate XP needed to reach next level
 */
export const getXPToNextLevel = (xpTotal: number, level: number): number => {
  const xpIntoLevel = getXPIntoLevel(xpTotal, level);
  const requiredForNext = getRequiredXP(level);
  return requiredForNext - xpIntoLevel;
};

/**
 * Calculate progress percentage to next level (0-1)
 */
export const getLevelProgress = (xpTotal: number, level: number): number => {
  const xpIntoLevel = getXPIntoLevel(xpTotal, level);
  const requiredForNext = getRequiredXP(level);
  return xpIntoLevel / requiredForNext;
};
