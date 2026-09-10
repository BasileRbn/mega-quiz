import React, { useState, useEffect } from 'react';
import Leaderboard from './Leaderboard';
import characterData from '../data/characters.json';
import { calculateTimeMultiplier } from '../utils/gameUtils';

const QuizGame = ({ onExit }) => {
    const [gameStatus, setGameStatus] = useState('intro'); // intro, playing, summary
    const [theme, setTheme] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const [jokerUsed, setJokerUsed] = useState(false);
    const [feedback, setFeedback] = useState(null); // 'correct' or 'wrong'

    const ROUNDS = 20;

    // Précharge les images des 3 prochaines questions pour éviter tout lag
    useEffect(() => {
        if (gameStatus !== 'playing') return;
        questions.slice(currentIndex + 1, currentIndex + 4).forEach(q => {
            const img = new Image();
            img.src = q.image;
        });
    }, [gameStatus, currentIndex, questions]);

    useEffect(() => {
        let timer;
        if (gameStatus === 'playing' && timeLeft > 0 && !feedback) {
            timer = setInterval(() => {
                setTimeLeft(t => t - 1);
            }, 1000);
        } else if (timeLeft === 0 && gameStatus === 'playing' && !feedback) {
            handleTimeout();
        }
        return () => clearInterval(timer);
    }, [gameStatus, timeLeft, feedback]);

    const handleTimeout = () => {
        handleAnswer(0);
    };

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

    const startGame = (selectedTheme) => {
        setTheme(selectedTheme);
        const themed = characterData.filter(c => c.theme === selectedTheme);

        // Fill pool
        let pool = [...themed];
        while (pool.length < ROUNDS && pool.length > 0) {
            pool = [...pool, ...themed];
        }
        if (pool.length === 0) pool = characterData;

        // Uses Fisher-Yates shuffle
        const shuffled = shuffleArray([...pool]).slice(0, ROUNDS);

        setQuestions(shuffled);
        setCurrentIndex(0);
        setScore(0);
        setGameStatus('playing');
        setTimeLeft(15);
        setJokerUsed(false);
        setFeedback(null);
    };

    const handleAnswer = (points) => {
        // 1. Show Feedback immediately
        const isCorrect = points > 0;
        setFeedback(isCorrect ? 'correct' : 'wrong');

        // 2. Update Score immediately (visual feedback)
        if (isCorrect) setScore(s => s + points);

        // 3. Wait for animation, then move to next
        setTimeout(() => {
            nextQuestion();
        }, 2000);
    };

    const nextQuestion = () => {
        if (currentIndex + 1 >= ROUNDS) {
            setGameStatus('summary');
        } else {
            setCurrentIndex(i => i + 1);
            setTimeLeft(15);
            setFeedback(null);
            setJokerUsed(false);
        }
    };

    const getBgClass = () => {
        if (gameStatus !== 'playing') return 'quiz-bg-default';
        switch (theme) {
            case 'disney': return 'quiz-bg-disney';
            case 'pokemon': return 'quiz-bg-pokemon';
            default: return 'quiz-bg-default';
        }
    };

    return (
        <div className={`full-screen text-white flex flex-col ${getBgClass()}`}
            style={{
                transition: 'background 0.5s ease-in-out',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <button
                className="btn-primary btn-menu"
                onClick={onExit}
            >
                🏠 Menu
            </button>

            {gameStatus === 'intro' && (
                <div className="absolute-cover flex-center z-high bg-black bg-opacity-60 backdrop-blur-sm">
                    <div className="modal-content glass-effect" style={{ maxWidth: '600px' }}>
                        <div className="kids-intro-emoji floaty">⚡</div>
                        <h1 className="title-gradient">QUIZ PERSONNAGES</h1>
                        <p className="subtitle">Choisis ton univers !</p>
                        <div className="theme-choice-grid">
                            <button onClick={() => startGame('disney')} className="theme-card theme-disney">
                                <img src="/images/quiz/disney/mickey_mouse.webp" alt="Disney" />
                                Disney
                            </button>
                            <button onClick={() => startGame('pokemon')} className="theme-card theme-pokemon">
                                <img src="/images/quiz/pokemon/Pikachu.webp" alt="Pokémon" />
                                Pokémon
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
                    totalRounds={ROUNDS}
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
    const [selected, setSelected] = useState(null); // Track selected option

    useEffect(() => {
        // Reuse parent's shuffle if possible, or duplicate logic. 
        // For simplicity re-implement shuffle here or pass it down.
        // Implementing simple Fisher-Yates here for options
        const shuffle = (array) => {
            let currentIndex = array.length, randomIndex;
            while (currentIndex !== 0) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;
                [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
            }
            return array;
        };

        const wrong = shuffle([...data.options]).slice(0, 5);
        const all = shuffle([...wrong, data.name]);
        setOptions(all);
        setDisabled([]);
        setSelected(null); // Reset selection
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

            {/* Top Bar - Header */}
            <div className="hud-pill-top-right" style={{ position: 'static', margin: '0 auto 0.75rem' }}>
                <span className="hud-label">Score</span>
                <span className="hud-value" style={{ color: '#d97706' }}>{score}</span>
                <span className="hud-separator">•</span>
                <span className="hud-label">Question</span>
                <span className="hud-value">{round}/{totalRounds}</span>
            </div>

            <div className="quiz-main-content">
                {/* Left Panel: Image */}
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
                        />

                        {/* Massive Text Overlay */}
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
                                    RATÉ !
                                </h1>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Options & Joker */}
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
                                key={`${data.name}-${i}`}
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

                        {/* Joker */}
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

            {/* Vertical Timer - Right Side */}
            <div className="timer-container">
                <div
                    className="timer-bar-fill"
                    style={{ height: `${(timeLeft / 15) * 100}%` }}
                />
            </div>
        </div>
    );

};

export default QuizGame;
