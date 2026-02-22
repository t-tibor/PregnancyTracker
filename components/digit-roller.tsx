"use client";

import { useCallback, useRef } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DigitRollerProps {
  value: number;
  onChange: (value: number) => void;
  unit: string;
  readonly?: boolean;
  integerDigits?: number;
  min?: number;
  max?: number;
}

export function DigitRoller({
  value,
  onChange,
  unit,
  readonly = false,
  integerDigits = 2,
  min = 0,
  max = 999.9,
}: DigitRollerProps) {
  // Split value into digits: e.g. 64.1 -> [6, 4, 1]
  const digits = getDigits(value, integerDigits);

  const handleDigitChange = useCallback(
    (index: number, direction: 1 | -1) => {
      const newDigits = [...digits];
      newDigits[index] = (newDigits[index] + direction + 10) % 10;

      const totalDigits = integerDigits + 1;
      let newValue = 0;
      for (let i = 0; i < totalDigits; i++) {
        if (i < integerDigits) {
          newValue += newDigits[i] * Math.pow(10, integerDigits - 1 - i);
        } else {
          newValue += newDigits[i] * 0.1;
        }
      }

      newValue = Math.round(newValue * 10) / 10;
      if (newValue >= min && newValue <= max) {
        onChange(newValue);
      }
    },
    [digits, integerDigits, min, max, onChange]
  );

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1">
        {digits.map((digit, index) => (
          <div key={index} className="flex items-center">
            {index === integerDigits && (
              <span className="mx-1 text-4xl font-bold text-foreground">.</span>
            )}
            <SingleDigit
              digit={digit}
              index={index}
              readonly={readonly}
              onIncrement={() => handleDigitChange(index, 1)}
              onDecrement={() => handleDigitChange(index, -1)}
            />
          </div>
        ))}
        <span className="ml-2 text-2xl font-medium text-muted-foreground">
          {unit}
        </span>
      </div>
    </div>
  );
}

interface SingleDigitProps {
  digit: number;
  index: number;
  readonly: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
}

function SingleDigit({
  digit,
  readonly,
  onIncrement,
  onDecrement,
}: SingleDigitProps) {
  const touchStartY = useRef<number | null>(null);
  const hasSwiped = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      touchStartY.current = e.touches[0].clientY;
      hasSwiped.current = false;
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (readonly || touchStartY.current === null || hasSwiped.current) return;
      const diff = touchStartY.current - e.touches[0].clientY;
      if (Math.abs(diff) > 30) {
        if (diff > 0) {
          onIncrement();
        } else {
          onDecrement();
        }
        touchStartY.current = e.touches[0].clientY;
        hasSwiped.current = true;
      }
    },
    [readonly, onIncrement, onDecrement]
  );

  const handleTouchEnd = useCallback(() => {
    touchStartY.current = null;
    hasSwiped.current = false;
  }, []);

  return (
    <div
      className="flex flex-col items-center select-none"
      onTouchStart={!readonly ? handleTouchStart : undefined}
      onTouchMove={!readonly ? handleTouchMove : undefined}
      onTouchEnd={!readonly ? handleTouchEnd : undefined}
    >
      {/* Up arrow */}
      <button
        type="button"
        onClick={onIncrement}
        className={cn(
          "flex h-8 w-12 items-center justify-center rounded-t-md transition-colors",
          readonly
            ? "invisible"
            : "text-primary hover:bg-primary/10 cursor-pointer"
        )}
        tabIndex={readonly ? -1 : 0}
        aria-label="Increment digit"
      >
        <ChevronUp className="h-5 w-5" />
      </button>

      {/* Digit display */}
      <div
        className={cn(
          "flex h-16 w-12 items-center justify-center rounded-md text-4xl font-bold transition-colors",
          readonly
            ? "bg-muted/50 text-foreground"
            : "bg-primary/5 text-foreground border-2 border-primary/20"
        )}
      >
        {digit}
      </div>

      {/* Down arrow */}
      <button
        type="button"
        onClick={onDecrement}
        className={cn(
          "flex h-8 w-12 items-center justify-center rounded-b-md transition-colors",
          readonly
            ? "invisible"
            : "text-primary hover:bg-primary/10 cursor-pointer"
        )}
        tabIndex={readonly ? -1 : 0}
        aria-label="Decrement digit"
      >
        <ChevronDown className="h-5 w-5" />
      </button>
    </div>
  );
}

function getDigits(value: number, integerDigits: number): number[] {
  const rounded = Math.round(value * 10) / 10;
  const intPart = Math.floor(rounded);
  const decPart = Math.round((rounded - intPart) * 10);

  const digits: number[] = [];

  // Integer digits (left-padded with 0)
  const intStr = String(intPart).padStart(integerDigits, "0");
  for (let i = 0; i < integerDigits; i++) {
    digits.push(parseInt(intStr[i], 10));
  }

  // Decimal digit
  digits.push(decPart);

  return digits;
}
