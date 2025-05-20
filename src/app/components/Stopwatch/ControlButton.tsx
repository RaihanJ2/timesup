import { memo } from "react";
import { ControlButtonsProps } from "../../types";
import { motion } from "framer-motion";
import { Pause, Play, RotateCcw } from "lucide-react";

export const ControlButtons = memo(
  ({ isRunning, onStart, onPause, onReset }: ControlButtonsProps) => {
    return (
      <div className="flex items-center justify-center gap-8 py-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          className="w-10 h-10 p-2 bg-gray-800 hover:bg-gray-400 rounded-full"
          onClick={onStart}
          disabled={isRunning}
        >
          <Play className={isRunning ? "text-gray-500" : "text-white"} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          className="w-10 h-10 p-2 bg-gray-800 hover:bg-gray-400 rounded-full"
          onClick={onPause}
          disabled={!isRunning}
        >
          <Pause className={!isRunning ? "text-gray-500" : "text-white"} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          className="w-10 h-10 p-2 bg-gray-800 hover:bg-gray-400 rounded-full"
          onClick={onReset}
        >
          <RotateCcw />
        </motion.button>
      </div>
    );
  }
);

ControlButtons.displayName = "ControlButtons";
