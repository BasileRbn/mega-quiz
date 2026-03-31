import React, { useState } from 'react';
import { getMuted, toggleMute } from '../utils/sounds';

const GAME_MODES = [
    { id: 'france', icon: '🇫🇷', title: 'Villes de France', desc: 'Localisez les villes sur la carte', gradient: 'linear-gradient(135deg, #3b82f6, #6366f1)' },
    { id: 'world', icon: '🌍', title: 'Capitales du Monde', desc: 'Trouvez la capitale + Bonus Drapeau', gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)' },
    { id: 'quiz', icon: '⚡', title: 'Quiz Personnages', desc: 'Disney, Pokemon... Devenez expert !', gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
    { id: 'countries', icon: '🗺️', title: 'Pays du Monde', desc: 'Identifiez les pays sur la carte', gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' },
    { id: 'history', icon: '📜', title: 'Histoire de France', desc: 'Les lieux cultes de notre histoire', gradient: 'linear-gradient(135deg, #10b981, #34d399)' },
];

const MainMenu = ({ onSelectGame, onShowStats }) => {
    const [muted, setMuted] = useState(getMuted());

    return (
        <div className="absolute-cover z-high animated-bg"
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {/* Floating orbs background */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
                <div style={{
                    position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12), transparent 70%)',
                    top: '-10%', right: '-5%', animation: 'bgShift 20s ease-in-out infinite alternate'
                }} />
                <div style={{
                    position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(34, 211, 238, 0.08), transparent 70%)',
                    bottom: '-5%', left: '10%', animation: 'bgShift 25s ease-in-out infinite alternate-reverse'
                }} />
            </div>

            <div style={{
                position: 'relative', zIndex: 1, maxWidth: '1200px', width: '95%',
                padding: '3rem 2.5rem', paddingBottom: '2.5rem',
                borderRadius: '2rem',
                background: 'linear-gradient(145deg, rgba(17, 24, 39, 0.85), rgba(26, 32, 53, 0.9))',
                backdropFilter: 'blur(30px) saturate(180%)',
                WebkitBackdropFilter: 'blur(30px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                boxShadow: '0 30px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
                maxHeight: '90vh', overflowY: 'auto'
            }}>
                {/* Logo / Title */}
                <div style={{ marginBottom: '0.25rem' }}>
                    <h1 style={{
                        fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif",
                        fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #818cf8, #6366f1, #22d3ee, #818cf8)',
                        backgroundSize: '200% auto',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                        animation: 'shimmer 4s linear infinite',
                        letterSpacing: '-0.03em',
                        marginBottom: '0.5rem',
                        lineHeight: 1.1
                    }}>
                        MEGA QUIZ
                    </h1>
                    <style>{`@keyframes shimmer { to { background-position: 200% center; } }`}</style>
                    <p style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 500 }}>
                        L'experience geographique & culturelle ultime
                    </p>
                </div>

                {/* Game Mode Cards */}
                <div className="menu-grid">
                    {GAME_MODES.map((mode) => (
                        <div className="menu-card" key={mode.id} onClick={() => onSelectGame(mode.id)}>
                            {/* Gradient accent bar */}
                            <div style={{
                                position: 'absolute', top: 0, left: '10%', right: '10%', height: '3px',
                                background: mode.gradient, borderRadius: '0 0 4px 4px', opacity: 0.6
                            }} />
                            <div className="card-icon">{mode.icon}</div>
                            <div>
                                <h3>{mode.title}</h3>
                                <p>{mode.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Actions */}
                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={onShowStats}
                        style={{
                            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                            color: 'white',
                            fontSize: '0.95rem',
                            padding: '0.7rem 1.75rem',
                            borderRadius: '9999px',
                            fontWeight: 700,
                            fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif",
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                            transition: 'all 0.3s',
                        }}
                    >
                        📊 Stats & Achievements
                    </button>
                    <button
                        onClick={() => setMuted(toggleMute())}
                        style={{
                            background: muted
                                ? 'rgba(255, 255, 255, 0.08)'
                                : 'linear-gradient(135deg, #10b981, #34d399)',
                            color: muted ? '#94a3b8' : 'white',
                            fontSize: '0.95rem',
                            padding: '0.7rem 1.75rem',
                            borderRadius: '9999px',
                            fontWeight: 700,
                            fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif",
                            border: muted ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                            cursor: 'pointer',
                            boxShadow: muted ? 'none' : '0 4px 20px rgba(52, 211, 153, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                            transition: 'all 0.3s',
                        }}
                    >
                        {muted ? '🔇 Son off' : '🔊 Son on'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MainMenu;
