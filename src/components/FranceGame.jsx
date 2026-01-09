import React, { useState, useEffect } from 'react';
import MapGame from './MapGame';
import ScoreBoard from './ScoreBoard';
import Leaderboard from './Leaderboard';
import citiesData from '../data/cities.json';
import { calculateDistance, calculateScore, calculateTimeMultiplier } from '../utils/gameUtils';

const FRANCE_BOUNDS = [[41.3, -5.5], [51.1, 9.6]];

const FranceGame = ({ onExit }) => {
    const [gameStatus, setGameStatus] = useState('intro');
    const [rounds, setRounds] = useState([]);
    const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [lastResult, setLastResult] = useState(null);
    const [timeLeft, setTimeLeft] = useState(15);

    const ROUNDS_PER_GAME = 20;
    const TIME_LIMIT = 15;

    useEffect(() => {
        let timer;
        if (gameStatus === 'playing' && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && gameStatus === 'playing') {
            handleGuess(null);
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
        const shuffled = shuffleArray([...citiesData]);
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
            points = calculateTimeMultiplier(points, timeLeft);
        }

        setScore(s => s + points);
        setLastResult({
            distance: dist,
            points: points
        });
        setGameStatus('feedback');

        // Auto-advance after 3 seconds
        setTimeout(() => {
            handleNextRound();
        }, 3000);
    };

    const handleNextRound = () => {
        if (currentRoundIndex + 1 >= ROUNDS_PER_GAME) {
            setGameStatus('summary');
        } else {
            setCurrentRoundIndex(i => i + 1);
            setLastResult(null);
            setGameStatus('playing');
            setTimeLeft(TIME_LIMIT);
        }
    };

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
                    <MapGame
                        target={rounds[currentRoundIndex]}
                        result={lastResult}
                        onGuess={handleGuess}
                        bounds={FRANCE_BOUNDS} // France Bounds
                    />
                    <ScoreBoard
                        score={score}
                        round={currentRoundIndex + 1}
                        totalRounds={ROUNDS_PER_GAME}
                        targetCity={rounds[currentRoundIndex]}
                        timer={gameStatus === 'playing' ? timeLeft : null}
                        lastResult={lastResult}
                    />
                </>
            )}

            {gameStatus === 'intro' && (
                <div className="absolute-cover modal-overlay z-high">
                    <div className="modal-content glass-effect">
                        <h1 className="title-gradient">VILLES DE FRANCE</h1>
                        <p className="subtitle">20 Manches - Trouvez les villes !</p>
                        <button onClick={startGame} className="btn-primary">C'est Parti ! 🚀</button>
                    </div>
                </div>
            )}

            {gameStatus === 'summary' && (
                <div className="absolute-cover modal-overlay z-high">
                    <Leaderboard finalScore={score} onRestart={startGame} gameMode="france" />
                </div>
            )}
        </div>
    );
};

export default FranceGame;
