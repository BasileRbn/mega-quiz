import React, { useState, useRef, useEffect, useCallback } from 'react';
import Confetti from './Confetti';
import ScoreSaver from './ScoreSaver';
import GameTopScores from './GameTopScores';

// Space Invaders — repousse les vagues d'aliens ! Le vaisseau tire tout seul,
// on le déplace au doigt ou aux flèches. Chaque vague est plus rapide,
// avec plus d'aliens… et à partir de la vague 2, ils ripostent !
// Les aliens détruits lâchent parfois des bonus à attraper.

const PLAYER_WIDTH = 64;
const ALIEN_SPACING_X = 52;
const ALIEN_SPACING_Y = 48;
const BEST_KEY = 'invaders_best_score';
const ROW_EMOJIS = ['🛸', '👽', '👾', '🤖', '😈'];
const BOSS_EMOJIS = ['👹', '🐲', '🦑', '🤖', '💀'];
const START_LIVES = 4;
const MAX_LIVES = 6;
// Avance du vaisseau : jusqu'à 3 crans vers l'avant (flèches ⬆️⬇️ ou doigt)
const LIFT_STEP = 44;
const MAX_LIFT = LIFT_STEP * 3;
// Décalage latéral de la 2e fusée (bonus 2️⃣)
const WINGMAN_OFFSET = 70;
const wingmanX = (px, w) => (px > WINGMAN_OFFSET + PLAYER_WIDTH / 2 ? px - WINGMAN_OFFSET : Math.min(w - PLAYER_WIDTH / 2, px + WINGMAN_OFFSET));

// Bonus lâchés par les aliens (poids = fréquence relative)
const POWERUPS = [
    { type: 'rapid', emoji: '🔥', label: 'Tir rapide', weight: 22, duration: 8000 },
    { type: 'triple', emoji: '🔱', label: 'Tir croisé', weight: 18, duration: 8000 },
    { type: 'laser', emoji: '⚡', label: 'Laser perforant', weight: 15, duration: 6000 },
    { type: 'slow', emoji: '🐌', label: 'Ralenti', weight: 18, duration: 5000 },
    { type: 'wingman', emoji: '2️⃣', label: 'Double fusée', weight: 15, duration: 10000 },
    { type: 'bomb', emoji: '💣', label: 'Bombe', weight: 15 },
    { type: 'life', emoji: '❤️', label: 'Vie bonus', weight: 12 },
];

const pickPowerup = () => {
    const total = POWERUPS.reduce((s, p) => s + p.weight, 0);
    let r = Math.random() * total;
    for (const p of POWERUPS) {
        r -= p.weight;
        if (r <= 0) return p;
    }
    return POWERUPS[0];
};

const SpaceInvadersGame = ({ onExit }) => {
    const [gameStatus, setGameStatus] = useState('intro'); // intro, playing, gameover
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(START_LIVES);
    const [wave, setWave] = useState(1);
    const [waveBanner, setWaveBanner] = useState(null);
    const [playerX, setPlayerX] = useState(0);
    const [playerLift, setPlayerLift] = useState(0); // avance vers le haut, en pixels
    const [aliens, setAliens] = useState([]);
    const [bullets, setBullets] = useState([]);
    const [alienBullets, setAlienBullets] = useState([]);
    const [powerups, setPowerups] = useState([]);
    const [explosions, setExplosions] = useState([]);
    const [boss, setBoss] = useState(null);
    const [bossLaser, setBossLaser] = useState(null);
    const [activeFx, setActiveFx] = useState([]);
    const [hitFlash, setHitFlash] = useState(false);
    const [best, setBest] = useState(() => Number(localStorage.getItem(BEST_KEY)) || 0);

    const areaRef = useRef(null);
    const loopRef = useRef(null);
    const keysRef = useRef({});
    const playerXRef = useRef(0);
    const liftRef = useRef(0);
    const stateRef = useRef(null); // état complet du jeu, muté par la boucle
    const audioCtxRef = useRef(null);
    const nextIdRef = useRef(1);

    const areaWidth = () => areaRef.current?.clientWidth || window.innerWidth;
    const areaHeight = () => areaRef.current?.clientHeight || window.innerHeight;

    const playTone = useCallback((freq, duration = 0.08, type = 'square', volume = 0.06) => {
        try {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = audioCtxRef.current;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(volume, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            osc.connect(gain).connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch {
            // pas de son disponible, le jeu reste jouable
        }
    }, []);

    const movePlayerTo = useCallback((x) => {
        const w = areaWidth();
        const clamped = Math.max(PLAYER_WIDTH / 2, Math.min(w - PLAYER_WIDTH / 2, x));
        playerXRef.current = clamped;
        setPlayerX(clamped);
    }, []);

    // Avance/recul du vaisseau, borné à 3 crans vers l'avant
    const setLift = useCallback((value) => {
        const clamped = Math.max(0, Math.min(MAX_LIFT, value));
        liftRef.current = clamped;
        setPlayerLift(clamped);
    }, []);

    const stopLoop = () => {
        if (loopRef.current) clearInterval(loopRef.current);
        loopRef.current = null;
    };

    // Prépare la formation d'aliens d'une vague
    const buildWave = useCallback((waveNum) => {
        const w = areaWidth();
        const cols = Math.min(8, Math.max(4, Math.floor((w - 100) / ALIEN_SPACING_X)));
        const rows = Math.min(5, 2 + Math.floor((waveNum - 1) / 2));
        const formationWidth = (cols - 1) * ALIEN_SPACING_X;
        const startX = (w - formationWidth) / 2;
        const list = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                list.push({
                    id: nextIdRef.current++,
                    bx: startX + c * ALIEN_SPACING_X,
                    by: 80 + r * ALIEN_SPACING_Y,
                    emoji: ROW_EMOJIS[r % ROW_EMOJIS.length],
                    alive: true,
                });
            }
        }
        return { list, total: rows * cols };
    }, []);

    const startWave = useCallback((waveNum) => {
        const s = stateRef.current;
        const { list, total } = buildWave(waveNum);
        s.aliens = list;
        s.totalAliens = total;
        s.offX = 0;
        s.offY = 0;
        s.dir = 1;
        s.bullets = [];
        s.alienBullets = [];
        s.powerups = [];
        s.boss = null;
        s.bossSpecial = null;
        s.lastShot = 0;
        s.lastAlienShot = 0;
        setWave(waveNum);
        setBossLaser(null);
        setAliens([...list]);
        setBullets([]);
        setAlienBullets([]);
        setPowerups([]);
        setBoss(null);
        setWaveBanner(`🚀 Niveau ${waveNum} !`);
        setTimeout(() => setWaveBanner(null), 1400);
    }, [buildWave]);

    const endGame = useCallback(() => {
        stopLoop();
        const finalScore = stateRef.current?.score ?? 0;
        setBest(prev => {
            if (finalScore > prev) {
                localStorage.setItem(BEST_KEY, String(finalScore));
                return finalScore;
            }
            return prev;
        });
        setGameStatus('gameover');
    }, []);

    const tick = useCallback(() => {
        const s = stateRef.current;
        if (!s || s.paused) return;
        const now = performance.now();
        const dt = Math.min((now - s.lastFrame) / 1000, 0.12);
        s.lastFrame = now;

        const w = areaWidth();
        const h = areaHeight();
        const playerY = h - 60 - liftRef.current; // le vaisseau peut avancer de 3 crans
        const px = playerXRef.current;

        const rapidOn = now < s.fx.rapid;
        const tripleOn = now < s.fx.triple;
        const laserOn = now < s.fx.laser;
        const wingmanOn = now < s.fx.wingman;
        const slowFactor = now < s.fx.slow ? 0.35 : 1;

        // Déplacement clavier
        const move = (keysRef.current.ArrowRight ? 1 : 0) - (keysRef.current.ArrowLeft ? 1 : 0);
        if (move !== 0) movePlayerTo(px + move * 520 * dt);

        // La formation accélère avec la vague ET quand il reste peu d'aliens
        const aliveList = s.aliens.filter(a => a.alive);
        const aliveRatio = aliveList.length / s.totalAliens;
        const speed = (26 + s.wave * 14) * (1 + (1 - aliveRatio) * 1.4) * slowFactor;

        // Mouvement latéral + descente aux bords
        s.offX += s.dir * speed * dt;
        const xs = aliveList.map(a => a.bx + s.offX);
        if (xs.length > 0) {
            if (Math.max(...xs) > w - 34 && s.dir > 0) { s.dir = -1; s.offY += 22; }
            else if (Math.min(...xs) < 34 && s.dir < 0) { s.dir = 1; s.offY += 22; }
        }

        // Tir automatique du joueur (plus rapide avec le bonus 🔥)
        const fireInterval = Math.max(260, 420 - s.wave * 15) * (rapidOn ? 0.45 : 1);
        if (now - s.lastShot > fireInterval) {
            s.lastShot = now;
            const pierce = laserOn;
            s.bullets.push({ id: nextIdRef.current++, x: px, y: playerY - 30, vx: 0, pierce });
            if (tripleOn) {
                s.bullets.push({ id: nextIdRef.current++, x: px, y: playerY - 30, vx: -140, pierce });
                s.bullets.push({ id: nextIdRef.current++, x: px, y: playerY - 30, vx: 140, pierce });
            }
            // Bonus 2️⃣ : la deuxième fusée tire en même temps
            if (wingmanOn) {
                s.bullets.push({ id: nextIdRef.current++, x: wingmanX(px, w), y: playerY - 30, vx: 0, pierce });
            }
            playTone(laserOn ? 1320 : 880, 0.05, 'square', 0.03);
        }

        // Riposte des aliens à partir de la vague 2 (ralentie par 🐌)
        const alienFireEvery = Math.max(650, 2300 - s.wave * 220) / slowFactor;
        if (s.wave >= 2 && aliveList.length > 0 && now - s.lastAlienShot > alienFireEvery) {
            s.lastAlienShot = now;
            const shooter = aliveList[Math.floor(Math.random() * aliveList.length)];
            s.alienBullets.push({
                id: nextIdRef.current++,
                x: shooter.bx + s.offX,
                y: shooter.by + s.offY + 20,
                vx: 0,
                vy: 150 + s.wave * 18,
            });
        }

        // ---- BIG BOSS de fin de niveau ----
        if (s.boss) {
            const b = s.boss;
            if (!b.entryDone) {
                // Entrée en scène par le haut
                b.y += 130 * dt;
                if (b.y >= b.targetY) {
                    b.y = b.targetY;
                    b.entryDone = true;
                }
            } else {
                // Mouvements vivants : ondulation verticale + accélérations soudaines
                b.y = b.targetY + Math.sin(now / 550) * (16 + s.wave * 3);
                if (now > (b.nextDash || 0)) {
                    b.dashUntil = now + 900;
                    b.nextDash = now + 3500 + Math.random() * 2500;
                    b.dir = px > b.x ? 1 : -1; // fonce vers le joueur !
                }
                const dashMult = now < b.dashUntil ? 2.1 : 1;
                b.x += b.dir * (60 + s.wave * 16) * dashMult * slowFactor * dt;
                if (b.x > w - 70) b.dir = -1;
                else if (b.x < 70) b.dir = 1;

                // Tirs visés sur le joueur ; en rafale éventail à partir du niveau 3
                const bossFireEvery = Math.max(420, 1500 - s.wave * 140) / slowFactor;
                if (now - b.lastShot > bossFireEvery) {
                    b.lastShot = now;
                    const baseAngle = Math.atan2(playerY - b.y, px - b.x);
                    const spread = s.wave >= 5 ? [-0.4, 0, 0.4] : s.wave >= 3 ? [-0.3, 0.3] : [0];
                    const bulletSpeedBoss = 170 + s.wave * 22;
                    spread.forEach(offset => {
                        const angle = baseAngle + offset;
                        s.alienBullets.push({
                            id: nextIdRef.current++,
                            x: b.x,
                            y: b.y + 26,
                            vx: Math.cos(angle) * bulletSpeedBoss,
                            vy: Math.abs(Math.sin(angle)) * bulletSpeedBoss + 60,
                        });
                    });
                    playTone(220, 0.1, 'sawtooth', 0.05);
                }

                // Attaques spéciales à partir du niveau 5 : laser vertical ou missile guidé
                if (s.wave >= 5 && !s.bossSpecial && now > (b.nextSpecial || 0)) {
                    b.nextSpecial = now + 5500 + Math.random() * 2000;
                    if (Math.random() < 0.5) {
                        // Laser : une zone d'avertissement clignote avant le rayon → on a le temps de s'écarter
                        s.bossSpecial = { type: 'laser', x: b.x, phase: 'warn', until: now + 950, hasHit: false };
                        playTone(1400, 0.35, 'sine', 0.05);
                    } else {
                        // Missile guidé : il suit le vaisseau mais tourne lentement, esquivable
                        s.alienBullets.push({
                            id: nextIdRef.current++,
                            x: b.x, y: b.y + 30,
                            vx: 0, vy: 130 + s.wave * 6,
                            homing: true, missile: true, dies: now + 4500,
                        });
                        playTone(480, 0.25, 'sawtooth', 0.06);
                    }
                }
            }

            // Pendant le combat de boss, des bonus tombent régulièrement du ciel
            if (now > (s.bossNextDrop || 0)) {
                s.bossNextDrop = now + 6000 + Math.random() * 3000;
                s.powerups.push({ id: nextIdRef.current++, x: 50 + Math.random() * (w - 100), y: -20, ...pickPowerup() });
            }
        }

        // Déroulé du laser du boss : avertissement puis rayon
        let laserHit = false;
        if (s.bossSpecial?.type === 'laser') {
            const sp = s.bossSpecial;
            if (sp.phase === 'warn' && now > sp.until) {
                sp.phase = 'fire';
                sp.until = now + 600;
                playTone(1100, 0.5, 'square', 0.07);
            } else if (sp.phase === 'fire') {
                if (!sp.hasHit && Math.abs(px - sp.x) < 30) {
                    sp.hasHit = true;
                    laserHit = true;
                }
                if (now > sp.until) s.bossSpecial = null;
            }
            if (!s.boss) s.bossSpecial = null;
        }

        // Balles du joueur : montée + collisions (le laser ⚡ transperce)
        const bulletSpeed = laserOn ? 580 : 460;
        const keptBullets = [];
        const killed = new Set();
        for (const b of s.bullets) {
            const y = b.y - bulletSpeed * dt;
            const x = b.x + (b.vx || 0) * dt;
            if (y < -20 || x < -20 || x > w + 20) continue;
            // Touche le boss ? (même le laser est absorbé par sa carapace)
            if (s.boss && s.boss.y >= 0 && Math.abs(s.boss.x - x) < 44 && Math.abs(s.boss.y - y) < 38) {
                s.boss.hp -= 1;
                s.explosions.push({ id: nextIdRef.current++, x, y, until: now + 300 });
                playTone(300, 0.06, 'square', 0.05);
                continue;
            }
            const target = s.aliens.find(a => {
                if (!a.alive || killed.has(a.id)) return false;
                return Math.abs(a.bx + s.offX - x) < 24 && Math.abs(a.by + s.offY - y) < 22;
            });
            if (target) {
                killed.add(target.id);
                s.score += 10 * s.wave;
                s.explosions.push({ id: nextIdRef.current++, x: target.bx + s.offX, y: target.by + s.offY, until: now + 400 });
                playTone(160, 0.12, 'sawtooth', 0.07);
                // Le bonus tombe parfois de l'alien détruit
                if (Math.random() < 0.18) {
                    const p = pickPowerup();
                    s.powerups.push({ id: nextIdRef.current++, x: target.bx + s.offX, y: target.by + s.offY, ...p });
                }
                if (b.pierce) keptBullets.push({ ...b, x, y }); // le laser continue sa route
            } else {
                keptBullets.push({ ...b, x, y });
            }
        }
        s.bullets = keptBullets;
        if (killed.size > 0) {
            s.aliens = s.aliens.map(a => (killed.has(a.id) ? { ...a, alive: false } : a));
        }

        // Bonus : chute + attrape par le vaisseau
        const keptPowerups = [];
        for (const p of s.powerups) {
            const y = p.y + 150 * dt;
            if (y > h + 30) continue;
            const caught = Math.abs(p.x - px) < 44 && y > playerY - 34 && y < playerY + 34;
            if (caught) {
                playTone(1200, 0.18, 'triangle', 0.09);
                if (p.type === 'life') {
                    s.lives = Math.min(MAX_LIVES, s.lives + 1);
                    setLives(s.lives);
                } else if (p.type === 'bomb') {
                    // Grosse explosion : détruit jusqu'à 6 aliens au hasard
                    const alive = s.aliens.filter(a => a.alive);
                    const targets = [...alive].sort(() => 0.5 - Math.random()).slice(0, 6);
                    const bombKilled = new Set(targets.map(t => t.id));
                    targets.forEach(t => {
                        s.score += 10 * s.wave;
                        s.explosions.push({ id: nextIdRef.current++, x: t.bx + s.offX, y: t.by + s.offY, until: now + 500 });
                    });
                    s.aliens = s.aliens.map(a => (bombKilled.has(a.id) ? { ...a, alive: false } : a));
                    playTone(70, 0.5, 'sawtooth', 0.12);
                } else {
                    s.fx[p.type] = now + p.duration;
                }
            } else {
                keptPowerups.push({ ...p, y });
            }
        }
        s.powerups = keptPowerups;

        // Balles des aliens et du boss : trajectoire + collision avec le vaisseau
        const keptAlienBullets = [];
        let playerHit = laserHit;
        for (const b of s.alienBullets) {
            let vx = b.vx ?? 0;
            const vy = b.vy ?? 150;
            if (b.homing) {
                if (now > b.dies) {
                    // le missile s'essouffle et explose dans le vide
                    s.explosions.push({ id: nextIdRef.current++, x: b.x, y: b.y, until: now + 300 });
                    continue;
                }
                // Tête chercheuse à rotation limitée : on peut l'esquiver
                const wantedVx = Math.max(-200, Math.min(200, (px - b.x) * 1.4));
                const steer = 240 * dt;
                vx += Math.max(-steer, Math.min(steer, wantedVx - vx));
            }
            const y = b.y + vy * slowFactor * dt;
            const x = b.x + vx * slowFactor * dt;
            if (y > h + 20 || x < -20 || x > w + 20) continue;
            if (Math.abs(x - px) < 28 && y > playerY - 24 && y < playerY + 24) {
                playerHit = true;
                continue;
            }
            keptAlienBullets.push({ ...b, x, y, vx });
        }
        s.alienBullets = keptAlienBullets;

        // Un alien atteint la ligne du vaisseau : on perd une vie, la vague remonte
        const reachedBottom = aliveList.some(a => a.by + s.offY > playerY - 50);
        if (reachedBottom) {
            s.offY = Math.max(0, s.offY - 130);
        }

        if (playerHit || reachedBottom) {
            s.lives -= 1;
            setLives(s.lives);
            setHitFlash(true);
            playTone(90, 0.4, 'sawtooth', 0.1);
            setTimeout(() => setHitFlash(false), 350);
            if (s.lives <= 0) {
                setScore(s.score);
                endGame();
                return;
            }
        }

        // Nettoie les explosions terminées
        s.explosions = s.explosions.filter(e => e.until > now);

        const stillAlive = s.aliens.filter(a => a.alive);

        // Vague nettoyée → le BIG BOSS entre en scène !
        if (stillAlive.length === 0 && !s.boss) {
            const hp = 10 + s.wave * 5; // de plus en plus coriace
            s.boss = {
                x: w / 2,
                y: -70,
                targetY: 130,
                hp,
                maxHp: hp,
                emoji: BOSS_EMOJIS[(s.wave - 1) % BOSS_EMOJIS.length],
                dir: Math.random() < 0.5 ? 1 : -1,
                lastShot: now + 900,
                entryDone: false,
                nextDash: now + 2500,
                dashUntil: 0,
                nextSpecial: now + 3000,
            };
            s.bossNextDrop = now + 4000;
            playTone(110, 0.5, 'sawtooth', 0.1);
            setWaveBanner('⚠️ BIG BOSS !');
            setTimeout(() => setWaveBanner(null), 1600);
        }

        // Boss vaincu → gros bonus, pluie de cadeaux, niveau suivant
        if (s.boss && s.boss.hp <= 0) {
            const b = s.boss;
            s.score += 100 * s.wave;
            for (let i = 0; i < 6; i++) {
                s.explosions.push({
                    id: nextIdRef.current++,
                    x: b.x + (Math.random() - 0.5) * 90,
                    y: b.y + (Math.random() - 0.5) * 70,
                    until: now + 300 + Math.random() * 400,
                });
            }
            // Le boss lâche toujours 2 bonus (réinjectés après le reset de la vague)
            const drops = [0, 1].map(i => ({
                id: nextIdRef.current++, x: b.x - 40 + i * 80, y: b.y, ...pickPowerup(),
            }));
            s.boss = null;
            s.bossSpecial = null;
            s.wave += 1;
            setScore(s.score);
            setBoss(null);
            setBossLaser(null);
            playTone(660, 0.15, 'triangle', 0.08);
            playTone(880, 0.3, 'triangle', 0.08);
            s.paused = true;
            setTimeout(() => {
                startWave(s.wave);
                s.powerups = drops;
                setPowerups([...drops]);
                s.paused = false;
                s.lastFrame = performance.now();
            }, 1200);
            return;
        }

        // Synchronise l'affichage
        setScore(s.score);
        setAliens(stillAlive.map(a => ({ ...a, x: a.bx + s.offX, y: a.by + s.offY })));
        setBullets([...s.bullets]);
        setAlienBullets([...s.alienBullets]);
        setPowerups([...s.powerups]);
        setExplosions([...s.explosions]);
        setBoss(s.boss ? { ...s.boss } : null);
        setBossLaser(s.bossSpecial?.type === 'laser' ? { ...s.bossSpecial } : null);
        setActiveFx(POWERUPS
            .filter(p => p.duration && now < s.fx[p.type])
            .map(p => ({ emoji: p.emoji, left: Math.ceil((s.fx[p.type] - now) / 1000) })));
    }, [movePlayerTo, playTone, startWave, endGame]);

    const startGame = () => {
        stopLoop();
        stateRef.current = {
            score: 0, lives: START_LIVES, wave: 1, aliens: [], totalAliens: 1,
            offX: 0, offY: 0, dir: 1, bullets: [], alienBullets: [],
            powerups: [], explosions: [], boss: null, bossSpecial: null, bossNextDrop: 0,
            fx: { rapid: 0, triple: 0, laser: 0, slow: 0, wingman: 0 },
            lastShot: 0, lastAlienShot: 0, lastFrame: performance.now(), paused: false,
        };
        setScore(0);
        setLives(START_LIVES);
        setActiveFx([]);
        setExplosions([]);
        setGameStatus('playing');
        movePlayerTo(areaWidth() / 2);
        setLift(0);
        startWave(1);
        stateRef.current.wave = 1;
        loopRef.current = setInterval(tick, 33);
    };

    // Clavier : ⬅️➡️ pour se déplacer, ⬆️⬇️ pour avancer/reculer d'un cran (3 max)
    useEffect(() => {
        const down = (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                keysRef.current[e.key] = true;
                e.preventDefault();
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                if (!e.repeat) {
                    const currentStep = Math.round(liftRef.current / LIFT_STEP);
                    const nextStep = currentStep + (e.key === 'ArrowUp' ? 1 : -1);
                    setLift(nextStep * LIFT_STEP);
                }
                e.preventDefault();
            }
        };
        const up = (e) => { keysRef.current[e.key] = false; };
        window.addEventListener('keydown', down);
        window.addEventListener('keyup', up);
        return () => {
            window.removeEventListener('keydown', down);
            window.removeEventListener('keyup', up);
        };
    }, [setLift]);

    // Arrêt propre à la sortie
    useEffect(() => stopLoop, []);

    // Accès à l'état du jeu pour le débogage (en développement seulement)
    useEffect(() => {
        if (import.meta.env.DEV) window.__invadersState = stateRef;
    }, []);

    const handlePointer = (e) => {
        if (gameStatus !== 'playing') return;
        const rect = areaRef.current.getBoundingClientRect();
        movePlayerTo(e.clientX - rect.left);
        // Le doigt/la souris contrôle aussi l'avance (jusqu'à 3 crans au-dessus de la base)
        setLift((rect.height - 60) - (e.clientY - rect.top));
    };

    const heartsMax = Math.max(START_LIVES, lives);
    const wingmanActive = activeFx.some(f => f.emoji === '2️⃣');

    return (
        <div
            ref={areaRef}
            className={`full-screen invaders-area ${gameStatus === 'playing' ? 'playing' : ''} ${hitFlash ? 'action-hit' : ''}`}
            onPointerMove={handlePointer}
            onPointerDown={handlePointer}
        >
            <button className="btn-primary btn-menu" onClick={() => { stopLoop(); onExit(); }}>🏠 Menu</button>

            {gameStatus === 'intro' && (
                <div className="absolute-cover flex-center z-high modal-overlay">
                    <div className="modal-content glass-effect" style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="kids-intro-emoji floaty">👾</div>
                        <h1 className="title-gradient">SPACE INVADERS</h1>
                        <p className="subtitle" style={{ marginBottom: '0.75rem' }}>
                            Déplace ton vaisseau au doigt ou aux flèches ⬅️ ➡️ — il tire tout seul !
                            Avance jusqu'à 3 crans vers l'avant avec ⬆️ ⬇️ (ou en glissant le doigt vers le haut).
                        </p>

                        <p className="legend-title good">🎁 Attrape ces bonus (lâchés par les aliens détruits)</p>
                        <div className="legend-grid">
                            <span className="legend-item">🔥 <b>Tir rapide</b> — mitraille pendant 8 s</span>
                            <span className="legend-item">🔱 <b>Tir croisé</b> — 3 balles à la fois</span>
                            <span className="legend-item">⚡ <b>Laser</b> — transperce tout</span>
                            <span className="legend-item">2️⃣ <b>Double fusée</b> — un 2ᵉ vaisseau tire avec toi 10 s</span>
                            <span className="legend-item">💣 <b>Bombe</b> — méga explosion !</span>
                            <span className="legend-item">❤️ <b>Vie bonus</b> — +1 cœur (max 6)</span>
                            <span className="legend-item">🐌 <b>Ralenti</b> — ennemis au ralenti 5 s</span>
                        </div>

                        <p className="legend-title bad">⚠️ Évite tout ça (−1 vie ❤️)</p>
                        <div className="legend-grid">
                            <span className="legend-item danger"><span className="mini-bullet" /> <b>Les tirs rouges</b> des aliens (dès le niveau 2)</span>
                            <span className="legend-item danger">👾 <b>Les aliens</b> qui descendent jusqu'à toi</span>
                            <span className="legend-item danger">👹 <b>Le BIG BOSS</b> en fin de niveau : il te vise, esquive !</span>
                            <span className="legend-item danger">⚡🚀 <b>Niveau 5+</b> : le boss lance des lasers et des missiles guidés !</span>
                        </div>
                        {best > 0 && <p style={{ fontWeight: 700, color: '#d97706', marginBottom: '1rem' }}>🏅 Ton record : {best}</p>}
                        <button className="btn-primary btn-restart" onClick={startGame}>🚀 C'est parti !</button>
                        <GameTopScores gameMode="invaders" />
                    </div>
                </div>
            )}

            {gameStatus === 'playing' && (
                <>
                    <div className="action-hud">
                        <span className="hud-chip">⭐ {score}</span>
                        <span className="hud-chip">👾 Niveau {wave}</span>
                        <span className="hud-chip">{'❤️'.repeat(Math.max(0, lives))}{'🖤'.repeat(Math.max(0, heartsMax - lives))}</span>
                        {activeFx.map(f => (
                            <span key={f.emoji} className="hud-chip fx-chip">{f.emoji} {f.left}s</span>
                        ))}
                    </div>
                    {waveBanner && <div className="wave-banner pop-in">{waveBanner}</div>}
                    {aliens.map(a => (
                        <span key={a.id} className="invader" style={{ left: a.x, top: a.y }}>{a.emoji}</span>
                    ))}
                    {bullets.map(b => (
                        <span key={b.id} className={`inv-bullet ${b.pierce ? 'laser' : ''}`} style={{ left: b.x, top: b.y }} />
                    ))}
                    {alienBullets.map(b => (
                        b.missile
                            ? <span key={b.id} className="inv-missile" style={{ left: b.x, top: b.y }}>🚀</span>
                            : <span key={b.id} className="inv-bullet alien" style={{ left: b.x, top: b.y }} />
                    ))}
                    {bossLaser && (
                        <div
                            className={`boss-laser ${bossLaser.phase === 'fire' ? 'fire' : 'warn'}`}
                            style={{ left: bossLaser.x }}
                        />
                    )}
                    {boss && (
                        <div className="boss-wrap" style={{ left: boss.x, top: boss.y }}>
                            <div className="boss-hp">
                                <div className="boss-hp-fill" style={{ width: `${Math.max(0, (boss.hp / boss.maxHp) * 100)}%` }} />
                            </div>
                            <span className="boss">{boss.emoji}</span>
                        </div>
                    )}
                    {powerups.map(p => (
                        <span key={p.id} className="powerup" style={{ left: p.x, top: p.y }}>{p.emoji}</span>
                    ))}
                    {explosions.map(e => (
                        <span key={e.id} className="explosion" style={{ left: e.x, top: e.y }}>💥</span>
                    ))}
                    {wingmanActive && (
                        <div className="invader-player wingman" style={{ left: wingmanX(playerX, areaWidth()), bottom: 28 + playerLift }}>🚀</div>
                    )}
                    <div className="invader-player" style={{ left: playerX, bottom: 28 + playerLift }}>🚀</div>
                </>
            )}

            {gameStatus === 'gameover' && (
                <div className="absolute-cover flex-center z-high modal-overlay">
                    {score >= best && score > 100 && <Confetti />}
                    <div className="modal-content glass-effect pop-in">
                        <div className="kids-intro-emoji">{score >= best && score > 0 ? '🏆' : '💪'}</div>
                        <h1 className="title-gradient">{score >= best && score > 0 ? 'NOUVEAU RECORD !' : 'BIEN JOUÉ !'}</h1>
                        <p className="subtitle" style={{ fontSize: '1.3rem' }}>
                            Tu as marqué <strong>{score}</strong> points et atteint le niveau <strong>{wave}</strong> !
                            {best > 0 && <><br />🏅 Record : {best}</>}
                        </p>
                        <ScoreSaver gameMode="invaders" score={score} />
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

export default SpaceInvadersGame;
