import { Clock } from "lucide-react";
import { memo } from "react";
import { LapRecordsProps } from "../../types";
import { LapItem } from "./LapItem";

export const LapRecords = memo(
  ({ lapRecords, onClearAll, onDeleteLap }: LapRecordsProps) => {
    return (
      <div className="w-1/4 flex flex-col items-center justify-start gap-4 bg-gray-800 rounded-lg px-4 mb-4">
        <div className="w-full flex justify-between items-center m-4">
          <h2 className="text-xl font-bold flex items-center">
            <Clock size={20} className="mr-2" /> Lap Records
          </h2>
          {lapRecords.length > 0 && (
            <button
              className="text-sm px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
              onClick={onClearAll}
            >
              Clear All
            </button>
          )}
        </div>

        <div className="flex-1 w-full overflow-y-auto max-h-[60vh] pr-2 rounded">
          {lapRecords.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              Reset the timer to record a lap time
            </div>
          ) : (
            <ul className="space-y-2">
              {lapRecords.map((lap, index) => (
                <LapItem
                  key={lap.id}
                  lap={lap}
                  index={index}
                  totalLaps={lapRecords.length}
                  onDelete={onDeleteLap}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }
);

LapRecords.displayName = "LapRecords";
