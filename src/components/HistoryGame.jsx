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
                    {/* HUD Histoire : la question (en bas sur desktop, en haut sur mobile via CSS) */}
                    <div className="history-question-wrap">
                        <div className="glass-effect history-question-card">
                            <div className="history-question-inner">
                                <h2 className="title-gradient history-question-title">
                                    {currentQuestion?.event}
                                </h2>
                                <div className="history-question-side">
                                    <span className="history-question-date">{currentQuestion?.date}</span>
                                    <p className="history-question-desc">{currentQuestion?.description}</p>
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

                    {/* Révélation de la ville pendant le feedback */}
                    {gameStatus === 'feedback' && (
                        <div className="history-city-reveal">
                            <div className="glass-effect history-city-card">
                                <h2>{currentQuestion.city}</h2>
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
