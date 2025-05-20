import React from "react";
import { DAYS_OF_WEEK } from "../../types";

interface DaySelectorProps {
  selectedDays: number[];
  onChange: (days: number[]) => void;
}

export default function DaySelector({
  selectedDays,
  onChange,
}: DaySelectorProps) {
  const toggleDay = (dayIndex: number) => {
    const newSelectedDays = selectedDays.includes(dayIndex)
      ? selectedDays.filter((d) => d !== dayIndex)
      : [...selectedDays, dayIndex];
    onChange(newSelectedDays);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-2">Repeat on days</label>
      <div className="flex justify-between">
        {DAYS_OF_WEEK.map((day, index) => (
          <button
            key={day}
            onClick={() => toggleDay(index)}
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              selectedDays.includes(index)
                ? "bg-blue-500 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}
