import { db } from '../firebase';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';

// Base de scores hybride : toujours sauvegardé en local (localStorage),
// et envoyé sur Firebase quand la connexion/les règles le permettent.
// À la lecture, on fusionne les deux (les doublons sont éliminés via `cid`).

// Libellés des jeux (gameMode -> nom affiché)
export const GAME_LABELS = {
    france: '🇫🇷 Villes de France',
    world: '🌍 Capitales du Monde',
    countries: '🗺️ Pays du Monde',
    history: '📜 Histoire de France',
    disney: '✨ Quiz Disney',
    pokemon: '⚡ Quiz Pokémon',
    memory: '🃏 Memory',
    math: '🧮 Calcul Magique',
    simon: '🌈 Simon des Couleurs',
    action: '⭐ Pluie d\'Étoiles', // ancien jeu, conservé pour les scores déjà enregistrés
    invaders: '👾 Space Invaders',
    words: '📖 Le Mot Mystère',
    who: '🕵️ Qui suis-je ?',
};

const LAST_NAME_KEY = 'mega_quiz_last_player';
const LOCAL_SCORES_KEY = 'mega_quiz_scores';

export function getLastPlayerName() {
    return localStorage.getItem(LAST_NAME_KEY) || '';
}

export function setLastPlayerName(name) {
    localStorage.setItem(LAST_NAME_KEY, name);
}

function readLocalScores() {
    try {
        const list = JSON.parse(localStorage.getItem(LOCAL_SCORES_KEY));
        return Array.isArray(list) ? list : [];
    } catch {
        return [];
    }
}

function writeLocalScores(list) {
    localStorage.setItem(LOCAL_SCORES_KEY, JSON.stringify(list));
}

// Enregistre un score. Retourne { online } : false = sauvé en local seulement.
export async function saveScore(gameMode, name, score) {
    const cleanName = name.trim();
    setLastPlayerName(cleanName);

    const entry = {
        cid: `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name: cleanName,
        score,
        gameMode,
        date: new Date().toLocaleDateString(),
    };

    writeLocalScores([...readLocalScores(), entry]);
    scoresCache = null; // le prochain affichage rechargera les classements

    try {
        await addDoc(collection(db, 'scores'), { ...entry, timestamp: serverTimestamp() });
        return { online: true };
    } catch (e) {
        console.warn('Score enregistré en local uniquement :', e?.code || e);
        return { online: false };
    }
}

// Cache court pour éviter de re-télécharger les scores à chaque écran
let scoresCache = null;
let scoresCacheTime = 0;

export async function fetchAllScoresCached(maxAgeMs = 60000) {
    if (scoresCache && Date.now() - scoresCacheTime < maxAgeMs) return scoresCache;
    scoresCache = await fetchAllScores();
    scoresCacheTime = Date.now();
    return scoresCache;
}

// Récupère tous les scores (Firebase + locaux), sans doublons.
export async function fetchAllScores() {
    const local = readLocalScores();
    const remote = [];
    try {
        const snapshot = await getDocs(collection(db, 'scores'));
        snapshot.forEach(doc => {
            const d = doc.data();
            if (d && d.name && typeof d.score === 'number' && d.gameMode) {
                remote.push({ cid: d.cid, name: d.name, score: d.score, gameMode: d.gameMode });
            }
        });
    } catch (e) {
        console.warn('Scores en ligne indisponibles, utilisation des scores locaux :', e?.code || e);
    }

    const remoteCids = new Set(remote.map(r => r.cid).filter(Boolean));
    return [...remote, ...local.filter(l => !remoteCids.has(l.cid))];
}

// Top N brut pour un jeu (toutes parties confondues)
export function topScoresForGame(scores, gameMode, limit = 10) {
    return scores
        .filter(s => s.gameMode === gameMode)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}

const playerKey = (name) => name.trim().toLowerCase();

const displayName = (name) => {
    const n = name.trim();
    return n.charAt(0).toUpperCase() + n.slice(1);
};

// Meilleur score de chaque joueur pour un jeu, trié décroissant
export function topPlayersForGame(scores, gameMode, limit = 5) {
    const best = new Map();
    scores
        .filter(s => s.gameMode === gameMode)
        .forEach(s => {
            const key = playerKey(s.name);
            if (!best.has(key) || s.score > best.get(key).score) {
                best.set(key, { name: displayName(s.name), score: s.score });
            }
        });
    return [...best.values()].sort((a, b) => b.score - a.score).slice(0, limit);
}

// Classement général : sur chaque jeu, le meilleur joueur gagne 3 pts,
// le 2e 2 pts, le 3e 1 pt. On additionne les points de tous les jeux.
export function generalRanking(scores) {
    const games = [...new Set(scores.map(s => s.gameMode))];
    const totals = new Map(); // key -> { name, points, gold, silver, bronze }

    games.forEach(game => {
        const podium = topPlayersForGame(scores, game, 3);
        podium.forEach((p, rank) => {
            const key = playerKey(p.name);
            if (!totals.has(key)) {
                totals.set(key, { name: p.name, points: 0, gold: 0, silver: 0, bronze: 0 });
            }
            const t = totals.get(key);
            t.points += 3 - rank;
            if (rank === 0) t.gold++;
            else if (rank === 1) t.silver++;
            else t.bronze++;
        });
    });

    return [...totals.values()].sort((a, b) =>
        b.points - a.points || b.gold - a.gold || b.silver - a.silver
    );
}
