import React, { useState, useEffect } from 'react';
import { shuffleArray } from '../utils/gameUtils';
import Confetti from './Confetti';
import ScoreSaver from './ScoreSaver';
import GameTopScores from './GameTopScores';

const TOTAL_QUESTIONS = 10;

const LEVELS = [
    { id: 1, label: '🐣 Petit malin', desc: 'Additions jusqu’à 10', max: 10, ops: ['+'], time: 20, group: 'kids' },
    { id: 2, label: '🦊 Champion', desc: '+ et − jusqu’à 20', max: 20, ops: ['+', '-'], time: 20, group: 'kids' },
    { id: 3, label: '🦁 Super génie', desc: '+, − et × (tables de 2 à 5)', max: 30, ops: ['+', '-', '×'], multMax: 5, time: 20, group: 'kids' },
    { id: 4, label: '🧙 Maître des maths', desc: '× (tables de 2 à 10), − jusqu’à 100', max: 100, ops: ['-', '×'], multMax: 10, time: 20, group: 'kids' },
    { id: 5, label: '🎓 Adulte', desc: '+, −, × et ÷ jusqu’à 100', max: 100, ops: ['+', '-', '×', '÷'], multMax: 12, divMax: 12, time: 15, group: 'adult' },
    { id: 6, label: '🚀 Cerveau ultime', desc: '87+56, 17×13, 144÷12…', max: 200, ops: ['+', '-', '×', '÷'], multMax: 19, divMax: 15, time: 12, group: 'adult' },
    { id: 7, label: '🏅 Expert Pro 1', desc: 'Parenthèses : (8 + 5) × 3…', kind: 'paren', time: 15, group: 'pro' },
    { id: 8, label: '🥷 Expert Pro 2', desc: 'Trouve x : x + 27 = 63, 4 × x = 36…', kind: 'solvex', time: 15, group: 'pro' },
    { id: 9, label: '🧠 Expert Pro 3', desc: 'Équations : 3x + 7 = 25…', kind: 'equation', time: 20, group: 'pro' },
    { id: 10, label: '❌ Niveau X', desc: '23×17, x²=169, 15% de 240, 7x+9=4x+33… le défi ultime', kind: 'ultra', time: 25, group: 'x' },
];

const randInt = (max) => Math.floor(Math.random() * (max + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Deux mauvaises réponses proches, uniques et positives
function withChoices(question, trap = null) {
    const wrong = new Set();
    if (trap !== null && trap >= 0 && trap !== question.answer) wrong.add(trap);
    let guard = 0;
    while (wrong.size < 2 && guard++ < 50) {
        const w = question.answer + (1 + randInt(2)) * (Math.random() < 0.5 ? -1 : 1);
        if (w >= 0 && w !== question.answer) wrong.add(w);
    }
    return { ...question, choices: shuffleArray([question.answer, ...wrong]) };
}

// Calcul avec parenthèses — le piège classique : oublier la priorité des parenthèses
function makeParenQuestion() {
    const pattern = pick(['sum-times', 'diff-times', 'times-sum', 'sum-div']);
    let display, answer, trap;
    if (pattern === 'sum-times') {
        const a = 2 + randInt(7), b = 2 + randInt(7), c = 2 + randInt(4);
        display = `(${a} + ${b}) × ${c}`;
        answer = (a + b) * c;
        trap = a + b * c;
    } else if (pattern === 'diff-times') {
        const b = 2 + randInt(7), a = b + 2 + randInt(8), c = 2 + randInt(4);
        display = `(${a} − ${b}) × ${c}`;
        answer = (a - b) * c;
        trap = a - b * c;
    } else if (pattern === 'times-sum') {
        const a = 2 + randInt(4), b = 2 + randInt(7), c = 2 + randInt(7);
        display = `${a} × (${b} + ${c})`;
        answer = a * (b + c);
        trap = a * b + c;
    } else {
        const c = 2 + randInt(4), q = 2 + randInt(10);
        const total = c * q;
        const a = 1 + randInt(total - 2), b = total - a;
        display = `(${a} + ${b}) ÷ ${c}`;
        answer = q;
        trap = q + c;
    }
    return withChoices({ kind: 'paren', display: `${display} = ?`, answer }, trap);
}

// Trouve x — équations simples à une étape
function makeSolveXQuestion() {
    const pattern = pick(['plus', 'minus', 'times', 'div']);
    let display, answer;
    if (pattern === 'plus') {
        answer = 5 + randInt(35);
        const a = 3 + randInt(27);
        display = `x + ${a} = ${answer + a}`;
    } else if (pattern === 'minus') {
        answer = 10 + randInt(40);
        const a = 2 + randInt(answer - 3);
        display = `x − ${a} = ${answer - a}`;
    } else if (pattern === 'times') {
        const a = 3 + randInt(6);
        answer = 3 + randInt(9);
        display = `${a} × x = ${a * answer}`;
    } else {
        const a = 2 + randInt(4);
        const q = 3 + randInt(6);
        answer = a * q;
        display = `x ÷ ${a} = ${q}`;
    }
    return withChoices({ kind: 'solvex', display, prompt: 'x = ?', answer });
}

// Équations à deux étapes : 3x + 7 = 25, (x − 4) × 3 = 27…
function makeEquationQuestion() {
    const pattern = pick(['ax-plus', 'ax-minus', 'paren-times']);
    let display, answer;
    if (pattern === 'ax-plus') {
        const a = 2 + randInt(7);
        answer = 2 + randInt(10);
        const b = 2 + randInt(18);
        display = `${a}x + ${b} = ${a * answer + b}`;
    } else if (pattern === 'ax-minus') {
        const a = 2 + randInt(7);
        answer = 3 + randInt(9);
        const b = 1 + randInt(a * answer - 2);
        display = `${a}x − ${b} = ${a * answer - b}`;
    } else {
        answer = 2 + randInt(8);
        const a = 1 + randInt(8);
        const b = 2 + randInt(3);
        display = `(x + ${a}) × ${b} = ${(answer + a) * b}`;
    }
    return withChoices({ kind: 'solvex', display, prompt: 'x = ?', answer });
}

// Niveau X — vraiment très difficile : gros produits, carrés, pourcentages,
// priorités opératoires, équations avec x des deux côtés, puissances…
function makeUltraQuestion() {
    const pattern = pick(['bigmult', 'square', 'percent', 'priority', 'bothsides', 'power', 'bigdiv']);
    let display, answer, trap = null, prompt = null;
    if (pattern === 'bigmult') {
        // Produit de deux nombres à deux chiffres : 17 × 23…
        const a = 12 + randInt(12), b = 13 + randInt(16);
        display = `${a} × ${b} = ?`;
        answer = a * b;
        trap = answer + (Math.random() < 0.5 ? 10 : -10);
    } else if (pattern === 'square') {
        // Racine carrée déguisée : x² = 169
        const x = 11 + randInt(14);
        display = `x² = ${x * x}`;
        prompt = 'x = ? (x > 0)';
        answer = x;
        trap = x + 1;
    } else if (pattern === 'percent') {
        // Pourcentage exact : 15% de 240
        const p = pick([5, 10, 15, 20, 25, 30, 40, 60, 75]);
        const base = (4 + randInt(16)) * 20; // 80 à 400, toujours exact
        display = `${p}% de ${base} = ?`;
        answer = (p * base) / 100;
        trap = answer + p;
    } else if (pattern === 'priority') {
        // Priorités sans parenthèses : le piège est de calculer de gauche à droite
        const a = 5 + randInt(20), b = 3 + randInt(6), c = 4 + randInt(8);
        display = `${a} + ${b} × ${c} = ?`;
        answer = a + b * c;
        trap = (a + b) * c;
    } else if (pattern === 'bothsides') {
        // x des deux côtés : 7x + 9 = 4x + 33
        answer = 2 + randInt(8);
        const c = 2 + randInt(4), a = c + 1 + randInt(4);
        const b = 1 + randInt(15);
        display = `${a}x + ${b} = ${c}x + ${(a - c) * answer + b}`;
        prompt = 'x = ?';
    } else if (pattern === 'power') {
        // Puissances : 2⁷, 3⁴, 8³…
        const [base, exp] = pick([[2, 6], [2, 7], [2, 8], [2, 9], [2, 10], [3, 4], [3, 5], [4, 4], [5, 4], [6, 3], [7, 3], [8, 3], [9, 3], [12, 2], [13, 2], [14, 2], [15, 2], [16, 2], [17, 2], [18, 2], [19, 2]]);
        const sup = { 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', 10: '¹⁰' }[exp];
        display = `${base}${sup} = ?`;
        answer = base ** exp;
        trap = base * exp;
    } else {
        // Grande division exacte : 391 ÷ 17
        const b = 12 + randInt(13), q = 12 + randInt(17);
        display = `${b * q} ÷ ${b} = ?`;
        answer = q;
        trap = q + (Math.random() < 0.5 ? 1 : -1);
    }
    return withChoices({ kind: 'solvex', display, prompt, answer }, trap);
}

function makeQuestion(level) {
    if (level.kind === 'paren') return makeParenQuestion();
    if (level.kind === 'solvex') return makeSolveXQuestion();
    if (level.kind === 'equation') return makeEquationQuestion();
    if (level.kind === 'ultra') return makeUltraQuestion();

    const op = level.ops[Math.floor(Math.random() * level.ops.length)];
    let a, b, answer;
    if (op === '+') {
        answer = 2 + randInt(level.max - 2); // résultat entre 2 et max
        a = 1 + randInt(answer - 2);
        b = answer - a;
    } else if (op === '×') {
        a = 2 + randInt(level.multMax - 2);
        b = 2 + randInt(level.multMax > 10 ? 11 : 8); // 2e facteur : jusqu'à 10 (enfants) ou 13 (adultes)
        answer = a * b;
    } else if (op === '÷') {
        answer = 2 + randInt(10);
        b = 2 + randInt(level.divMax - 2);
        a = answer * b; // division toujours exacte
    } else {
        a = 2 + randInt(level.max - 2);
        b = 1 + randInt(a - 1); // b < a, jamais de résultat négatif
        answer = a - b;
    }

    // erreurs typiques de tables : une ligne ou une colonne à côté
    const trap = op === '×' && Math.random() < 0.7
        ? (Math.random() < 0.5 ? a * (b + (Math.random() < 0.5 ? 1 : -1)) : (a + (Math.random() < 0.5 ? 1 : -1)) * b)
        : null;

    return withChoices({ kind: 'basic', a, b, op, answer }, trap);
}

const MathGame = ({ onExit }) => {
    const [gameStatus, setGameStatus] = useState('intro'); // intro, playing, summary
    const [level, setLevel] = useState(LEVELS[0]);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [question, setQuestion] = useState(null);
    const [results, setResults] = useState([]); // true/false par question
    const [selected, setSelected] = useState(null); // réponse cliquée
    const [locked, setLocked] = useState(false);
    const [timeLeft, setTimeLeft] = useState(20);

    const startGame = (lvl) => {
        setLevel(lvl);
        setQuestionIndex(0);
        setResults([]);
        setSelected(null);
        setLocked(false);
        setQuestion(makeQuestion(lvl));
        setTimeLeft(lvl.time);
        setGameStatus('playing');
    };

    const finishQuestion = (choice) => {
        setLocked(true);
        setSelected(choice);
        const good = choice === question.answer;
        setResults(r => [...r, good]);

        setTimeout(() => {
            if (questionIndex + 1 >= TOTAL_QUESTIONS) {
                setGameStatus('summary');
            } else {
                setQuestionIndex(i => i + 1);
                setQuestion(makeQuestion(level));
                setSelected(null);
                setLocked(false);
                setTimeLeft(level.time);
            }
        }, good ? 1000 : 1800);
    };

    const handleAnswer = (choice) => {
        if (locked) return;
        finishQuestion(choice);
    };

    // Chrono de la question : à zéro, la question est perdue
    useEffect(() => {
        if (gameStatus !== 'playing' || locked) return;
        if (timeLeft <= 0) {
            finishQuestion(null);
            return;
        }
        const t = setTimeout(() => setTimeLeft(v => v - 1), 1000);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft, gameStatus, locked]);

    const goodCount = results.filter(Boolean).length;
    const stars = goodCount >= 9 ? 3 : goodCount >= 7 ? 2 : goodCount >= 4 ? 1 : 0;

    const mascot = () => {
        if (!locked) return timeLeft <= 5 ? '😰' : '🦊';
        return selected === question.answer ? '🥳' : '😅';
    };

    const opSymbol = (op) => (op === '-' ? '−' : op);

    return (
        <div className="full-screen flex-col" style={{ alignItems: 'center', justifyContent: 'center', overflowY: 'auto' }}>
            <button className="btn-primary btn-menu" onClick={onExit}>🏠 Menu</button>

            {gameStatus === 'intro' && (
                <div className="absolute-cover flex-center z-high modal-overlay">
                    <div className="modal-content glass-effect" style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="kids-intro-emoji floaty">🧮</div>
                        <h1 className="title-gradient">CALCUL MAGIQUE</h1>
                        <p className="subtitle" style={{ marginBottom: '1rem' }}>10 calculs contre la montre. Choisis ton niveau !</p>

                        <p className="math-group-label">👧 Pour les enfants</p>
                        <div className="math-level-grid">
                            {LEVELS.filter(l => l.group === 'kids').map(lvl => (
                                <button key={lvl.id} className="btn-primary math-level-btn" onClick={() => startGame(lvl)}>
                                    {lvl.label}
                                    <span>{lvl.desc}</span>
                                </button>
                            ))}
                        </div>

                        <p className="math-group-label">🧑‍🎓 Pour les grands</p>
                        <div className="math-level-grid">
                            {LEVELS.filter(l => l.group === 'adult').map(lvl => (
                                <button key={lvl.id} className="btn-primary math-level-btn math-level-adult" onClick={() => startGame(lvl)}>
                                    {lvl.label}
                                    <span>{lvl.desc}</span>
                                </button>
                            ))}
                        </div>

                        <p className="math-group-label">🏆 Expert Pro</p>
                        <div className="math-level-grid math-level-grid-3">
                            {LEVELS.filter(l => l.group === 'pro').map(lvl => (
                                <button key={lvl.id} className="btn-primary math-level-btn math-level-pro" onClick={() => startGame(lvl)}>
                                    {lvl.label}
                                    <span>{lvl.desc}</span>
                                </button>
                            ))}
                        </div>

                        <p className="math-group-label">💀 Le défi ultime</p>
                        <div className="math-level-grid math-level-grid-1">
                            {LEVELS.filter(l => l.group === 'x').map(lvl => (
                                <button key={lvl.id} className="btn-primary math-level-btn math-level-x" onClick={() => startGame(lvl)}>
                                    {lvl.label}
                                    <span>{lvl.desc}</span>
                                </button>
                            ))}
                        </div>

                        <GameTopScores gameMode="math" />
                    </div>
                </div>
            )}

            {gameStatus === 'playing' && question && (
                <div style={{ width: '100%', maxWidth: '700px', padding: '1rem' }}>
                    <div className="math-progress">
                        {Array.from({ length: TOTAL_QUESTIONS }, (_, i) => (
                            <span
                                key={i}
                                className={`dot ${i < results.length ? (results[i] ? 'good' : 'bad') : i === questionIndex ? 'current' : ''}`}
                            />
                        ))}
                    </div>

                    <div className="math-mascot">{mascot()}</div>

                    <div className="math-question-card pop-in" key={questionIndex}>
                        {question.kind === 'basic' ? (
                            <div className="math-operation">
                                <span>{question.a}</span>
                                <span className="math-sign">{opSymbol(question.op)}</span>
                                <span>{question.b}</span>
                                <span className="math-sign">=</span>
                                <span>?</span>
                            </div>
                        ) : (
                            <div className="math-operation math-operation-text">
                                <span>{question.display}</span>
                            </div>
                        )}
                        {question.prompt && <div className="math-prompt">{question.prompt}</div>}
                        {/* Chrono de la question */}
                        <div className={`hbar-timer ${timeLeft <= 5 ? 'warning' : ''}`}>
                            <div className="hbar-timer-fill" style={{ width: `${(timeLeft / level.time) * 100}%` }} />
                        </div>
                        <div className="hbar-timer-label">⏱️ {timeLeft} s</div>
                    </div>

                    <div className="math-answers">
                        {question.choices.map((choice, i) => {
                            let cls = 'math-answer-btn';
                            if (locked && choice === question.answer) cls += ' correct';
                            else if (locked && choice === selected) cls += ' wrong';
                            return (
                                // Clé liée à la question : évite qu'un bouton garde un état
                                // focus/survol d'une question précédente (mobile).
                                <button key={`${questionIndex}-${i}`} className={cls} disabled={locked} onClick={() => handleAnswer(choice)}>
                                    {choice}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {gameStatus === 'summary' && (
                <div className="absolute-cover flex-center z-high modal-overlay">
                    {stars >= 2 && <Confetti />}
                    <div className="modal-content glass-effect pop-in">
                        <div className="kids-intro-emoji">{stars >= 2 ? '🏆' : stars === 1 ? '💪' : '🌱'}</div>
                        <h1 className="title-gradient">{stars >= 2 ? 'FANTASTIQUE !' : stars === 1 ? 'BIEN JOUÉ !' : 'CONTINUE !'}</h1>
                        <div className="stars-row">
                            {[1, 2, 3].map(s => (
                                <span key={s} className={s <= stars ? '' : 'star-off'}>⭐</span>
                            ))}
                        </div>
                        <p className="subtitle">Tu as réussi {goodCount} calculs sur {TOTAL_QUESTIONS} au niveau {level.label} !</p>
                        {/* Score pondéré par la difficulté pour le classement */}
                        <ScoreSaver gameMode="math" score={goodCount * 10 * level.id} />
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

export default MathGame;
