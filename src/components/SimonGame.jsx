import React, { useState, useRef, useEffect, useCallback } from 'react';
import Confetti from './Confetti';
import ScoreSaver from './ScoreSaver';
import GameTopScores from './GameTopScores';

const PADS = [
    { id: 0, cls: 'simon-red', emoji: '🍓', freq: 261.6 },
    { id: 1, cls: 'simon-green', emoji: '🐸', freq: 329.6 },
    { id: 2, cls: 'simon-blue', emoji: '🐳', freq: 392.0 },
    { id: 3, cls: 'simon-yellow', emoji: '🌟', freq: 523.3 },
];

const BEST_KEY = 'simon_best_score';

const randomPad = () => Math.floor(Math.random() * 4);

const SimonGame = ({ onExit }) => {
    const [gameStatus, setGameStatus] = useState('intro'); // intro, watching, playing, gameover
    const [sequence, setSequence] = useState([]);
    const [playerIndex, setPlayerIndex] = useState(0);
    const [litPad, setLitPad] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [turnTime, setTurnTime] = useState(10);
    const [best, setBest] = useState(() => Number(localStorage.getItem(BEST_KEY)) || 0);
    const audioCtxRef = useRef(null);
    const timeoutsRef = useRef([]);

    // Nettoyage des timers à la sortie
    useEffect(() => () => timeoutsRef.current.forEach(clearTimeout), []);

    const later = (fn, delay) => {
        const t = setTimeout(fn, delay);
        timeoutsRef.current.push(t);
    };

    const playTone = useCallback((freq, duration = 0.28) => {
        try {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = audioCtxRef.current;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.25, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            osc.connect(gain).connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch {
            // pas de son disponible, le jeu reste jouable
        }
    }, []);

    const flashPad = useCallback((padId, duration = 350) => {
        setLitPad(padId);
        playTone(PADS[padId].freq, duration / 1000);
        later(() => setLitPad(null), duration);
    }, [playTone]);

    const playSequence = useCallback((seq) => {
        setGameStatus('watching');
        setPlayerIndex(0);
        seq.forEach((padId, i) => {
            later(() => flashPad(padId), 700 * i + 600);
        });
        later(() => {
            // Temps pour rejouer : 4 s + 1,5 s par couleur (max 20 s)
            const t = Math.min(20, Math.round(4 + seq.length * 1.5));
            setTurnTime(t);
            setTimeLeft(t);
            setGameStatus('playing');
        }, 700 * seq.length + 500);
    }, [flashPad]);

    // Compte à rebours pendant le tour du joueur ; à zéro, la partie est perdue
    useEffect(() => {
        if (gameStatus !== 'playing') return;
        const t = setTimeout(() => {
            if (timeLeft <= 1) {
                playTone(110, 0.6);
                setGameStatus('gameover');
            } else {
                setTimeLeft(v => v - 1);
            }
        }, 1000);
        return () => clearTimeout(t);
    }, [gameStatus, timeLeft, playTone]);

    const startGame = () => {
        timeoutsRef.current.forEach(clearTimeout);
        timeoutsRef.current = [];
        const first = [randomPad()];
        setSequence(first);
        playSequence(first);
    };

    const nextRound = (seq) => {
        const next = [...seq, randomPad()];
        setSequence(next);
        playSequence(next);
    };

    const handlePad = (padId) => {
        if (gameStatus !== 'playing') return;
        flashPad(padId, 250);

        if (padId === sequence[playerIndex]) {
            if (playerIndex + 1 === sequence.length) {
                // Manche réussie !
                const score = sequence.length;
                if (score > best) {
                    setBest(score);
                    localStorage.setItem(BEST_KEY, String(score));
                }
                later(() => nextRound(sequence), 900);
                setGameStatus('watching');
            } else {
                setPlayerIndex(i => i + 1);
            }
        } else {
            playTone(110, 0.6);
            setGameStatus('gameover');
        }
    };

    const score = Math.max(0, sequence.length - 1);
    const statusText = () => {
        if (gameStatus === 'watching') return '👀 Regarde bien…';
        if (gameStatus === 'playing') return '👆 À toi de jouer !';
        return '';
    };

    return (
        <div className="full-screen flex-col" style={{ alignItems: 'center', justifyContent: 'center', overflowY: 'auto' }}>
            <button className="btn-primary btn-menu" onClick={onExit}>🏠 Menu</button>

            {gameStatus === 'intro' && (
                <div className="absolute-cover flex-center z-high modal-overlay">
                    <div className="modal-content glass-effect" style={{ maxWidth: '600px' }}>
                        <div className="kids-intro-emoji floaty">🌈</div>
                        <h1 className="title-gradient">SIMON DES COULEURS</h1>
                        <p className="subtitle">
                            Regarde les couleurs s'allumer, puis répète la même suite.<br />
                            À chaque manche, la suite devient plus longue !
                        </p>
                        {best > 0 && <p style={{ fontWeight: 700, color: '#d97706', marginBottom: '1rem' }}>🏅 Ton record : {best}</p>}
                        <button className="btn-primary btn-restart" onClick={startGame}>🚀 C'est parti !</button>
                        <GameTopScores gameMode="simon" />
                    </div>
                </div>
            )}

            {(gameStatus === 'watching' || gameStatus === 'playing') && (
                <>
                    <div className="simon-status pop-in" key={gameStatus} style={{ marginTop: '3.5rem' }}>
                        {statusText()}
                    </div>
                    <div className="simon-status" style={{ fontSize: '1.1rem', padding: '0.3rem 1.5rem' }}>
                        Manche {sequence.length} {best > 0 && `• 🏅 Record : ${best}`}
                    </div>
                    <div className={`hbar-timer simon-timer ${gameStatus === 'playing' && timeLeft <= 3 ? 'warning' : ''}`}
                        style={{ visibility: gameStatus === 'playing' ? 'visible' : 'hidden' }}>
                        <div className="hbar-timer-fill" style={{ width: `${(timeLeft / turnTime) * 100}%` }} />
                    </div>
                    <div className="simon-board">
                        {PADS.map(pad => (
                            <button
                                key={pad.id}
                                className={`simon-pad ${pad.cls} ${litPad === pad.id ? 'lit' : ''}`}
                                disabled={gameStatus !== 'playing'}
                                onClick={() => handlePad(pad.id)}
                                aria-label={`Couleur ${pad.emoji}`}
                            >
                                {pad.emoji}
                            </button>
                        ))}
                    </div>
                </>
            )}

            {gameStatus === 'gameover' && (
                <div className="absolute-cover flex-center z-high modal-overlay">
                    {score >= best && score > 2 && <Confetti />}
                    <div className="modal-content glass-effect pop-in">
                        <div className="kids-intro-emoji">{score >= 5 ? '🏆' : '💪'}</div>
                        <h1 className="title-gradient">{score >= best && score > 0 ? 'NOUVEAU RECORD !' : 'BIEN ESSAYÉ !'}</h1>
                        <p className="subtitle" style={{ fontSize: '1.3rem' }}>
                            Tu as réussi <strong>{score}</strong> manche{score > 1 ? 's' : ''} !
                            {best > 0 && <><br />🏅 Record : {best}</>}
                        </p>
                        <ScoreSaver gameMode="simon" score={score} />
                        <div className="kids-level-btns">
                            <button className="btn-primary btn-restart" onClick={startGame}>🔄 Rejouer</button>
                            <button className="btn-primary" onClick={onExit}>🏠 Menu</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SimonGame;
