import React, { useState, useEffect, useCallback } from 'react';
import Leaderboard from './Leaderboard';
import characterData from '../data/characters.json';
import { shuffleArray, calculateTimeMultiplier } from '../utils/gameUtils';
import { useTimer } from '../hooks/useTimer';
import { ROUNDS_PER_GAME, TIME_LIMITS } from '../utils/constants';

const QuizGame = ({ onExit }) => {
    const [gameStatus, setGameStatus] = useState('intro');
    const [theme, setTheme] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [jokerUsed, setJokerUsed] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const handleTimeout = useCallback(() => {
        if (gameStatus === 'playing' && !feedback) {
            handleAnswer(0);
        }
    }, [gameStatus, feedback]);

    const { timeLeft, resetTimer } = useTimer(
        TIME_LIMITS.quiz,
        gameStatus === 'playing' && !feedback,
        handleTimeout
    );

    const startGame = (selectedTheme) => {
        setTheme(selectedTheme);
        const themed = characterData.filter(c => c.theme === selectedTheme);

        let pool = [...themed];
        while (pool.length < ROUNDS_PER_GAME && pool.length > 0) {
            pool = [...pool, ...themed];
        }
        if (pool.length === 0) pool = characterData;

        const shuffled = shuffleArray([...pool]).slice(0, ROUNDS_PER_GAME);
        setQuestions(shuffled);
        setCurrentIndex(0);
        setScore(0);
        setGameStatus('playing');
        resetTimer(TIME_LIMITS.quiz);
        setJokerUsed(false);
        setFeedback(null);
    };

    const handleAnswer = (points) => {
        const isCorrect = points > 0;
        setFeedback(isCorrect ? 'correct' : 'wrong');
        if (isCorrect) setScore(s => s + points);

        setTimeout(() => {
            nextQuestion();
        }, 2000);
    };

    const nextQuestion = () => {
        if (currentIndex + 1 >= ROUNDS_PER_GAME) {
            setGameStatus('summary');
        } else {
            setCurrentIndex(i => i + 1);
            resetTimer(TIME_LIMITS.quiz);
            setFeedback(null);
            setJokerUsed(false);
        }
    };

    const getBgImage = () => {
        switch (theme) {
            case 'disney': return 'url(/assets/bg_disney.png)';
            case 'pokemon': return 'url(/assets/bg_pokemon.png)';
            default: return 'url(/assets/bg_main.png)';
        }
    };

    return (
        <div className="full-screen text-white flex flex-col"
            style={{
                backgroundImage: gameStatus === 'playing' ? getBgImage() : 'url(/assets/bg_main.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'background-image 0.5s ease-in-out',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <button className="btn-primary btn-menu" onClick={onExit}>
                🏠 Menu
            </button>

            {gameStatus === 'intro' && (
                <div className="absolute-cover flex-center z-high bg-black bg-opacity-60 backdrop-blur-sm">
                    <div className="modal-content glass-effect">
                        <h1 className="title-gradient">QUIZ PERSONNAGES</h1>
                        <p className="subtitle">Choisis ton univers !</p>
                        <div className="flex gap-12 justify-center flex-wrap mt-8">
                            <button onClick={() => startGame('disney')} className="btn-primary bg-pink-500 hover:scale-110 transition-transform">
                                <span style={{ fontSize: '2rem' }}>✨</span><br />Disney
                            </button>
                            <button onClick={() => startGame('pokemon')} className="btn-primary bg-yellow-500 hover:scale-110 transition-transform">
                                <span style={{ fontSize: '2rem' }}>⚡</span><br />Pokémon
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {gameStatus === 'playing' && (
                <QuestionRound
                    key={currentIndex}
                    data={questions[currentIndex]}
                    round={currentIndex + 1}
                    totalRounds={ROUNDS_PER_GAME}
                    score={score}
                    timeLeft={timeLeft}
                    jokerUsed={jokerUsed}
                    feedback={feedback}
                    onJoker={() => setJokerUsed(true)}
                    onAnswer={handleAnswer}
                />
            )}

            {gameStatus === 'summary' && (
                <div className="absolute-cover modal-overlay z-high">
                    <Leaderboard finalScore={score} onRestart={() => setGameStatus('intro')} gameMode={theme} />
                </div>
            )}
        </div>
    );
};

const QuestionRound = ({ data, round, totalRounds, score, timeLeft, jokerUsed, feedback, onJoker, onAnswer }) => {
    const [options, setOptions] = useState([]);
    const [disabled, setDisabled] = useState([]);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        const wrong = shuffleArray([...data.options]).slice(0, 5);
        const all = shuffleArray([...wrong, data.name]);
        setOptions(all);
        setDisabled([]);
        setSelected(null);
    }, [data]);

    useEffect(() => {
        if (jokerUsed) {
            const wrongIndices = options
                .map((opt, i) => ({ opt, i }))
                .filter(item => item.opt !== data.name)
                .slice(0, 3)
                .map(item => item.i);
            setDisabled(wrongIndices);
        }
    }, [jokerUsed, options, data]);

    const handleChoice = (opt) => {
        if (feedback) return;
        setSelected(opt);
        const basePoints = opt === data.name ? (jokerUsed ? 500 : 1000) : 0;
        onAnswer(calculateTimeMultiplier(basePoints, timeLeft));
    };

    const getButtonStyle = (opt, i) => {
        if (!feedback) return disabled.includes(i) ? 'opacity-30' : '';
        if (opt === data.name) {
            return 'bg-green-500 text-white border-green-400 scale-105 shadow-[0_0_15px_rgba(34,197,94,0.6)] ring-2 ring-green-300';
        }
        if (opt === selected && opt !== data.name) {
            return 'bg-red-500 text-white border-red-400 opacity-90';
        }
        return 'opacity-50 blur-[1px]';
    };

    return (
        <div className="quiz-game-container">
            <div className="flex justify-between w-full max-w-2xl items-center bg-gray-900/60 backdrop-blur-md px-8 py-3 rounded-full border border-white/10 shadow-lg mb-4">
                <div className="flex flex-col items-start">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Score</span>
                    <span className="text-2xl font-black text-yellow-400 drop-shadow-sm">{score}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Round</span>
                    <span className="text-xl font-bold text-white">{round}<span className="text-gray-500 text-sm">/{totalRounds}</span></span>
                </div>
            </div>

            <div className="quiz-main-content">
                <div className="quiz-left-panel">
                    <div
                        className={`relative quiz-img-responsive transition-all duration-500 ease-out py-4
                            ${feedback ? 'z-50 scale-125 translate-y-12' : 'scale-100'}
                            ${feedback === 'correct' ? 'drop-shadow-[0_0_50px_rgba(34,197,94,0.8)]' :
                                feedback === 'wrong' ? 'drop-shadow-[0_0_50px_rgba(239,68,68,0.8)] shake' : ''
                            }`}
                        style={{
                            perspective: '1000px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto'
                        }}
                    >
                        <img
                            src={data.image}
                            alt={data.name}
                            className={`max-w-full max-h-full object-contain rounded-2xl transition-all duration-500 ${feedback ? 'shadow-2xl' : ''}`}
                            onError={(e) => {
                                if (!e.target.src.includes('bg_main.png')) {
                                    e.target.src = '/assets/bg_main.png';
                                    e.target.style.filter = 'grayscale(100%) blur(2px)';
                                }
                            }}
                        />

                        {feedback === 'correct' && (
                            <div className="absolute inset-0 pointer-events-none" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-green-300 to-green-600 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] animate-bounce scale-150 text-center leading-tight">
                                    BRAVO !
                                </h1>
                            </div>
                        )}
                        {feedback === 'wrong' && (
                            <div className="absolute inset-0 pointer-events-none" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-400 to-red-700 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] animate-shake scale-150 text-center leading-tight">
                                    RATE...
                                </h1>
                            </div>
                        )}
                    </div>
                </div>

                <div className="quiz-right-panel">
                    <div
                        className={`quiz-grid-responsive slide-up-animation transition-opacity duration-300 ${feedback ? 'opacity-90' : 'opacity-100'}`}
                        style={{
                            marginTop: feedback ? '3rem' : '1rem',
                            maxWidth: '800px',
                            marginLeft: 'auto',
                            marginRight: 'auto',
                            width: '100%'
                        }}
                    >
                        {options.map((opt, i) => (
                            <button
                                key={i}
                                disabled={disabled.includes(i) || feedback}
                                onClick={() => handleChoice(opt)}
                                className={`
                                    quiz-option-btn relative overflow-hidden transition-all duration-300
                                    ${feedback && opt === data.name ? 'quiz-btn-correct' : ''}
                                    ${feedback && opt === selected && opt !== data.name ? 'quiz-btn-wrong' : ''}
                                    ${feedback && opt !== data.name && opt !== selected ? 'quiz-btn-dim' : ''}
                                    ${disabled.includes(i) ? 'opacity-30 grayscale cursor-not-allowed' : ''}
                                `}
                                style={{ minHeight: '80px' }}
                            >
                                {opt}
                                {feedback && opt === data.name && <span className="absolute right-2 top-2 text-2xl">✅</span>}
                                {feedback && opt === selected && opt !== data.name && <span className="absolute right-2 top-2 text-2xl">❌</span>}
                            </button>
                        ))}

                        <button
                            onClick={onJoker}
                            disabled={jokerUsed || feedback}
                            className={`joker-btn quiz-option-btn font-black text-lg
                                    ${jokerUsed ? 'grayscale opacity-50 animation-none' : ''}
                                `}
                            style={{
                                marginTop: '1rem',
                                gridColumn: '1 / -1',
                                width: '100%',
                                minHeight: '54px'
                            }}
                        >
                            ⚡ JOKER 50/50 ⚡
                        </button>
                    </div>
                </div>
            </div>

            <div className="timer-container">
                <div
                    className="timer-bar-fill"
                    style={{ height: `${(timeLeft / TIME_LIMITS.quiz) * 100}%` }}
                />
            </div>
        </div>
    );
};

export default QuizGame;
