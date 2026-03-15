const ACHIEVEMENTS_KEY = 'megaquiz_achievements';

const ACHIEVEMENT_DEFINITIONS = [
    { id: 'first_game', name: 'Première Partie', description: 'Jouer votre première partie', icon: '🎮', condition: (stats) => Object.values(stats).some(m => m.gamesPlayed >= 1) },
    { id: 'ten_games', name: 'Habitué', description: 'Jouer 10 parties', icon: '🔟', condition: (stats) => Object.values(stats).reduce((t, m) => t + m.gamesPlayed, 0) >= 10 },
    { id: 'all_modes', name: 'Globe Trotter', description: 'Jouer tous les modes', icon: '🌍', condition: (stats) => Object.keys(stats).filter(m => stats[m].gamesPlayed > 0).length >= 5 },
    { id: 'perfect_score', name: 'Perfection', description: 'Obtenir 1000 points en un round', icon: '💎', condition: (_, game) => game?.lastRoundScore >= 1000 },
    { id: 'high_scorer', name: 'Champion', description: 'Atteindre 15 000 points', icon: '🏆', condition: (stats) => Object.values(stats).some(m => m.bestScore >= 15000) },
    { id: 'speed_demon', name: 'Speed Demon', description: 'Répondre en moins de 3 secondes', icon: '⚡', condition: (_, game) => game?.answerTime <= 3 },
    { id: 'france_master', name: 'Expert France', description: 'Score > 10000 en Villes de France', icon: '🇫🇷', condition: (stats) => stats.france?.bestScore >= 10000 },
    { id: 'world_master', name: 'Expert Monde', description: 'Score > 10000 en Capitales', icon: '🗺️', condition: (stats) => stats.world?.bestScore >= 10000 },
    { id: 'history_buff', name: 'Historien', description: 'Score > 10000 en Histoire', icon: '📜', condition: (stats) => stats.history?.bestScore >= 10000 },
    { id: 'quiz_master', name: 'Quiz Master', description: 'Score > 10000 en Quiz Personnages', icon: '⭐', condition: (stats) => stats.disney?.bestScore >= 10000 || stats.pokemon?.bestScore >= 10000 },
];

function loadUnlocked() {
    try {
        const stored = localStorage.getItem(ACHIEVEMENTS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveUnlocked(unlocked) {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(unlocked));
}

export function checkAchievements(stats, gameContext = null) {
    const unlocked = loadUnlocked();
    const newlyUnlocked = [];

    for (const achievement of ACHIEVEMENT_DEFINITIONS) {
        if (unlocked.includes(achievement.id)) continue;

        try {
            if (achievement.condition(stats, gameContext)) {
                unlocked.push(achievement.id);
                newlyUnlocked.push(achievement);
            }
        } catch {
            // Skip if condition fails
        }
    }

    if (newlyUnlocked.length > 0) {
        saveUnlocked(unlocked);
    }

    return newlyUnlocked;
}

export function getAchievements() {
    const unlocked = loadUnlocked();
    return ACHIEVEMENT_DEFINITIONS.map(a => ({
        ...a,
        unlocked: unlocked.includes(a.id)
    }));
}

export function getUnlockedCount() {
    return loadUnlocked().length;
}

export function getTotalCount() {
    return ACHIEVEMENT_DEFINITIONS.length;
}
