import React, { useMemo } from 'react';

const COLORS = ['#f472b6', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#fb7185', '#facc15'];

const makePieces = (count) =>
    Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 1.5,
        duration: 2.5 + Math.random() * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 8 + Math.random() * 8,
    }));

// Pluie de confettis en CSS pur, pour fêter les victoires
const Confetti = ({ count = 80 }) => {
    const pieces = useMemo(() => makePieces(count), [count]);

    return (
        <div className="confetti-wrap">
            {pieces.map(p => (
                <span
                    key={p.id}
                    className="confetti"
                    style={{
                        left: `${p.left}%`,
                        background: p.color,
                        width: p.size,
                        height: p.size,
                        animationDelay: `${p.delay}s`,
                        animationDuration: `${p.duration}s`,
                    }}
                />
            ))}
        </div>
    );
};

export default Confetti;
