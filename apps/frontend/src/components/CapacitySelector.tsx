"use client";

import { Minus, Plus, Users } from "lucide-react";

interface CapacitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export default function CapacitySelector({
  value,
  onChange,
  min = 1,
  max = 10,
}: CapacitySelectorProps) {
  const decrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const increment = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
        <Users className="w-4 h-4 text-secondary-500" />
        Quantidade de Pessoas (assentos)
      </label>
      <div className="flex items-center justify-between bg-neutral-100 border border-neutral-300 rounded-xl p-2 w-full max-w-xs h-14">
        <button
          type="button"
          onClick={decrement}
          disabled={value <= min}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-neutral-300 hover:bg-neutral-50 active:bg-neutral-100 text-neutral-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Diminuir quantidade de pessoas"
        >
          <Minus className="w-5 h-5" />
        </button>

        <span className="text-xl font-semibold text-neutral-900 font-mono w-12 text-center">
          {value}
        </span>

        <button
          type="button"
          onClick={increment}
          disabled={value >= max}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-neutral-300 hover:bg-neutral-50 active:bg-neutral-100 text-neutral-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Aumentar quantidade de pessoas"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
