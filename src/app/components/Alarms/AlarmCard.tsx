import { Check, X } from "lucide-react";
import { Alarm } from "../../types";
import { calculateTimeUntilAlarm, formatSelectedDays } from "../../Alarm/utils";

export default function AlarmCard({
  alarm,
  index,
  onToggle,
  onRemove,
}: {
  alarm: Alarm;
  index: number;
  onToggle: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-col my-2 p-3 bg-gray-900 shadow-lg shadow-gray-800 rounded-lg hover:bg-gray-800 duration-200">
      <div className="flex justify-between items-center">
        <div className="text-lg font-semibold">
          {alarm.name || `Alarm ${index + 1}`}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onToggle}
            className={`p-1 rounded-full ${
              alarm.isSet ? "text-green-500" : "text-gray-400"
            }`}
            aria-label={alarm.isSet ? "Disable alarm" : "Enable alarm"}
          >
            <Check size={16} />
          </button>
          <button
            onClick={onRemove}
            className="p-1 text-gray-400 hover:text-red-500"
            aria-label="Remove alarm"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="flex justify-between items-center mt-1">
        <div className="text-sm">
          {alarm.hours}:{alarm.minutes} {alarm.ampm}
        </div>
        <div className="text-xs text-gray-400">
          {calculateTimeUntilAlarm(alarm)} remaining
        </div>
      </div>
      <div className="text-xs text-gray-400 mt-1">
        {formatSelectedDays(alarm.days)}
      </div>
    </div>
  );
}
