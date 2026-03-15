import React from 'react';
import MapGame from './MapGame';
import ScoreBoard from './ScoreBoard';
import Leaderboard from './Leaderboard';
import historyData from '../data/history_cities.json';
import { useGameRound } from '../hooks/useGameRound';
import { TIME_LIMITS, ROUNDS_PER_GAME } from '../utils/constants';

const FRANCE_BOUNDS = [[41.3, -5.5], [51.1, 9.6]];

const HistoryGame = ({ onExit }) => {
    const {
        gameStatus, rounds, currentRoundIndex, score,
        lastResult, timeLeft, startGame, handleGuess, currentTarget
    } = useGameRound({
        data: historyData,
        roundCount: ROUNDS_PER_GAME,
        timeLimit: TIME_LIMITS.history,
        feedbackDuration: 4000
    });

    return (
        <div className="full-screen">
            <button className="btn-primary btn-menu" onClick={onExit}>
                🏠 Menu
            </button>

            {(gameStatus === 'playing' || gameStatus === 'feedback') && (
                <>
                    <div style={{
                        position: 'absolute',
                        bottom: '50px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1000,
                        width: '90%',
                        maxWidth: '900px',
                        pointerEvents: 'none'
                    }}>
                        <div className="glass-effect" style={{
                            padding: '1rem 2rem',
                            borderRadius: '1rem',
                            border: '1px solid rgba(255,255,255,0.3)',
                            pointerEvents: 'auto',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem' }}>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, lineHeight: 1.1 }} className="title-gradient">
                                        {currentTarget?.event}
                                    </h2>
                                </div>
                                <div style={{ flex: 1, textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                                    <span className="text-secondary" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem', display: 'block' }}>
                                        {currentTarget?.date}
                                    </span>
                                    <p style={{ fontSize: '1rem', color: '#334155', margin: 0 }}>
                                        {currentTarget?.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <MapGame
                        target={currentTarget}
                        result={lastResult}
                        onGuess={handleGuess}
                        bounds={FRANCE_BOUNDS}
                    />

                    <ScoreBoard
                        score={score}
                        round={currentRoundIndex + 1}
                        totalRounds={Math.min(rounds.length, ROUNDS_PER_GAME)}
                        targetCity={{ name: "???" }}
                        timer={gameStatus === 'playing' ? timeLeft : null}
                        maxTime={TIME_LIMITS.history}
                        lastResult={lastResult}
                    />

                    {gameStatus === 'feedback' && (
                        <div style={{ position: 'absolute', top: '120px', right: '20px', zIndex: 9999, pointerEvents: 'none' }}>
                            <div className="glass-effect p-6 rounded-3xl border-4 border-white shadow-2xl text-center flex-center flex-col" style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', minWidth: '300px', maxWidth: '400px' }}>
                                <h2 className="text-5xl font-black mb-0" style={{ color: '#0f172a', textShadow: '0 2px 10px rgba(255,255,255,0.5)' }}>
                                    {currentTarget?.city}
                                </h2>
                            </div>
                        </div>
                    )}
                </>
            )}

            {gameStatus === 'intro' && (
                <div className="absolute-cover modal-overlay z-high">
                    <div className="modal-content glass-effect">
                        <span className="text-6xl mb-4">📜</span>
                        <h1 className="title-gradient">HISTOIRE DE FRANCE</h1>
                        <p className="subtitle">Où s'est déroulé cet événement ?</p>
                        <p className="mb-8 text-lg text-gray-600">Jeanne d'Arc, Napoléon, 1944... Retrouvez les lieux de l'Histoire.</p>
                        <button onClick={startGame} className="btn-primary">Commencer l'Histoire</button>
                    </div>
                </div>
            )}

            {gameStatus === 'summary' && (
                <div className="absolute-cover modal-overlay z-high">
                    <Leaderboard finalScore={score} onRestart={startGame} gameMode="history" />
                </div>
            )}
        </div>
    );
};

export default HistoryGame;
