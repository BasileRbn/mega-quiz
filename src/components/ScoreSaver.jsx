import React, { useState } from 'react';
import { saveScore, getLastPlayerName } from '../utils/leaderboardUtils';

// Petit encart "Enregistre ton score" pour les écrans de fin de partie.
// Le prénom du dernier joueur est pré-rempli pour les enfants.
const ScoreSaver = ({ gameMode, score }) => {
    const [name, setName] = useState(getLastPlayerName());
    const [status, setStatus] = useState('idle'); // idle, saving, saved, savedLocal, error

    const handleSave = async () => {
        if (!name.trim()) return;
        setStatus('saving');
        try {
            const { online } = await saveScore(gameMode, name, score);
            setStatus(online ? 'saved' : 'savedLocal');
        } catch (e) {
            console.error('Erreur de sauvegarde du score :', e);
            setStatus('error');
        }
    };

    if (status === 'saved' || status === 'savedLocal') {
        return (
            <p style={{ color: '#22c55e', fontWeight: 700, margin: '0.75rem 0' }}>
                ✅ Score enregistré{status === 'savedLocal' ? ' sur cet appareil' : ''} ! Regarde le classement sur l'accueil 🏆
            </p>
        );
    }

    return (
        <div style={{ margin: '0.75rem 0' }}>
            <div className="leaderboard-input-group" style={{ marginBottom: '0.4rem' }}>
                <input
                    type="text"
                    className="leaderboard-input"
                    placeholder="Ton prénom"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={15}
                    disabled={status === 'saving'}
                />
                <button
                    className="leaderboard-btn-save"
                    onClick={handleSave}
                    disabled={status === 'saving' || !name.trim()}
                    style={{ opacity: status === 'saving' || !name.trim() ? 0.6 : 1 }}
                >
                    {status === 'saving' ? '⏳' : '💾 Enregistrer'}
                </button>
            </div>
            {status === 'error' && (
                <p style={{ color: '#dc2626', fontSize: '0.85rem' }}>
                    ⚠️ Impossible d'enregistrer. Vérifie ta connexion internet.
                </p>
            )}
        </div>
    );
};

export default ScoreSaver;
