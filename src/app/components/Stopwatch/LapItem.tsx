import { memo } from "react";
import { LapItemProps } from "../../types";
import { X } from "lucide-react";

export const LapItem = memo(
  ({ lap, index, totalLaps, onDelete }: LapItemProps) => {
    return (
      <li className="bg-gray-700 rounded-lg py-1 px-2 flex justify-between items-center hover:bg-gray-600 transition-colors">
        <div>
          <span className="text-gray-400 text-sm">Lap {totalLaps - index}</span>
          <div className="text-lg font-mono">{lap.time}</div>
        </div>
        <button
          onClick={() => onDelete(lap.id)}
          className="p-1 text-gray-400 hover:text-red-500"
        >
          <X size={16} />
        </button>
      </li>
    );
  }
);

LapItem.displayName = "LapItem";
