import React, { useState, useEffect } from 'react';
import MapGame from './MapGame';
import ScoreBoard from './ScoreBoard';
import Leaderboard from './Leaderboard';
import capitalsData from '../data/capitals.json';
import { calculateDistance, calculateScore, calculateTimeMultiplier } from '../utils/gameUtils';

const shuffleArray = (array) => {
    let currentIndex = array.length, randomIndex;
    // While there remain elements to shuffle.
    while (currentIndex !== 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
};

const FlagBonus = ({ country, onSelectFlag }) => {
    const [options, setOptions] = useState([]);
    const [step, setStep] = useState('choose'); // choose, feedback, outcome
    const [userChoiceIso, setUserChoiceIso] = useState(null);
    const [outcome, setOutcome] = useState(null);
    const [disabledOptions, setDisabledOptions] = useState([]);
    const [jokerUsed, setJokerUsed] = useState(false);

    useEffect(() => {
        const distractions = capitalsData
            .filter(c => c.iso !== country.iso)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);

        // Use Fisher-Yates for better shuffle
        const all = shuffleArray([...distractions, country]);
        setOptions(all);
        setDisabledOptions([]);
        setJokerUsed(false);
    }, [country]);

    const handleJoker = () => {
        if (jokerUsed) return;
        setJokerUsed(true);
        const wrongOptions = options.filter(o => o.iso !== country.iso);
        const toDisable = wrongOptions.slice(0, 2).map(o => o.iso);
        setDisabledOptions(toDisable);
    };

    const handleSelect = (iso) => {
        if (step !== 'choose' || disabledOptions.includes(iso)) return;

        setUserChoiceIso(iso);
        const isWin = iso === country.iso;
        setOutcome(isWin ? 'correct' : 'wrong');
        setStep('feedback'); // Immediate border feedback on grid

        // Wait 1s then show full outcome
        setTimeout(() => {
            setStep('outcome');
            // Then wait 2.5s to close
            setTimeout(() => {
                onSelectFlag(isWin);
            }, 2500);
        }, 1000);
    };

    if (step === 'outcome') {
        return (
            <div className="absolute-cover z-max flex-center bg-black bg-opacity-90 backdrop-blur-xl">
                <div className="text-center animate-zoomIn">
                    {outcome === 'correct' ? (
                        <>
                            <h1 className="text-6xl font-black text-green-500 mb-8 animate-bounce">BRAVO ! 🎉</h1>
                            <img
                                src={`https://flagcdn.com/w640/${country.iso}.png`}
                                className="rounded-2xl shadow-2xl border-8 border-green-500 mx-auto"
                                style={{ width: '400px', height: 'auto' }}
                            />
                            <p className="text-white text-2xl mt-6 font-bold">C'était bien le drapeau de {country.country}</p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-6xl font-black text-red-500 mb-8 animate-shake">DOMMAGE... 😢</h1>
                            <div className="flex gap-12 justify-center items-center">
                                <div className="flex flex-col items-center">
                                    <span className="text-green-400 font-bold mb-2 text-xl">La bonne réponse :</span>
                                    <img
                                        src={`https://flagcdn.com/w640/${country.iso}.png`}
                                        className="rounded-xl shadow-2xl border-4 border-green-500"
                                        style={{ width: '300px' }}
                                    />
                                </div>
                                {userChoiceIso && (
                                    <div className="flex flex-col items-center opacity-70">
                                        <span className="text-red-400 font-bold mb-2 text-xl">Votre choix :</span>
                                        <img
                                            src={`https://flagcdn.com/w640/${userChoiceIso}.png`}
                                            className="rounded-xl shadow-2xl border-4 border-red-500 grayscale"
                                            style={{ width: '200px' }}
                                        />
                                    </div>
                                )}
                            </div>
                            <p className="text-white text-xl mt-8">Cap sur la prochaine ville avec +0 pts bonus...</p>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="absolute-cover z-max flex-center bg-black bg-opacity-80 backdrop-blur-md">
            <div className="modal-content glass-effect" style={{ maxWidth: '900px', background: 'rgba(255,255,255,0.95)' }}>
                <h2 className="title-gradient" style={{ fontSize: '2.5rem' }}>Bonus : Le Drapeau !</h2>
                <p className="subtitle mb-8 text-xl">Quel est le drapeau de : <strong className="text-blue-600">{country.country}</strong> ?</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', maxWidth: '600px', margin: '0 auto' }}>
                    {options.map((opt, i) => {
                        const isSelected = userChoiceIso === opt.iso;
                        const isCorrect = opt.iso === country.iso;
                        const isDisabled = disabledOptions.includes(opt.iso);

                        let cardStyle = {
                            width: '100%',
                            height: '140px', // Fixed height for consistency
                            objectFit: 'contain', // Ensure full flag is visible
                            borderRadius: '12px',
                            cursor: (step === 'choose' && !isDisabled) ? 'pointer' : 'default',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                            border: '4px solid transparent',
                            transition: 'all 0.3s',
                            backgroundColor: '#f8fafc', // Light bg for better flag contrast
                            opacity: isDisabled ? 0.2 : 1,
                            filter: isDisabled ? 'grayscale(100%)' : 'none'
                        };

                        if (step === 'feedback') {
                            if (isCorrect) {
                                cardStyle.border = '4px solid #22c55e'; // Green
                                cardStyle.transform = 'scale(1.05)';
                                cardStyle.boxShadow = '0 0 20px #22c55e';
                            } else if (isSelected) {
                                cardStyle.border = '4px solid #ef4444'; // Red
                                cardStyle.opacity = 0.8;
                            } else {
                                cardStyle.opacity = 0.5;
                            }
                        }

                        return (
                            <div key={i} className="flag-card-container" style={{ position: 'relative' }}>
                                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                    <img
                                        src={`https://flagcdn.com/w320/${opt.iso}.png`}
                                        className={step === 'choose' && !isDisabled ? "flag-option hover:scale-105" : ""}
                                        style={cardStyle}
                                        onClick={() => handleSelect(opt.iso)}
                                    />
                                    {/* IMMEDIATE FEEDBACK ICON OVERLAY */}
                                    {step === 'feedback' && isCorrect && (
                                        <div className="absolute-cover flex-center" style={{ background: 'rgba(34, 197, 94, 0.4)', borderRadius: '12px', pointerEvents: 'none' }}>
                                            <span style={{ fontSize: '3rem', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>✅</span>
                                        </div>
                                    )}
                                    {step === 'feedback' && isSelected && !isCorrect && (
                                        <div className="absolute-cover flex-center" style={{ background: 'rgba(239, 68, 68, 0.4)', borderRadius: '12px', pointerEvents: 'none' }}>
                                            <span style={{ fontSize: '3rem', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>❌</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Joker Button */}
                    <button
                        onClick={handleJoker}
                        disabled={jokerUsed || step !== 'choose'}
                        className={`joker-btn quiz-option-btn font-black text-lg ${jokerUsed ? 'grayscale opacity-50 animation-none' : ''}`}
                        style={{
                            gridColumn: '1 / -1',
                            width: '100%',
                            minHeight: '50px',
                            marginTop: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        ⚡ Joker 50/50 ⚡
                    </button>
                </div>
            </div>
        </div>
    );
};

const WORLD_BOUNDS = [[-60, -170], [80, 190]];

const WorldGame = ({ onExit }) => {
    const [gameStatus, setGameStatus] = useState('intro');
    const [rounds, setRounds] = useState([]);
    const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [lastResult, setLastResult] = useState(null);
    const [timeLeft, setTimeLeft] = useState(15);
    const [showFlagBonus, setShowFlagBonus] = useState(false);

    const ROUNDS_PER_GAME = 20;

    useEffect(() => {
        let timer;
        if (gameStatus === 'playing' && timeLeft > 0 && !showFlagBonus) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && gameStatus === 'playing' && !showFlagBonus) {
            handleGuess(null);
        }
        return () => clearInterval(timer);
    }, [gameStatus, timeLeft, showFlagBonus]);

    const startGame = () => {
        const shuffled = shuffleArray([...capitalsData]);
        setRounds(shuffled.slice(0, ROUNDS_PER_GAME));
        setCurrentRoundIndex(0);
        setScore(0);
        setLastResult(null);
        setGameStatus('playing');
        setTimeLeft(15);
        setShowFlagBonus(false);
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

        // Auto-advance to Flag Bonus after 3 seconds
        setTimeout(() => {
            setShowFlagBonus(true);
        }, 3000);
    };

    const handleFlagChoice = (isCorrect) => {
        if (isCorrect) {
            setScore(s => s + 500);
        }
        setShowFlagBonus(false);
        handleNextRound();
    };

    const handleNextRound = () => {
        if (currentRoundIndex + 1 >= ROUNDS_PER_GAME) {
            setGameStatus('summary');
        } else {
            setCurrentRoundIndex(i => i + 1);
            setLastResult(null);
            setGameStatus('playing');
            setTimeLeft(15);
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
                        bounds={WORLD_BOUNDS} // World Bounds
                    />
                    <ScoreBoard
                        score={score}
                        round={currentRoundIndex + 1}
                        totalRounds={ROUNDS_PER_GAME}
                        targetCity={rounds[currentRoundIndex]}
                        timer={(!showFlagBonus && gameStatus === 'playing') ? timeLeft : null}
                        lastResult={lastResult}
                    />
                    {showFlagBonus && (
                        <FlagBonus
                            country={rounds[currentRoundIndex]}
                            onSelectFlag={handleFlagChoice}
                        />
                    )}
                </>
            )}

            {gameStatus === 'intro' && (
                <div className="absolute-cover modal-overlay z-high">
                    <div className="modal-content glass-effect">
                        <h1 className="title-gradient">CAPITALES DU MONDE</h1>
                        <p className="subtitle">Localisez la capitale + Bonus Drapeau !</p>
                        <button onClick={startGame} className="btn-primary">C'est Parti ! 🚀</button>
                    </div>
                </div>
            )}

            {gameStatus === 'summary' && (
                <div className="absolute-cover modal-overlay z-high">
                    <Leaderboard finalScore={score} onRestart={startGame} gameMode="world" />
                </div>
            )}
        </div>
    );
};

export default WorldGame;
