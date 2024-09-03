import { useState, useEffect, useCallback, useRef } from 'react';

export const useSendCode = (initialCountdownSeconds: number, verificationCode: string, setVerificationCode: (code: string) => void) => {
    const [countdownSeconds, setCountdownSeconds] = useState(initialCountdownSeconds);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const startCountdown = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
            setCountdownSeconds(prevCountdownSeconds => {
                if (prevCountdownSeconds <= 1) {
                    clearInterval(intervalRef.current as NodeJS.Timeout);
                    intervalRef.current = null;
                    setVerificationCode(''); // Reset verification code
                    return 0;
                }
                return prevCountdownSeconds - 1;
            });
        }, 1000);
    }, [setVerificationCode]);

    const resentCode = useCallback(() => {
        setCountdownSeconds(initialCountdownSeconds);
        startCountdown();
    }, [initialCountdownSeconds, startCountdown]);

    useEffect(() => {
        if (verificationCode !== '' && verificationCode !== null && verificationCode !== undefined) {
            console.log('Verification code:', verificationCode);
            resentCode();
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [verificationCode, resentCode]);

    return { countdownSeconds };
};
