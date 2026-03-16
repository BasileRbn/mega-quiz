import React, { useEffect, useState } from 'react';

const AchievementToast = ({ achievement, onDone }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setTimeout(() => setVisible(true), 100);
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onDone, 500);
        }, 3500);
        return () => clearTimeout(timer);
    }, [onDone]);

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 99999,
            transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transform: visible ? 'translateX(0) scale(1)' : 'translateX(120%) scale(0.8)',
            opacity: visible ? 1 : 0,
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem 1.5rem',
                background: 'linear-gradient(145deg, rgba(17, 24, 39, 0.96), rgba(26, 32, 53, 0.98))',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                borderRadius: '1.25rem',
                boxShadow: '0 15px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(251, 191, 36, 0.15)',
                minWidth: '280px',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Glow effect top */}
                <div style={{
                    position: 'absolute', top: 0, left: '15%', right: '15%', height: '2px',
                    background: 'linear-gradient(90deg, transparent, #fbbf24, transparent)',
                }} />
                <span style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 2px 8px rgba(251, 191, 36, 0.4))' }}>{achievement.icon}</span>
                <div>
                    <div style={{
                        fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '2px',
                        color: '#fbbf24', fontWeight: 700,
                    }}>Achievement debloque !</div>
                    <div style={{
                        fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9',
                        fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif",
                    }}>{achievement.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{achievement.description}</div>
                </div>
            </div>
        </div>
    );
};

export default AchievementToast;
