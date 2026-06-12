"use client";

import { Clock } from "lucide-react";

interface TimeSlotCardProps {
  time: string;
  selected?: boolean;
  onClick?: () => void;
  remainingCapacity?: number;
}

export default function TimeSlotCard({
  time,
  selected = false,
  onClick,
  remainingCapacity,
}: TimeSlotCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 cursor-pointer text-center w-full min-h-[72px] shadow-sm select-none
        \${
          selected
            ? "border-primary-500 bg-primary-50 text-primary-700 shadow-md ring-1 ring-primary-500/30 scale-[1.02]"
            : "border-primary-300 hover:border-primary-500 hover:bg-primary-50/20 text-neutral-900 bg-white"
        }
      `}
    >
      <div className="flex items-center gap-1 font-semibold text-sm">
        <Clock className={`w-3.5 h-3.5 \${selected ? "text-primary-500" : "text-neutral-500"}`} />
        <span>{time}</span>
      </div>
      
      {remainingCapacity !== undefined && (
        <span className={`text-[10px] mt-1 font-medium font-mono \${selected ? "text-primary-600" : "text-neutral-500"}`}>
          {remainingCapacity} assentos
        </span>
      )}
    </button>
  );
}
