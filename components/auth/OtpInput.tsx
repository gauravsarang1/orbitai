'use client';

import React, { useRef, useEffect } from 'react';

interface OtpInputProps {
  value: string;
  onChange: (otp: string) => void;
  disabled?: boolean;
  length?: number;
}

export function OtpInput({ value, onChange, disabled = false, length = 6 }: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Array of single-character strings
  const otpDigits = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    // Auto focus first input on mount if empty
    if (!value && inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const rawVal = e.target.value;
    const digitsOnly = rawVal.replace(/\D/g, '');

    if (!digitsOnly) {
      const newDigits = [...otpDigits];
      newDigits[index] = '';
      onChange(newDigits.join(''));
      return;
    }

    // If multiple digits typed or pasted into single box
    if (digitsOnly.length > 1) {
      const sliced = digitsOnly.slice(0, length);
      onChange(sliced);
      const nextFocusIndex = Math.min(sliced.length, length - 1);
      inputsRef.current[nextFocusIndex]?.focus();
      return;
    }

    // Single digit typed
    const val = digitsOnly;
    const newDigits = [...otpDigits];
    newDigits[index] = val;
    const combined = newDigits.join('');
    onChange(combined);

    // Auto-advance to next input if digit entered
    if (val && index < length - 1 && inputsRef.current[index + 1]) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0 && inputsRef.current[index - 1]) {
        // Move back to previous box on backspace if current is empty
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (!/^\d+$/.test(pasteData)) return;

    const digits = pasteData.slice(0, length);
    onChange(digits);

    // Focus appropriate input
    const targetIndex = Math.min(digits.length, length - 1);
    inputsRef.current[targetIndex]?.focus();
  };

  return (
    <div className="flex items-center justify-between gap-2 my-4">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          disabled={disabled}
          value={otpDigits[index] || ''}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          onChange={(e) => handleChange(e, index)}
          onFocus={(e) => e.target.select()}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="w-12 h-14 text-center text-xl font-bold font-mono bg-slate-900 border-2 border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 transition-all shadow-inner"
          aria-label={`Digit ${index + 1} of verification code`}
        />
      ))}
    </div>
  );
}
