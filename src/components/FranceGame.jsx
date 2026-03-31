import React from 'react';
import MapGame from './MapGame';
import ScoreBoard from './ScoreBoard';
import Leaderboard from './Leaderboard';
import citiesData from '../data/cities.json';
import { useGameRound } from '../hooks/useGameRound';
import { TIME_LIMITS, ROUNDS_PER_GAME } from '../utils/constants';

const FRANCE_BOUNDS = [[41.3, -5.5], [51.1, 9.6]];

const FranceGame = ({ onExit }) => {
    const {
        gameStatus, rounds, currentRoundIndex, score,
        lastResult, timeLeft, startGame, handleGuess, currentTarget
    } = useGameRound({
        data: citiesData,
        roundCount: ROUNDS_PER_GAME,
        timeLimit: TIME_LIMITS.france,
        feedbackDuration: 3000
    });

    return (
        <div className="full-screen">
            <button className="btn-primary btn-menu" onClick={onExit}>
                🏠 Menu
            </button>

            {(gameStatus === 'playing' || gameStatus === 'feedback') && (
                <>
                    <MapGame
                        target={currentTarget}
                        result={lastResult}
                        onGuess={handleGuess}
                        bounds={FRANCE_BOUNDS}
                    />
                    <ScoreBoard
                        score={score}
                        round={currentRoundIndex + 1}
                        totalRounds={ROUNDS_PER_GAME}
                        targetCity={currentTarget}
                        timer={gameStatus === 'playing' ? timeLeft : null}
                        maxTime={TIME_LIMITS.france}
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
