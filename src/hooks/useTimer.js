import { useState, useEffect, useCallback } from 'react';

export function useTimer(initialTime, isActive, onTimeout) {
    const [timeLeft, setTimeLeft] = useState(initialTime);

    useEffect(() => {
        let timer;
        if (isActive && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            onTimeout();
        }
        return () => clearInterval(timer);
    }, [isActive, timeLeft, onTimeout]);

    const resetTimer = useCallback((newTime) => {
        setTimeLeft(newTime ?? initialTime);
    }, [initialTime]);

    return { timeLeft, resetTimer };
}
