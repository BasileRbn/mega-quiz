import React from 'react';
import { getStats, getAverageScore, getTotalGamesPlayed } from '../utils/statsManager';
import { getAchievements, getUnlockedCount, getTotalCount } from '../utils/achievements';

const MODE_LABELS = {
    france: { name: 'Villes de France', icon: '🇫🇷' },
    world: { name: 'Capitales du Monde', icon: '🌍' },
    countries: { name: 'Pays du Monde', icon: '🗺️' },
    history: { name: 'Histoire de France', icon: '📜' },
    disney: { name: 'Quiz Disney', icon: '✨' },
    pokemon: { name: 'Quiz Pokémon', icon: '⚡' },
};

const StatsPanel = ({ onClose }) => {
    const allStats = getStats();
    const totalGames = getTotalGamesPlayed();
    const achievements = getAchievements();
    const unlockedCount = getUnlockedCount();

    return (
        <div className="absolute-cover modal-overlay z-high" onClick={onClose}>
            <div className="modal-content glass-effect" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '85vh', overflowY: 'auto' }}>
                <h1 className="title-gradient" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Statistiques</h1>

                {/* Global Stats */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', padding: '1rem 2rem', borderRadius: '1rem', color: 'white', textAlign: 'center', minWidth: '120px' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 900 }}>{totalGames}</div>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>Parties jouées</div>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', padding: '1rem 2rem', borderRadius: '1rem', color: 'white', textAlign: 'center', minWidth: '120px' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 900 }}>{unlockedCount}/{getTotalCount()}</div>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>Achievements</div>
                    </div>
                </div>

                {/* Per-Mode Stats */}
                <h3 style={{ textAlign: 'left', marginBottom: '0.5rem', color: '#0f172a' }}>Par mode de jeu</h3>
                <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {Object.entries(MODE_LABELS).map(([mode, { name, icon }]) => {
                        const modeStats = allStats[mode];
                        if (!modeStats || modeStats.gamesPlayed === 0) {
                            return (
                                <div key={mode} style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '0.75rem', gap: '1rem', opacity: 0.5 }}>
                                    <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                                    <span style={{ flex: 1, fontWeight: 600, color: '#64748b' }}>{name}</span>
                                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Pas encore joué</span>
                                </div>
                            );
                        }
                        return (
                            <div key={mode} style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '0.75rem', gap: '1rem' }}>
                                <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                                <span style={{ flex: 1, fontWeight: 600, color: '#1e293b' }}>{name}</span>
                                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontWeight: 700, color: '#3b82f6' }}>{modeStats.gamesPlayed}</div>
                                        <div style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase' }}>parties</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontWeight: 700, color: '#22c55e' }}>{modeStats.bestScore}</div>
                                        <div style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase' }}>meilleur</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontWeight: 700, color: '#f59e0b' }}>{getAverageScore(mode)}</div>
                                        <div style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase' }}>moyenne</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Achievements */}
                <h3 style={{ textAlign: 'left', marginBottom: '0.5rem', color: '#0f172a' }}>Achievements</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {achievements.map(a => (
                        <div key={a.id} style={{
                            textAlign: 'center',
                            padding: '1rem 0.5rem',
                            borderRadius: '1rem',
                            background: a.unlocked ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : '#f1f5f9',
                            border: a.unlocked ? '2px solid #f59e0b' : '2px solid #e2e8f0',
                            opacity: a.unlocked ? 1 : 0.5
                        }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.25rem', filter: a.unlocked ? 'none' : 'grayscale(100%)' }}>{a.icon}</div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: a.unlocked ? '#92400e' : '#94a3b8' }}>{a.name}</div>
                            <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.2rem' }}>{a.description}</div>
                        </div>
                    ))}
                </div>

                <button onClick={onClose} className="btn-primary" style={{ marginTop: '0.5rem' }}>
                    Fermer
                </button>
            </div>
        </div>
    );
};

export default StatsPanel;
