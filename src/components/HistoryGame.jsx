import React, { useState, useEffect } from 'react';
import MapGame from './MapGame';
import ScoreBoard from './ScoreBoard';
import Leaderboard from './Leaderboard';
import historyData from '../data/history_cities.json';
import { calculateDistance, calculateScore, calculateTimeMultiplier } from '../utils/gameUtils';

const FRANCE_BOUNDS = [[41.3, -5.5], [51.1, 9.6]];

const HistoryGame = ({ onExit }) => {
    const [gameStatus, setGameStatus] = useState('intro'); // intro, playing, feedback, summary
    const [rounds, setRounds] = useState([]);
    const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [lastResult, setLastResult] = useState(null);
    const [timeLeft, setTimeLeft] = useState(20); // More time for reading

    const ROUNDS_PER_GAME = 20; // 20 questions for history
    const TIME_LIMIT = 20;

    useEffect(() => {
        let timer;
        if (gameStatus === 'playing' && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && gameStatus === 'playing') {
            handleGuess(null); // Timeout
        }
        return () => clearInterval(timer);
    }, [gameStatus, timeLeft]);

    const shuffleArray = (array) => {
        let currentIndex = array.length, randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }
        return array;
    };

    const startGame = () => {
        const shuffled = shuffleArray([...historyData]);
        setRounds(shuffled.slice(0, ROUNDS_PER_GAME));
        setCurrentRoundIndex(0);
        setScore(0);
        setLastResult(null);
        setGameStatus('playing');
        setTimeLeft(TIME_LIMIT);
    };

    const handleGuess = (latlng) => {
        const target = rounds[currentRoundIndex];
        if (!target) return;

        let dist = 9999;
        let points = 0;

        if (latlng) {
            dist = calculateDistance(latlng.lat, latlng.lng, target.lat, target.lng);
            points = calculateScore(dist);
            points = calculateTimeMultiplier(points, timeLeft, TIME_LIMIT);
        }

        setScore(s => s + points);
        setLastResult({
            distance: dist,
            points: points
        });
        setGameStatus('feedback');

        // Auto-advance after 4 seconds
        setTimeout(() => {
            handleNextRound();
        }, 4000);
    };

    const handleNextRound = () => {
        if (currentRoundIndex + 1 >= ROUNDS_PER_GAME || currentRoundIndex + 1 >= rounds.length) {
            setGameStatus('summary');
        } else {
            setCurrentRoundIndex(i => i + 1);
            setLastResult(null);
            setGameStatus('playing');
            setTimeLeft(TIME_LIMIT);
        }
    };

    const currentQuestion = rounds[currentRoundIndex];

    return (
        <div className="full-screen">
            <button
                className="btn-primary btn-menu"
                onClick={onExit}
            >
                🏠 Menu
            </button>

            {(gameStatus === 'playing' || gameStatus === 'feedback') && (
                <>
                    {/* CUSTOM HUD FOR HISTORY: Top Bar for Question */}
                    {/* CUSTOM HUD FOR HISTORY: Bottom Bar for Question */}
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
                                        {currentQuestion?.event}
                                    </h2>
                                </div>
                                <div style={{ flex: 1, textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                                    <span className="text-secondary" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem', display: 'block' }}>
                                        {currentQuestion?.date}
                                    </span>
                                    <p style={{ fontSize: '1rem', color: '#334155', margin: 0 }}>
                                        {currentQuestion?.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <MapGame
                        target={currentQuestion}
                        result={lastResult}
                        onGuess={handleGuess}
                        bounds={FRANCE_BOUNDS}
                    />

                    <ScoreBoard
                        score={score}
                        round={currentRoundIndex + 1}
                        totalRounds={Math.min(rounds.length, ROUNDS_PER_GAME)}
                        targetCity={{ name: "???" }} // Hide city name, finding it is the goal
                        timer={gameStatus === 'playing' ? timeLeft : null}
                        maxTime={TIME_LIMIT}
                        lastResult={lastResult}
                    // We override the default target display in ScoreBoard or just ignore it because we have the top HUD
                    />

                    {/* Feedback Overlay specific for History (Show City Name ONLY) */}
                    {gameStatus === 'feedback' && (
                        <div style={{ position: 'absolute', top: '120px', right: '20px', zIndex: 9999, pointerEvents: 'none' }}>
                            <div className="glass-effect p-6 rounded-3xl border-4 border-white shadow-2xl text-center flex-center flex-col" style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', minWidth: '300px', maxWidth: '400px' }}>
                                <h2 className="text-5xl font-black mb-0" style={{ color: '#0f172a', textShadow: '0 2px 10px rgba(255,255,255,0.5)' }}>
                                    {currentQuestion.city}
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
