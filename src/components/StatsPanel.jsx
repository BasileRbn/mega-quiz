import React from 'react';
import { getStats, getAverageScore, getTotalGamesPlayed } from '../utils/statsManager';
import { getAchievements, getUnlockedCount, getTotalCount } from '../utils/achievements';

const MODE_LABELS = {
    france: { name: 'Villes de France', icon: '🇫🇷' },
    world: { name: 'Capitales du Monde', icon: '🌍' },
    countries: { name: 'Pays du Monde', icon: '🗺️' },
    history: { name: 'Histoire de France', icon: '📜' },
    disney: { name: 'Quiz Disney', icon: '✨' },
    pokemon: { name: 'Quiz Pokemon', icon: '⚡' },
};

const StatBadge = ({ value, label, gradient }) => (
    <div style={{
        background: gradient,
        padding: '1.25rem 1.5rem',
        borderRadius: '1.25rem',
        color: 'white',
        textAlign: 'center',
        minWidth: '130px',
        flex: 1,
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        overflow: 'hidden',
    }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.15), transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ fontSize: '2.2rem', fontWeight: 700, fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif", position: 'relative' }}>{value}</div>
        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.85, fontWeight: 600, position: 'relative' }}>{label}</div>
    </div>
);

const StatsPanel = ({ onClose }) => {
    const allStats = getStats();
    const totalGames = getTotalGamesPlayed();
    const achievements = getAchievements();
    const unlockedCount = getUnlockedCount();

    return (
        <div className="absolute-cover modal-overlay z-high" onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{
                maxWidth: '750px', width: '92%', maxHeight: '85vh', overflowY: 'auto',
                padding: '2.5rem',
                borderRadius: '2rem',
                background: 'linear-gradient(145deg, rgba(17, 24, 39, 0.96), rgba(26, 32, 53, 0.98))',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                boxShadow: '0 30px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
                color: '#f1f5f9',
            }}>
                <h1 style={{
                    fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif",
                    fontSize: '2rem', fontWeight: 700,
                    background: 'linear-gradient(135deg, #818cf8, #6366f1, #22d3ee)',
                    WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
                    marginBottom: '1.5rem'
                }}>Statistiques</h1>

                {/* Global Stats */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    <StatBadge value={totalGames} label="Parties jouees" gradient="linear-gradient(135deg, #6366f1, #8b5cf6)" />
                    <StatBadge value={`${unlockedCount}/${getTotalCount()}`} label="Achievements" gradient="linear-gradient(135deg, #f59e0b, #ef4444)" />
                </div>

                {/* Per-Mode Stats */}
                <h3 style={{ textAlign: 'left', marginBottom: '0.75rem', color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Par mode de jeu</h3>
                <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '2rem' }}>
                    {Object.entries(MODE_LABELS).map(([mode, { name, icon }]) => {
                        const modeStats = allStats[mode];
                        const notPlayed = !modeStats || modeStats.gamesPlayed === 0;
                        return (
                            <div key={mode} style={{
                                display: 'flex', alignItems: 'center',
                                padding: '0.75rem 1rem',
                                background: notPlayed ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.04)',
                                borderRadius: '0.75rem',
                                gap: '0.75rem',
                                opacity: notPlayed ? 0.4 : 1,
                                border: '1px solid rgba(255, 255, 255, 0.04)',
                                transition: 'all 0.2s',
                            }}>
                                <span style={{ fontSize: '1.4rem' }}>{icon}</span>
                                <span style={{ flex: 1, fontWeight: 600, color: '#e2e8f0', fontSize: '0.95rem' }}>{name}</span>
                                {notPlayed ? (
                                    <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Pas encore joue</span>
                                ) : (
                                    <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontWeight: 700, color: '#818cf8', fontFamily: "'Space Grotesk', system-ui" }}>{modeStats.gamesPlayed}</div>
                                            <div style={{ color: '#64748b', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>parties</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontWeight: 700, color: '#34d399', fontFamily: "'Space Grotesk', system-ui" }}>{modeStats.bestScore}</div>
                                            <div style={{ color: '#64748b', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>meilleur</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontWeight: 700, color: '#fbbf24', fontFamily: "'Space Grotesk', system-ui" }}>{getAverageScore(mode)}</div>
                                            <div style={{ color: '#64748b', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>moyenne</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Achievements */}
                <h3 style={{ textAlign: 'left', marginBottom: '0.75rem', color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Achievements</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
                    {achievements.map(a => (
                        <div key={a.id} style={{
                            textAlign: 'center',
                            padding: '1rem 0.5rem',
                            borderRadius: '1rem',
                            background: a.unlocked
                                ? 'linear-gradient(145deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.1))'
                                : 'rgba(255, 255, 255, 0.02)',
                            border: a.unlocked
                                ? '1px solid rgba(251, 191, 36, 0.3)'
                                : '1px solid rgba(255, 255, 255, 0.04)',
                            opacity: a.unlocked ? 1 : 0.35,
                            transition: 'all 0.3s',
                        }}>
                            <div style={{
                                fontSize: '2rem', marginBottom: '0.25rem',
                                filter: a.unlocked ? 'none' : 'grayscale(100%)',
                            }}>{a.icon}</div>
                            <div style={{
                                fontSize: '0.72rem', fontWeight: 700,
                                color: a.unlocked ? '#fbbf24' : '#64748b',
                            }}>{a.name}</div>
                            <div style={{ fontSize: '0.6rem', color: '#64748b', marginTop: '0.15rem' }}>{a.description}</div>
                        </div>
                    ))}
                </div>

                <button onClick={onClose} style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: 'white',
                    padding: '0.8rem 2.5rem',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif",
                    fontSize: '1.05rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                    transition: 'all 0.3s',
                }}>
                    Fermer
                </button>
            </div>
        </div>
    );
};

export default StatsPanel;
