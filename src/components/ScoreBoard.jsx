import React from 'react';
import { TIMER_WARNING_THRESHOLD } from '../utils/constants';

const ScoreBoard = ({ score, round, totalRounds, targetCity, timer, maxTime = 15, lastResult, containerClassName = "hud-sidebar" }) => {
    const isTimerWarning = timer !== null && timer <= TIMER_WARNING_THRESHOLD;

    return (
        <>
            <div className={containerClassName}>
                {/* Main HUD - Left Side Sidebar */}
                <div className="sidebar-card glass-effect">
                    <h2 className="hud-stats">
                        Score: <span style={{ color: '#2563eb' }}>{score}</span>
                    </h2>
                    <h2 className="hud-stats" style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>
                        Round: {round}/{totalRounds}
                    </h2>

                    {targetCity && (
                        <div className="target-city mt-4">
                            <p className="subtitle" style={{ margin: 0, fontSize: '0.9rem', marginBottom: '0.2rem' }}>Trouvez la ville :</p>
                            <h1 style={{ fontSize: '2.2rem', lineHeight: 1.1 }}>{targetCity.name}</h1>
                        </div>
                    )}
                </div>

                {/* Feedback Popup */}
                {lastResult && (
                    <div className="feedback-popup">
                        <p className="dist-text">
                            Distance: <span className="dist-val">{lastResult.distance > 5000 ? '> 5000 km' : lastResult.distance.toFixed(1) + ' km'}</span>
                        </p>
                        <p className="points-val">+{lastResult.points} pts</p>
                        <div className="mt-4 flex flex-col items-center">
                            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mb-2">
                                <div className="h-full bg-white animate-progress" style={{ width: '100%', animation: 'shrink 3s linear forwards' }}></div>
                            </div>
                            <span className="text-sm opacity-80">Suite automatique...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Vertical Timer - Right Side */}
            {/* Explicitly Checking for timer value to not render if null */}
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

