import React, { useState, useEffect } from 'react';
import { shuffleArray } from '../utils/gameUtils';
import Confetti from './Confetti';
import ScoreSaver from './ScoreSaver';
import GameTopScores from './GameTopScores';

const TOTAL_QUESTIONS = 10; // mode classique (Le Mot Mystère)
const MAX_ERRORS = 3; // mode survie (Qui suis-je ?)
const QUESTION_TIME = 25;

// ---- Rotation des questions ----
// On mémorise en localStorage les questions déjà posées, de la plus ancienne
// à la plus récente, pour que le contenu tourne beaucoup d'une partie à
// l'autre : ce qui vient d'être vu ne revient qu'après tout le reste.
const SEEN_CAP = 0.9; // part du stock retenue en mémoire
const seenKey = (gameMode, lvl) => `mq-seen-${gameMode}-${lvl.id}`;

const readSeen = (gameMode, lvl) => {
    try {
        return JSON.parse(localStorage.getItem(seenKey(gameMode, lvl))) || [];
    } catch {
        return [];
    }
};

const rememberSeen = (gameMode, lvl, answer) => {
    try {
        const seen = readSeen(gameMode, lvl).filter(a => a !== answer);
        seen.push(answer);
        const cap = Math.floor(lvl.entries.length * SEEN_CAP);
        localStorage.setItem(seenKey(gameMode, lvl), JSON.stringify(seen.slice(-cap)));
    } catch {
        /* stockage indisponible : pas grave */
    }
};

// Ancienneté des réponses déjà posées : plus l'indice est petit, plus la
// question est ancienne (absente de la carte = jamais posée).
const ageMap = (gameMode, lvl) => new Map(readSeen(gameMode, lvl).map((a, i) => [a, i]));

// Mode survie : le niveau est découpé en bandes de difficulté croissante et
// la file avance à travers les bandes (STRIDE questions par bande), pour une
// montée en difficulté régulière. Dans chaque bande, les questions jamais
// posées passent d'abord (mélangées), puis les plus anciennes : une question
// déjà vue ne revient que lorsque toute sa bande est repassée — d'une partie
// à l'autre, on ne retombe donc pas sur les mêmes questions.
const BANDS = 5; // tranches de difficulté par niveau
const STRIDE = 6; // questions prises dans une bande avant de passer à la suivante
const buildSurvivalQueue = (lvl, gameMode) => {
    const age = ageMap(gameMode, lvl);
    const bandSize = Math.ceil(lvl.entries.length / BANDS);
    const bands = [];
    for (let b = 0; b < BANDS; b++) {
        const band = lvl.entries.slice(b * bandSize, (b + 1) * bandSize);
        bands.push([
            ...shuffleArray(band.filter(e => !age.has(e.a))),
            ...band.filter(e => age.has(e.a)).sort((x, y) => age.get(x.a) - age.get(y.a)),
        ]);
    }
    const queue = [];
    for (let start = 0; queue.length < lvl.entries.length; start += STRIDE) {
        for (const band of bands) queue.push(...band.slice(start, start + STRIDE));
    }
    return queue;
};

// Mode classique : 10 questions jamais posées en priorité, complétées par
// les plus anciennes, puis remises dans l'ordre de difficulté du niveau.
const buildShortQueue = (lvl, gameMode) => {
    const age = ageMap(gameMode, lvl);
    const fresh = shuffleArray(lvl.entries.filter(e => !age.has(e.a)));
    const stale = [...lvl.entries.filter(e => age.has(e.a))]
        .sort((a, b) => age.get(a.a) - age.get(b.a));
    return [...fresh, ...stale]
        .slice(0, TOTAL_QUESTIONS)
        .map(e => ({ ...e, rank: lvl.entries.indexOf(e) }))
        .sort((a, b) => a.rank - b.rank);
};

// ---- Choix des mauvaises réponses ----
// Pour que la réponse ne se devine pas par simple élimination, les leurres
// sont pris en priorité dans le même thème que la bonne réponse (champ t,
// au format « famille/detail »), puis dans la même famille, et en tout
// dernier recours dans le reste du niveau. Une question sur un roi de
// France propose ainsi d'autres rois de France, pas un footballeur.
const themeFamily = (t) => (t || '').split('/')[0];

const pickWrongAnswers = (entry, entries) => {
    const pools = entry.t
        ? [
            entries.filter(e => e.t === entry.t),
            entries.filter(e => e.t !== entry.t && themeFamily(e.t) === themeFamily(entry.t)),
            entries.filter(e => themeFamily(e.t) !== themeFamily(entry.t)),
        ]
        : [entries];
    const used = new Set([entry.a]);
    const wrong = [];
    for (const pool of pools) {
        for (const e of shuffleArray(pool)) {
            if (wrong.length >= 3) break;
            if (used.has(e.a)) continue;
            used.add(e.a);
            wrong.push(e.a);
        }
    }
    return wrong;
};

// Moteur générique : une question en texte, 4 réponses possibles.
// Utilisé par « Le Mot Mystère » (10 questions) et « Qui suis-je ? »
// (mode survie : la partie continue jusqu'à 3 erreurs).
const TextQuizGame = ({ onExit, config }) => {
    const { emoji, title, subtitle, levels, gameMode, survival } = config;

    const [gameStatus, setGameStatus] = useState('intro'); // intro, playing, summary
    const [level, setLevel] = useState(levels[0]);
    const [questions, setQuestions] = useState([]);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [results, setResults] = useState([]);
    const [selected, setSelected] = useState(null);
    const [locked, setLocked] = useState(false);
    const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);

    const startGame = (lvl) => {
        const queue = survival ? buildSurvivalQueue(lvl, gameMode) : buildShortQueue(lvl, gameMode);
        const prepared = queue.map(entry => {
            const wrong = pickWrongAnswers(entry, lvl.entries);
            return { ...entry, choices: shuffleArray([entry.a, ...wrong]) };
        });
        setLevel(lvl);
        setQuestions(prepared);
        setQuestionIndex(0);
        setResults([]);
        setSelected(null);
        setLocked(false);
        setTimeLeft(QUESTION_TIME);
        setGameStatus('playing');
    };

    const question = questions[questionIndex];
    const goodCount = results.filter(Boolean).length;
    const errorCount = results.length - goodCount;

    const finishQuestion = (choice) => {
        setLocked(true);
        setSelected(choice);
        const good = choice === question.a;
        setResults(r => [...r, good]);
        rememberSeen(gameMode, level, question.a);

        const errorsAfter = errorCount + (good ? 0 : 1);
        setTimeout(() => {
            const finished = survival
                ? (errorsAfter >= MAX_ERRORS || questionIndex + 1 >= questions.length)
                : (questionIndex + 1 >= questions.length);
            if (finished) {
                setGameStatus('summary');
            } else {
                setQuestionIndex(i => i + 1);
                setSelected(null);
                setLocked(false);
                setTimeLeft(QUESTION_TIME);
            }
        }, good ? 1200 : 2200);
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

    const stars = survival
        ? (goodCount >= 20 ? 3 : goodCount >= 12 ? 2 : goodCount >= 6 ? 1 : 0)
        : (goodCount >= 9 ? 3 : goodCount >= 7 ? 2 : goodCount >= 4 ? 1 : 0);

    return (
        <div className="full-screen flex-col" style={{ alignItems: 'center', justifyContent: 'center', overflowY: 'auto' }}>
            <button className="btn-primary btn-menu" onClick={onExit}>🏠 Menu</button>

            {gameStatus === 'intro' && (
                <div className="absolute-cover flex-center z-high modal-overlay">
                    <div className="modal-content glass-effect" style={{ maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="kids-intro-emoji floaty">{emoji}</div>
                        <h1 className="title-gradient">{title}</h1>
                        <p className="subtitle" style={{ marginBottom: '1rem' }}>{subtitle}</p>
                        <div className="flex-col" style={{ gap: '0.9rem' }}>
                            {levels.map(lvl => (
                                <button key={lvl.id} className="btn-primary math-level-btn" onClick={() => startGame(lvl)}>
                                    {lvl.label}
                                    <span>{lvl.desc}</span>
                                </button>
                            ))}
                        </div>
                        <GameTopScores gameMode={gameMode} />
                    </div>
                </div>
            )}

            {gameStatus === 'playing' && question && (
                <div style={{ width: '100%', maxWidth: '760px', padding: '1rem' }}>
                    {survival ? (
                        // Mode survie : vies restantes + compteur de bonnes réponses
                        <div className="survival-hud">
                            <span className="survival-lives">
                                {'❤️'.repeat(MAX_ERRORS - errorCount)}
                                {'🖤'.repeat(errorCount)}
                            </span>
                            <span className="survival-count">✅ {goodCount}</span>
                        </div>
                    ) : (
                        <div className="math-progress">
                            {Array.from({ length: TOTAL_QUESTIONS }, (_, i) => (
                                <span
                                    key={i}
                                    className={`dot ${i < results.length ? (results[i] ? 'good' : 'bad') : i === questionIndex ? 'current' : ''}`}
                                />
                            ))}
                        </div>
                    )}

                    <div className="math-question-card pop-in" key={questionIndex}>
                        <p className="text-quiz-question">{question.q}</p>
                        <div className={`hbar-timer ${timeLeft <= 6 ? 'warning' : ''}`}>
                            <div className="hbar-timer-fill" style={{ width: `${(timeLeft / QUESTION_TIME) * 100}%` }} />
                        </div>
                        <div className="hbar-timer-label">⏱️ {timeLeft} s</div>
                    </div>

                    <div className="text-quiz-answers">
                        {question.choices.map((choice, i) => {
                            let cls = 'quiz-option-btn';
                            if (locked && choice === question.a) cls += ' quiz-btn-correct';
                            else if (locked && choice === selected) cls += ' quiz-btn-wrong';
                            else if (locked) cls += ' quiz-btn-dim';
                            return (
                                // Clé liée à la question : les boutons sont recréés à chaque
                                // question, aucun état focus/survol ne persiste (mobile).
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
                        <h1 className="title-gradient">{stars >= 2 ? 'INCROYABLE !' : stars === 1 ? 'BIEN JOUÉ !' : 'CONTINUE !'}</h1>
                        <div className="stars-row">
                            {[1, 2, 3].map(s => (
                                <span key={s} className={s <= stars ? '' : 'star-off'}>⭐</span>
                            ))}
                        </div>
                        {survival ? (
                            <p className="subtitle">
                                {errorCount >= MAX_ERRORS
                                    ? `${MAX_ERRORS} erreurs… La partie s'arrête là : ${goodCount} bonnes réponses (${level.label}) !`
                                    : `Tu as répondu à TOUTES les questions du niveau : ${goodCount} bonnes réponses (${level.label}) ! 🤯`}
                            </p>
                        ) : (
                            <p className="subtitle">Tu as trouvé {goodCount} bonnes réponses sur {TOTAL_QUESTIONS} ({level.label}) !</p>
                        )}
                        {/* Score pondéré par la difficulté pour le classement */}
                        <ScoreSaver gameMode={gameMode} score={goodCount * 10 * level.id} />
                        <div className="kids-level-btns">
                            <button className="btn-primary btn-restart" onClick={() => setGameStatus('intro')}>🔄 Nouvelle partie</button>
                            <button className="btn-primary" onClick={onExit}>🏠 Menu</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TextQuizGame;
