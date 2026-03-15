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
            transform: visible ? 'translateX(0)' : 'translateX(120%)',
            opacity: visible ? 1 : 0
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem 1.5rem',
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                border: '3px solid #f59e0b',
                borderRadius: '1rem',
                boxShadow: '0 10px 40px rgba(245, 158, 11, 0.4)',
                minWidth: '280px'
            }}>
                <span style={{ fontSize: '2.5rem' }}>{achievement.icon}</span>
                <div>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#92400e', fontWeight: 700 }}>Achievement débloqué !</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#78350f' }}>{achievement.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#a16207' }}>{achievement.description}</div>
                </div>
            </div>
        </div>
    );
};

export default AchievementToast;
