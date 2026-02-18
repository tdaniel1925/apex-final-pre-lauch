'use client';

// =============================================
// Countdown Timer Component
// Shows time remaining until launch
// =============================================

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: Date;
  size?: 'sm' | 'md' | 'lg';
}

export default function CountdownTimer({ targetDate, size = 'md' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="flex gap-4 justify-center items-center">
      <div className="text-center">
        <div className={`font-bold ${sizeClasses[size]} text-[#2B4C7E]`}>
          {timeLeft.days}
        </div>
        <div className={`${labelSizeClasses[size]} text-gray-600`}>Days</div>
      </div>
      <div className={`${sizeClasses[size]} text-gray-400`}>:</div>
      <div className="text-center">
        <div className={`font-bold ${sizeClasses[size]} text-[#2B4C7E]`}>
          {String(timeLeft.hours).padStart(2, '0')}
        </div>
        <div className={`${labelSizeClasses[size]} text-gray-600`}>Hours</div>
      </div>
      <div className={`${sizeClasses[size]} text-gray-400`}>:</div>
      <div className="text-center">
        <div className={`font-bold ${sizeClasses[size]} text-[#2B4C7E]`}>
          {String(timeLeft.minutes).padStart(2, '0')}
        </div>
        <div className={`${labelSizeClasses[size]} text-gray-600`}>Minutes</div>
      </div>
      <div className={`${sizeClasses[size]} text-gray-400`}>:</div>
      <div className="text-center">
        <div className={`font-bold ${sizeClasses[size]} text-[#2B4C7E]`}>
          {String(timeLeft.seconds).padStart(2, '0')}
        </div>
        <div className={`${labelSizeClasses[size]} text-gray-600`}>Seconds</div>
      </div>
    </div>
  );
}
