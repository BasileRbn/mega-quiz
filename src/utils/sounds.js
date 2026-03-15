let audioContext = null;
let isMuted = false;

function getContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

function playTone(frequency, duration, type = 'sine', volume = 0.3) {
    if (isMuted) return;
    try {
        const ctx = getContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
        // Silently fail if audio not supported
    }
}

export function playCorrect() {
    playTone(523.25, 0.15, 'sine', 0.25); // C5
    setTimeout(() => playTone(659.25, 0.15, 'sine', 0.25), 100); // E5
    setTimeout(() => playTone(783.99, 0.2, 'sine', 0.25), 200); // G5
}

export function playWrong() {
    playTone(311.13, 0.3, 'sawtooth', 0.15); // Eb4
    setTimeout(() => playTone(233.08, 0.4, 'sawtooth', 0.15), 200); // Bb3
}

export function playTick() {
    playTone(1000, 0.05, 'square', 0.1);
}

export function playGameOver() {
    const notes = [523.25, 587.33, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
        setTimeout(() => playTone(freq, 0.2, 'sine', 0.2), i * 120);
    });
}

export function playClick() {
    playTone(800, 0.05, 'sine', 0.15);
}

export function toggleMute() {
    isMuted = !isMuted;
    localStorage.setItem('megaquiz_muted', isMuted.toString());
    return isMuted;
}

export function getMuted() {
    const stored = localStorage.getItem('megaquiz_muted');
    if (stored !== null) {
        isMuted = stored === 'true';
    }
    return isMuted;
}
