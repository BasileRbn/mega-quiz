import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, where, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore';

const Leaderboard = ({ finalScore, onRestart, gameMode }) => {
    const [scores, setScores] = useState([]);
    const [playerName, setPlayerName] = useState('');
    const [hasSaved, setHasSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (gameMode) {
            fetchScores();
        }
    }, [gameMode]);

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
            querySnapshot.forEach((doc) => {
                fetchedScores.push(doc.data());
            });
            setScores(fetchedScores);
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
            setError("Impossible de charger le classement. Vérifiez votre connexion.");
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
            fetchScores(); // Refresh list
        } catch (error) {
            console.error("Error saving score:", error);
            setError("Erreur lors de la sauvegarde. Réessayez.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-content glass-effect" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 className="title-gradient" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Partie Terminée !</h2>

            <div className="score-display" style={{ padding: '1rem 0' }}>
                <p className="text-secondary text-sm" style={{ color: '#64748b' }}>Votre Score</p>
                <p className="score-huge" style={{ color: '#3b82f6' }}>{finalScore}</p>
            </div>

            {/* Error Message */}
            {error && (
                <div style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '0.5rem',
                    color: '#dc2626',
                    marginBottom: '1rem',
                    fontSize: '0.9rem'
                }}>
                    ⚠️ {error}
                </div>
            )}

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
                            opacity: saving || !playerName.trim() ? 0.6 : 1,
                            cursor: saving ? 'wait' : 'pointer'
                        }}
                    >
                        {saving ? '⏳ Sauvegarde...' : 'Enregistrer'}
                    </button>
                </div>
            ) : (
                <p style={{ color: '#22c55e', fontWeight: 700, marginBottom: '1rem' }}>✅ Score enregistré !</p>
            )}

            <div className="leaderboard-container">
                <h3 style={{ textAlign: 'left', marginBottom: '0.5rem', color: '#0f172a' }}>Top 10</h3>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                        <p className="text-gray-500">⏳ Chargement...</p>
                    </div>
                ) : (
                    <table className="leaderboard-table">
                        <thead>
                            <tr>
                                <th>Rang</th>
                                <th>Joueur</th>
                                <th>Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scores.length > 0 ? scores.map((s, index) => (
                                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8fafc' : 'transparent' }}>
                                    <td>
                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                                    </td>
                                    <td>{s.name}</td>
                                    <td>{s.score}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" className="text-center text-gray-400 py-4">Aucun score pour le moment</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <div style={{ marginTop: '2rem' }}>
                <button className="btn-primary btn-restart" onClick={onRestart}>
                    Rejouer 🔄
                </button>
            </div>
        </div>
    );
};

export default Leaderboard;

