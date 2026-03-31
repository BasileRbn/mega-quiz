const STATS_KEY = 'megaquiz_stats';

function loadStats() {
    try {
        const stored = localStorage.getItem(STATS_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
}

function saveStats(stats) {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function recordGame(mode, score, totalRounds) {
    const stats = loadStats();
    if (!stats[mode]) {
        stats[mode] = {
            gamesPlayed: 0,
            totalScore: 0,
            bestScore: 0,
            scores: []
        };
    }

    const modeStats = stats[mode];
    modeStats.gamesPlayed += 1;
    modeStats.totalScore += score;
    modeStats.bestScore = Math.max(modeStats.bestScore, score);
    modeStats.scores.push({
        score,
        date: new Date().toISOString()
    });

    // Keep only last 50 scores
    if (modeStats.scores.length > 50) {
        modeStats.scores = modeStats.scores.slice(-50);
    }

    saveStats(stats);
    return modeStats;
}

export function getStats(mode) {
    const stats = loadStats();
    if (mode) {
        return stats[mode] || { gamesPlayed: 0, totalScore: 0, bestScore: 0, scores: [] };
    }
    return stats;
}

export function getAverageScore(mode) {
    const modeStats = getStats(mode);
    if (modeStats.gamesPlayed === 0) return 0;
    return Math.round(modeStats.totalScore / modeStats.gamesPlayed);
}

export function getTotalGamesPlayed() {
    const stats = loadStats();
    return Object.values(stats).reduce((total, mode) => total + mode.gamesPlayed, 0);
}

export function getModesPlayed() {
    const stats = loadStats();
    return Object.keys(stats).filter(mode => stats[mode].gamesPlayed > 0);
}
