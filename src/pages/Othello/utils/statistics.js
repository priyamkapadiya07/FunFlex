const STATS_KEY = 'funflex_othello_stats';

const DEFAULT_STATS = {
  played: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  winStreak: 0,
  maxWinStreak: 0,
  highestDifficultyDefeated: 'None'
};

const diffValue = {
  'None': 0,
  'Easy': 1,
  'Medium': 2,
  'Hard': 3,
  'Expert': 4
};

export function getStats() {
  const data = localStorage.getItem(STATS_KEY);
  if (data) {
    try {
      return { ...DEFAULT_STATS, ...JSON.parse(data) };
    } catch (e) {
      return { ...DEFAULT_STATS };
    }
  }
  return { ...DEFAULT_STATS };
}

export function saveStats(stats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function recordGameResult(result, difficulty, isSinglePlayer) {
  if (!isSinglePlayer) return; // Only track stats for single player vs AI
  
  const stats = getStats();
  stats.played += 1;
  
  if (result === 'win') {
    stats.wins += 1;
    stats.winStreak += 1;
    if (stats.winStreak > stats.maxWinStreak) {
      stats.maxWinStreak = stats.winStreak;
    }
    if (diffValue[difficulty] > diffValue[stats.highestDifficultyDefeated]) {
      stats.highestDifficultyDefeated = difficulty;
    }
  } else if (result === 'loss') {
    stats.losses += 1;
    stats.winStreak = 0;
  } else if (result === 'draw') {
    stats.draws += 1;
    stats.winStreak = 0;
  }
  
  saveStats(stats);
  return stats;
}
