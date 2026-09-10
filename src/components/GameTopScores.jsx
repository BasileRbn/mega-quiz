import React, { useState, useEffect } from 'react';
import { fetchAllScoresCached, topPlayersForGame } from '../utils/leaderboardUtils';

const MEDALS = ['🥇', '🥈', '🥉'];

// Mini-classement (top 3) d'un jeu, affiché sur son écran d'accueil
const GameTopScores = ({ gameMode }) => {
    const [top, setTop] = useState(null);

    useEffect(() => {
        let cancelled = false;
        fetchAllScoresCached()
            .then(scores => { if (!cancelled) setTop(topPlayersForGame(scores, gameMode, 3)); })
            .catch(() => { if (!cancelled) setTop([]); });
        return () => { cancelled = true; };
    }, [gameMode]);

    if (!top || top.length === 0) return null;

    return (
        <div className="game-top-scores">
            <span className="game-top-title">🏆 Meilleurs scores</span>
            <div className="game-top-list">
                {top.map((p, i) => (
                    <span key={p.name} className="game-top-entry">
                        {MEDALS[i]} {p.name} <strong>{p.score}</strong>
                    </span>
                ))}
            </div>
        </div>
    );
};

export default GameTopScores;
