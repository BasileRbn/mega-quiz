import React, { useState, useEffect, useRef } from 'react';
import characterData from '../data/characters.json';
import { shuffleArray } from '../utils/gameUtils';
import Confetti from './Confetti';
import ScoreSaver from './ScoreSaver';
import GameTopScores from './GameTopScores';

const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const LEVELS = [
    { id: 'facile', label: '😊 Facile', pairs: 6, cols: 4 },
    { id: 'moyen', label: '🤔 Moyen', pairs: 8, cols: 4 },
    { id: 'expert', label: '🤯 Expert', pairs: 10, cols: 5 },
];

const MemoryGame = ({ onExit }) => {
    const [gameStatus, setGameStatus] = useState('intro'); // intro, playing, won
    const [level, setLevel] = useState(LEVELS[0]);
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]); // indices des cartes retournées (max 2)
    const [matched, setMatched] = useState(new Set());
    const [moves, setMoves] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const lockRef = useRef(false);
    // Miroir synchrone de `flipped` : évite de perdre un clic si deux
    // cartes sont cliquées très vite (batching React)
    const flippedRef = useRef([]);

    const setFlippedSync = (value) => {
        flippedRef.current = value;
        setFlipped(value);
    };

    const startGame = (theme, selectedLevel) => {
        // Une seule image par personnage (évite deux Pikachu différents)
        const seen = new Set();
        const pool = characterData.filter(c => {
            if (c.theme !== theme || seen.has(c.name)) return false;
            seen.add(c.name);
            return true;
        });

        const chosen = shuffleArray(pool).slice(0, selectedLevel.pairs);
        const deck = shuffleArray(
            chosen.flatMap((c, pairId) => [
                { key: `${pairId}-a`, pairId, image: c.image, name: c.name },
                { key: `${pairId}-b`, pairId, image: c.image, name: c.name },
            ])
        );

        setLevel(selectedLevel);
        setCards(deck);
        setFlippedSync([]);
        setMatched(new Set());
        setMoves(0);
        setSeconds(0);
        lockRef.current = false;
        setGameStatus('playing');
    };

    // Chronomètre de la partie
    useEffect(() => {
        if (gameStatus !== 'playing') return;
        const t = setInterval(() => setSeconds(s => s + 1), 1000);
        return () => clearInterval(t);
    }, [gameStatus]);

    const handleFlip = (index) => {
        if (lockRef.current) return;
        if (flippedRef.current.includes(index) || matched.has(cards[index].pairId)) return;

        const next = [...flippedRef.current, index];
        setFlippedSync(next);

        if (next.length === 2) {
            setMoves(m => m + 1);
            const [a, b] = next;
            if (cards[a].pairId === cards[b].pairId) {
                setMatched(prev => new Set(prev).add(cards[a].pairId));
                setFlippedSync([]);
            } else {
                lockRef.current = true;
                setTimeout(() => {
                    setFlippedSync([]);
                    lockRef.current = false;
                }, 900);
            }
        }
    };

    useEffect(() => {
        if (gameStatus === 'playing' && cards.length > 0 && matched.size === level.pairs) {
            const t = setTimeout(() => setGameStatus('won'), 600);
            return () => clearTimeout(t);
        }
    }, [matched, gameStatus, cards, level]);

    const starCount = () => {
        if (moves <= level.pairs * 1.6) return 3;
        if (moves <= level.pairs * 2.5) return 2;
        return 1;
    };

    return (
        <div className="full-screen flex-col" style={{ alignItems: 'center', justifyContent: 'center', overflowY: 'auto' }}>
            <button className="btn-primary btn-menu" onClick={onExit}>🏠 Menu</button>

            {gameStatus === 'intro' && (
                <div className="absolute-cover flex-center z-high modal-overlay">
                    <div className="modal-content glass-effect" style={{ maxWidth: '650px' }}>
                        <div className="kids-intro-emoji floaty">🃏</div>
                        <h1 className="title-gradient">MEMORY</h1>
                        <p className="subtitle">Retrouve toutes les paires ! Choisis ton univers :</p>
                        {LEVELS.map(lvl => (
                            <div key={lvl.id} style={{ marginBottom: '1rem' }}>
                                <p style={{ fontWeight: 700, marginBottom: '0.4rem', color: '#312e81' }}>{lvl.label} — {lvl.pairs} paires</p>
                                <div className="kids-level-btns" style={{ marginTop: 0 }}>
                                    <button className="btn-primary" style={{ background: 'linear-gradient(135deg,#f472b6,#db2777)', boxShadow: '0 5px 0 #9d174d', fontSize: '1rem', padding: '0.6rem 1.6rem' }}
                                        onClick={() => startGame('disney', lvl)}>✨ Disney</button>
                                    <button className="btn-primary" style={{ background: 'linear-gradient(135deg,#fbbf24,#d97706)', boxShadow: '0 5px 0 #92400e', fontSize: '1rem', padding: '0.6rem 1.6rem' }}
                                        onClick={() => startGame('pokemon', lvl)}>⚡ Pokémon</button>
                                </div>
                            </div>
                        ))}
                        <GameTopScores gameMode="memory" />
                    </div>
                </div>
            )}

            {gameStatus === 'playing' && (
                <>
                    <div className="memory-hud" style={{ marginTop: '4rem' }}>
                        <span className="hud-chip">🎯 Paires : {matched.size}/{level.pairs}</span>
                        <span className="hud-chip">👆 Coups : {moves}</span>
                        <span className="hud-chip">⏱️ {formatTime(seconds)}</span>
                    </div>
                    <div className="memory-board" style={{ gridTemplateColumns: `repeat(${level.cols}, 1fr)` }}>
                        {cards.map((card, i) => {
                            const isFlipped = flipped.includes(i) || matched.has(card.pairId);
                            return (
                                <button
                                    key={card.key}
                                    className={`memory-card ${isFlipped ? 'flipped' : ''} ${matched.has(card.pairId) ? 'matched' : ''}`}
                                    onClick={() => handleFlip(i)}
                                    aria-label="Carte du memory"
                                >
                                    <div className="memory-card-inner">
                                        <div className="memory-face memory-back">❓</div>
                                        <div className="memory-face memory-front">
                                            <img src={card.image} alt={card.name} draggable="false" />
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </>
            )}

            {gameStatus === 'won' && (
                <div className="absolute-cover flex-center z-high modal-overlay">
                    <Confetti />
                    <div className="modal-content glass-effect pop-in">
                        <div className="kids-intro-emoji">🏆</div>
                        <h1 className="title-gradient">BRAVO !</h1>
                        <div className="stars-row">
                            {[1, 2, 3].map(s => (
                                <span key={s} className={s <= starCount() ? '' : 'star-off'}>⭐</span>
                            ))}
                        </div>
                        <p className="subtitle">Tu as trouvé les {level.pairs} paires en {moves} coups et {formatTime(seconds)} !</p>
                        {/* Score : partie parfaite = 100 pts par paire, chaque coup en trop enlève 20 pts */}
                        <ScoreSaver gameMode="memory" score={Math.max(0, level.pairs * 100 - (moves - level.pairs) * 20)} />
                        <div className="kids-level-btns">
                            <button className="btn-primary btn-restart" onClick={() => setGameStatus('intro')}>🔄 Rejouer</button>
                            <button className="btn-primary" onClick={onExit}>🏠 Menu</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MemoryGame;
