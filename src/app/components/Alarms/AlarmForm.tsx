import React from "react";
import { Alarm } from "../../types";
import { Plus } from "lucide-react";
import AlarmCarousel from "./AlarmCarousel";
import DaySelector from "./DaySelector";
import { generateOptions } from "../../Alarm/utils";

interface AlarmFormProps {
  newAlarm: Omit<Alarm, "_id" | "isSet">;
  onCancel: () => void;
  onAddAlarm: () => void;
  onCarouselChange: (
    type: keyof Omit<Alarm, "_id" | "isSet" | "name">,
    value: string
  ) => void;
  onNameChange: (name: string) => void;
  onDaysChange: (days: number[]) => void;
}

export default function AlarmForm({
  newAlarm,
  onCancel,
  onAddAlarm,
  onCarouselChange,
  onNameChange,
  onDaysChange,
}: AlarmFormProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full max-w-md">
      <div className="w-full">
        <label htmlFor="alarm-name" className="block text-sm font-medium mb-1">
          Alarm Name
        </label>
        <input
          id="alarm-name"
          type="text"
          value={newAlarm.name}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full p-2 border rounded bg-gray-700 text-white"
          placeholder="Wake up, Workout, etc."
        />
      </div>

      <div className="flex items-center justify-center gap-4 p-4 rounded-lg w-full">
        <AlarmCarousel
          options={generateOptions(1, 12)}
          selected={newAlarm.hours}
          onChange={(value) => onCarouselChange("hours", value)}
        />
        <div className="font-bold text-6xl pb-3">:</div>

        <AlarmCarousel
          options={generateOptions(0, 59)}
          selected={newAlarm.minutes}
          onChange={(value) => onCarouselChange("minutes", value)}
        />
        <div className="font-bold text-6xl pb-3 text-gray-900">&nbsp;</div>

        <AlarmCarousel
          options={["AM", "PM"]}
          selected={newAlarm.ampm}
          onChange={(value) => onCarouselChange("ampm", value)}
        />
      </div>

      <DaySelector
        selectedDays={newAlarm.days}
        onChange={(days) => onDaysChange(days)}
      />

      <div className="flex gap-4 mt-4">
        <button
          onClick={onCancel}
          className="flex items-center justify-center cursor-pointer active:scale-95 hover:scale-105 bg-gray-500 text-white px-6 py-3 rounded-lg m-2 transition duration-100 ease-in font-semibold"
        >
          Cancel
        </button>
        <button
          onClick={onAddAlarm}
          className="flex items-center justify-center cursor-pointer active:scale-95 hover:scale-105 bg-blue-500 text-white px-6 py-3 rounded-lg m-2 transition duration-100 ease-in font-semibold"
          aria-label="Add new alarm"
        >
          <Plus className="mr-2" /> Add Alarm
        </button>
      </div>
    </div>
  );
}
