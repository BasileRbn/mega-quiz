import React, { useState, useEffect } from 'react';
import { fetchAllScores, generalRanking, topPlayersForGame, GAME_LABELS } from '../utils/leaderboardUtils';

const MEDALS = ['🥇', '🥈', '🥉'];

// Tableau des champions affiché sur l'accueil :
// podium du classement général + détail par jeu dans une fenêtre.
const HallOfFame = () => {
    const [scores, setScores] = useState(null); // null = chargement
    const [error, setError] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [selectedGame, setSelectedGame] = useState('general');

    useEffect(() => {
        let cancelled = false;
        fetchAllScores()
            .then(s => { if (!cancelled) setScores(s); })
            .catch(e => {
                console.error('Erreur de chargement des scores :', e);
                if (!cancelled) setError(true);
            });
        return () => { cancelled = true; };
    }, []);

    if (error) return null; // hors ligne : on n'encombre pas l'accueil
    if (scores === null) {
        return <div className="hall-of-fame"><p className="hof-loading">⏳ Chargement des champions…</p></div>;
    }
    if (scores.length === 0) return null;

    const ranking = generalRanking(scores);
    const podium = ranking.slice(0, 3);
    const playedGames = Object.keys(GAME_LABELS).filter(g => scores.some(s => s.gameMode === g));

    return (
        <div className="hall-of-fame">
            <div className="hof-header">
                <span className="hof-title">🏆 Les Champions</span>
                <button className="hof-details-btn" onClick={() => setShowDetails(true)}>
                    Voir les classements
                </button>
            </div>
            <div className="hof-podium">
                {podium.map((p, i) => (
                    <div key={p.name} className={`hof-podium-card rank-${i + 1}`}>
                        <span className="hof-medal">{MEDALS[i]}</span>
                        <span className="hof-name">{p.name}</span>
                        <span className="hof-points">{p.points} pts</span>
                    </div>
                ))}
            </div>

            {showDetails && (
                <div className="modal-overlay absolute-cover" style={{ position: 'fixed', zIndex: 5000 }} onClick={() => setShowDetails(false)}>
                    <div className="modal-content glass-effect" style={{ maxWidth: '640px', maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                        <h2 className="title-gradient" style={{ fontSize: '1.8rem' }}>🏆 Classements</h2>

                        <div className="hof-tabs">
                            <button
                                className={`hof-tab ${selectedGame === 'general' ? 'active' : ''}`}
                                onClick={() => setSelectedGame('general')}
                            >
                                🏆 Général
                            </button>
                            {playedGames.map(g => (
                                <button
                                    key={g}
                                    className={`hof-tab ${selectedGame === g ? 'active' : ''}`}
                                    onClick={() => setSelectedGame(g)}
                                >
                                    {GAME_LABELS[g]}
                                </button>
                            ))}
                        </div>

                        {selectedGame === 'general' ? (
                            <table className="leaderboard-table">
                                <thead>
                                    <tr><th>Rang</th><th>Joueur</th><th>Médailles</th><th>Points</th></tr>
                                </thead>
                                <tbody>
                                    {ranking.map((p, i) => (
                                        <tr key={p.name}>
                                            <td>{MEDALS[i] || i + 1}</td>
                                            <td>{p.name}</td>
                                            <td>
                                                {p.gold > 0 && `🥇×${p.gold} `}
                                                {p.silver > 0 && `🥈×${p.silver} `}
                                                {p.bronze > 0 && `🥉×${p.bronze}`}
                                            </td>
                                            <td style={{ fontWeight: 800 }}>{p.points}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <table className="leaderboard-table">
                                <thead>
                                    <tr><th>Rang</th><th>Joueur</th><th>Meilleur score</th></tr>
                                </thead>
                                <tbody>
                                    {topPlayersForGame(scores, selectedGame, 10).map((p, i) => (
                                        <tr key={p.name}>
                                            <td>{MEDALS[i] || i + 1}</td>
                                            <td>{p.name}</td>
                                            <td style={{ fontWeight: 800 }}>{p.score}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        <p style={{ fontSize: '0.8rem', color: '#6d6a9c', marginTop: '1rem' }}>
                            Classement général : sur chaque jeu, le 1er gagne 3 points, le 2e 2 points et le 3e 1 point.
                        </p>

                        <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowDetails(false)}>
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HallOfFame;
