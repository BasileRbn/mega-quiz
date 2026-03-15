import { useState, useCallback } from 'react';
import { shuffleArray, calculateDistance, calculateScore, calculateTimeMultiplier } from '../utils/gameUtils';
import { useTimer } from './useTimer';

export function useGameRound({ data, roundCount = 20, timeLimit = 15, feedbackDuration = 3000 }) {
    const [gameStatus, setGameStatus] = useState('intro');
    const [rounds, setRounds] = useState([]);
    const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [lastResult, setLastResult] = useState(null);

    const handleTimeout = useCallback(() => {
        if (gameStatus === 'playing') {
            handleGuess(null);
        }
    }, [gameStatus]);

    const { timeLeft, resetTimer } = useTimer(timeLimit, gameStatus === 'playing', handleTimeout);

    const startGame = useCallback(() => {
        const shuffled = shuffleArray([...data]);
        setRounds(shuffled.slice(0, roundCount));
        setCurrentRoundIndex(0);
        setScore(0);
        setLastResult(null);
        setGameStatus('playing');
        resetTimer(timeLimit);
    }, [data, roundCount, timeLimit, resetTimer]);

    const handleNextRound = useCallback(() => {
        if (currentRoundIndex + 1 >= roundCount) {
            setGameStatus('summary');
        } else {
            setCurrentRoundIndex(i => i + 1);
            setLastResult(null);
            setGameStatus('playing');
            resetTimer(timeLimit);
        }
    }, [currentRoundIndex, roundCount, timeLimit, resetTimer]);

    const handleGuess = useCallback((latlng) => {
        const target = rounds[currentRoundIndex];
        if (!target) return;

        let dist = 9999;
        let points = 0;

        if (latlng) {
            dist = calculateDistance(latlng.lat, latlng.lng, target.lat, target.lng);
            points = calculateScore(dist);
            points = calculateTimeMultiplier(points, timeLeft, timeLimit);
        }

        setScore(s => s + points);
        setLastResult({ distance: dist, points });
        setGameStatus('feedback');

        setTimeout(() => {
            handleNextRound();
        }, feedbackDuration);
    }, [rounds, currentRoundIndex, timeLeft, timeLimit, feedbackDuration, handleNextRound]);

    const addScore = useCallback((points) => {
        setScore(s => s + points);
    }, []);

    return {
        gameStatus, setGameStatus,
        rounds, currentRoundIndex,
        score, addScore,
        lastResult, setLastResult,
        timeLeft, resetTimer,
        startGame, handleGuess, handleNextRound,
        currentTarget: rounds[currentRoundIndex]
    };
}
