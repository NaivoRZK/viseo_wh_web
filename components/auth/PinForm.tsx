'use client';

import { useRef, useState, useCallback, KeyboardEvent, ClipboardEvent } from 'react';

interface PinFormProps {
  onSubmit: (data: { pin: string }) => void;
  error: string | null;
  loading: boolean;
}

const PIN_LENGTH = 4;

export function PinForm({ onSubmit, error, loading }: PinFormProps) {
  const [digits, setDigits] = useState<string[]>(Array(PIN_LENGTH).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const focusInput = useCallback((index: number) => {
    if (index >= 0 && index < PIN_LENGTH) {
      inputRefs.current[index]?.focus();
    }
  }, []);

  const submitPin = useCallback((pin: string) => {
    if (pin.length === PIN_LENGTH) {
      onSubmit({ pin });
    }
  }, [onSubmit]);

  const handleChange = useCallback((index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    if (!digit) return;

    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    if (index < PIN_LENGTH - 1) {
      focusInput(index + 1);
    } else {
      const pin = newDigits.join('');
      if (pin.length === PIN_LENGTH) {
        submitPin(pin);
      }
    }
  }, [digits, focusInput, submitPin]);

  const handleKeyDown = useCallback((index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      } else if (index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        focusInput(index - 1);
      }
    }
  }, [digits, focusInput]);

  const handlePaste = useCallback((e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, PIN_LENGTH);
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < PIN_LENGTH; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setDigits(newDigits);

    const nextIndex = Math.min(pasted.length, PIN_LENGTH - 1);
    focusInput(nextIndex);

    if (pasted.length === PIN_LENGTH) {
      submitPin(pasted);
    }
  }, [digits, focusInput, submitPin]);

  const handleReset = useCallback(() => {
    setDigits(Array(PIN_LENGTH).fill(''));
    focusInput(0);
  }, [focusInput]);

  return (
    <div className="space-y-6 w-full max-w-xs">
      <div className="flex items-center justify-center gap-2">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            autoFocus={index === 0}
            className="flex-1 aspect-square text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        ))}
      </div>

      {error && (
        <div className="flex items-center justify-center gap-2">
          <p className="text-sm text-red-600" role="alert">{error}</p>
          <button
            type="button"
            onClick={handleReset}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            Clear
          </button>
        </div>
      )}

      {loading && (
        <p className="text-center text-sm text-gray-500">Verifying...</p>
      )}
    </div>
  );
}
