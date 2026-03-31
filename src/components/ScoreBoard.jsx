import React from 'react';
import { TIMER_WARNING_THRESHOLD } from '../utils/constants';

const ScoreBoard = ({ score, round, totalRounds, targetCity, timer, maxTime = 15, lastResult, containerClassName = "hud-sidebar" }) => {
    const isTimerWarning = timer !== null && timer <= TIMER_WARNING_THRESHOLD;

    return (
        <>
            <div className={containerClassName}>
                {/* Main HUD Card */}
                <div className="sidebar-card" style={{
                    background: 'linear-gradient(145deg, rgba(17, 24, 39, 0.92), rgba(26, 32, 53, 0.95))',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
                }}>
                    <h2 className="hud-stats">
                        Score: <span style={{
                            background: 'linear-gradient(135deg, #818cf8, #6366f1)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            color: 'transparent',
                            fontFamily: "'Space Grotesk', system-ui"
                        }}>{score}</span>
                    </h2>
                    <h2 className="hud-stats" style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>
                        Round: <span style={{ color: '#94a3b8' }}>{round}/{totalRounds}</span>
                    </h2>

                    {targetCity && (
                        <div className="target-city" style={{ marginTop: '0.75rem' }}>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', marginBottom: '0.15rem' }}>Trouvez :</p>
                            <h1 style={{
                                fontSize: '2rem', lineHeight: 1.1,
                                fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif",
                                color: '#f1f5f9', fontWeight: 700,
                            }}>{targetCity.name}</h1>
                        </div>
                    )}
                </div>

                {/* Feedback Popup */}
                {lastResult && (
                    <div className="feedback-popup">
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                            Distance: <span className="dist-val">{lastResult.distance > 5000 ? '> 5000 km' : lastResult.distance.toFixed(1) + ' km'}</span>
                        </p>
                        <p className="points-val">+{lastResult.points} pts</p>
                        <div style={{ marginTop: '0.75rem' }}>
                            <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '0.4rem' }}>
                                <div style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #22d3ee)', animation: 'shrink 3s linear forwards' }}></div>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Suite automatique...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Vertical Timer */}
            {timer !== null && (
                <div className={`timer-container ${isTimerWarning ? 'timer-warning' : ''}`}>
                    <div
                        className={`timer-bar-fill ${isTimerWarning ? 'timer-bar-warning' : ''}`}
                        style={{ height: `${(timer / maxTime) * 100}%` }}
                    />
                </div>
            )}
        </>
    );
};

export default ScoreBoard;
