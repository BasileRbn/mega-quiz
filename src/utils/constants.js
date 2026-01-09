/**
 * Constantes centralisées pour l'application Ville de France
 */

// Nombre de manches par partie
export const ROUNDS_PER_GAME = 20;

// Limites de temps par mode de jeu (en secondes)
export const TIME_LIMITS = {
    france: 15,
    world: 15,
    quiz: 15,
    countries: 15,
    history: 20
};

// Scores
export const MAX_SCORE = 1000;
export const FLAG_BONUS = 500;
export const JOKER_SCORE = 500; // Score réduit quand joker utilisé

// Distance scoring
export const DISTANCE_THRESHOLD = {
    perfect: 5,     // < 5km = score parfait
    min: 500        // > 500km = 0 points
};

// Durées d'affichage (en ms)
export const FEEDBACK_DURATION = {
    short: 1000,    // Feedback rapide (drapeaux)
    medium: 2000,   // Feedback standard (quiz)
    long: 3000,     // Feedback carte
    extended: 4000  // Feedback histoire
};

// Seuils du multiplicateur de temps
export const TIME_MULTIPLIER_THRESHOLDS = {
    tier1: 0.66,    // >= 66% du temps restant = x3
    tier2: 0.33     // >= 33% du temps restant = x2
};

// Timer warning threshold (en secondes)
export const TIMER_WARNING_THRESHOLD = 5;
