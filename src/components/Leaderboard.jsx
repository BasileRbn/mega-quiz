import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, where, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore';
import { recordGame } from '../utils/statsManager';
import { checkAchievements } from '../utils/achievements';
import { getStats } from '../utils/statsManager';

const Leaderboard = ({ finalScore, onRestart, gameMode }) => {
    const [scores, setScores] = useState([]);
    const [playerName, setPlayerName] = useState('');
    const [hasSaved, setHasSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (gameMode) fetchScores();
    }, [gameMode]);

    useEffect(() => {
        recordGame(gameMode, finalScore, 20);
        const stats = getStats();
        checkAchievements(stats);
    }, [gameMode, finalScore]);

    const fetchScores = async () => {
        setLoading(true);
        setError(null);
        try {
            const q = query(
                collection(db, "scores"),
                where("gameMode", "==", gameMode),
                orderBy("score", "desc"),
                limit(10)
            );
            const querySnapshot = await getDocs(q);
            const fetchedScores = [];
            querySnapshot.forEach((doc) => fetchedScores.push(doc.data()));
            setScores(fetchedScores);
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
            setError("Impossible de charger le classement.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!playerName.trim()) return;
        setSaving(true);
        setError(null);
        try {
            await addDoc(collection(db, "scores"), {
                name: playerName.trim(),
                score: finalScore,
                gameMode: gameMode,
                timestamp: serverTimestamp(),
                date: new Date().toLocaleDateString()
            });
            setHasSaved(true);
            fetchScores();
        } catch (error) {
            console.error("Error saving score:", error);
            setError("Erreur lors de la sauvegarde.");
        } finally {
            setSaving(false);
        }
    };

    const medals = ['🥇', '🥈', '🥉'];

    return (
        <div style={{
            maxWidth: '480px', width: '92%',
            padding: '2.5rem 2rem',
            borderRadius: '2rem',
            background: 'linear-gradient(145deg, rgba(17, 24, 39, 0.96), rgba(26, 32, 53, 0.98))',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
            color: '#f1f5f9',
            maxHeight: '90vh', overflowY: 'auto',
            textAlign: 'center',
        }}>
            <h2 style={{
                fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif",
                fontSize: '1.8rem', fontWeight: 700,
                background: 'linear-gradient(135deg, #818cf8, #6366f1, #22d3ee)',
                WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
                marginBottom: '0.5rem'
            }}>Partie Terminee !</h2>

            {/* Score Display */}
            <div style={{ padding: '1rem 0' }}>
                <p style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Votre Score</p>
                <p className="score-huge">{finalScore}</p>
            </div>

            {/* Error */}
            {error && (
                <div style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '0.75rem',
                    color: '#f87171',
                    marginBottom: '1rem',
                    fontSize: '0.85rem'
                }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Save Score */}
            {!hasSaved ? (
                <div className="leaderboard-input-group">
                    <input
                        type="text"
                        className="leaderboard-input"
                        placeholder="Votre Nom"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        maxLength={15}
                        disabled={saving}
                    />
                    <button
                        className="leaderboard-btn-save"
                        onClick={handleSave}
                        disabled={saving || !playerName.trim()}
                        style={{
                            opacity: saving || !playerName.trim() ? 0.5 : 1,
                            cursor: saving ? 'wait' : 'pointer'
                        }}
                    >
                        {saving ? '⏳' : 'Sauver'}
                    </button>
                </div>
            ) : (
                <p style={{
                    color: '#34d399', fontWeight: 700, marginBottom: '1rem',
                    padding: '0.5rem 1rem',
                    background: 'rgba(52, 211, 153, 0.1)',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(52, 211, 153, 0.2)',
                    fontSize: '0.9rem',
                }}>✅ Score enregistre !</p>
            )}

            {/* Leaderboard */}
            <div className="leaderboard-container">
                <h3 style={{
                    textAlign: 'left', marginBottom: '0.5rem',
                    color: '#94a3b8', fontSize: '0.75rem',
                    textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700
                }}>Top 10</h3>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem', animation: 'pulse 1.5s infinite' }}>⏳</div>
                        Chargement...
                    </div>
                ) : (
                    <table className="leaderboard-table">
                        <thead>
                            <tr>
                                <th>Rang</th>
                                <th>Joueur</th>
                                <th style={{ textAlign: 'right' }}>Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scores.length > 0 ? scores.map((s, index) => (
                                <tr key={index}>
                                    <td style={{ fontSize: index < 3 ? '1.1rem' : '0.9rem' }}>
                                        {index < 3 ? medals[index] : index + 1}
                                    </td>
                                    <td style={{ color: index === 0 ? '#fbbf24' : '#cbd5e1' }}>{s.name}</td>
                                    <td style={{
                                        textAlign: 'right',
                                        fontFamily: "'Space Grotesk', system-ui",
                                        fontWeight: 700,
                                        color: index === 0 ? '#fbbf24' : index < 3 ? '#818cf8' : '#94a3b8'
                                    }}>{s.score}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'center', color: '#64748b', padding: '1rem' }}>
                                        Aucun score pour le moment
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Replay Button */}
            <div style={{ marginTop: '1.5rem' }}>
                <button onClick={onRestart} style={{
                    background: 'linear-gradient(135deg, #10b981, #34d399)',
                    color: 'white',
                    padding: '0.85rem 2.5rem',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif",
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(52, 211, 153, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                    transition: 'all 0.3s',
                }}>
                    Rejouer 🔄
                </button>
            </div>
        </div>
    );
};

export default Leaderboard;
