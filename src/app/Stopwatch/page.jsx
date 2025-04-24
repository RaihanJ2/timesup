"use client";
import Container from "@/app/components/Container";
import { Clock, Pause, Play, RotateCcw, X } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const Stopwatch = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [lapRecords, setLapRecords] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    if (time > 0) {
      // Add current time to lap records before resetting
      const formattedTime = formatTime();
      const timeString = `${formattedTime.hours}:${formattedTime.minutes}:${formattedTime.seconds}.${formattedTime.milliseconds}`;

      setLapRecords((prevLaps) => [
        {
          id: Date.now(),
          time: timeString,
          milliseconds: time,
        },
        ...prevLaps,
      ]);
    }

    setIsRunning(false);
    setTime(0);
  };

  const clearLapRecords = () => {
    setLapRecords([]);
  };

  const deleteLapRecord = (id) => {
    setLapRecords((prevLaps) => prevLaps.filter((lap) => lap.id !== id));
  };
  // Format time display
  const formatTime = () => {
    const hours = Math.floor(time / 3600000);
    const minutes = Math.floor((time % 3600000) / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = Math.floor((time % 1000) / 10);

    return {
      hours: hours.toString().padStart(2, "0"),
      minutes: minutes.toString().padStart(2, "0"),
      seconds: seconds.toString().padStart(2, "0"),
      milliseconds: milliseconds.toString().padStart(2, "0"),
    };
  };

  const timeDisplay = formatTime();

  return (
    <div className="flex flex-row h-full">
      <div className="w-1/4 flex flex-col items-center justify-start gap-4 bg-gray-800 rounded-lg px-4 mb-4">
        <div className="w-full flex justify-between items-center m-4">
          <h2 className="text-xl font-bold flex items-center ">
            <Clock size={20} className="mr-2" /> Lap Records
          </h2>
          {lapRecords.length > 0 && (
            <button
              className="text-sm px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
              onClick={clearLapRecords}
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
                <li
                  key={lap.id}
                  className="bg-gray-700 rounded-lg py-1 px-2 flex justify-between items-center hover:bg-gray-600 transition-colors"
                >
                  <div>
                    <span className="text-gray-400 text-sm">
                      Lap {lapRecords.length - index}
                    </span>
                    <div className="text-lg font-mono">{lap.time}</div>
                  </div>
                  <button
                    onClick={() => deleteLapRecord(lap.id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <Container className="w-3/4">
        <div className="flex flex-col items-center">
          <div className="text-6xl flex items-center justify-center">
            <div className="font-bold">{timeDisplay.hours}</div>
            <div className="font-bold">:</div>
            <div className="font-bold">{timeDisplay.minutes}</div>
            <div className="font-bold">:</div>
            <div className="font-bold">{timeDisplay.seconds}</div>
            <div className="font-bold">.</div>
            <div className="font-bold">{timeDisplay.milliseconds}</div>
          </div>
          <div className="flex items-center justify-center gap-8 py-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
              className="w-10 h-10 p-2 bg-gray-800 hover:bg-gray-400 rounded-full"
              onClick={startTimer}
              disabled={isRunning}
            >
              <Play className={isRunning ? "text-gray-500" : "text-white"} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
              className="w-10 h-10 p-2 bg-gray-800 hover:bg-gray-400 rounded-full"
              onClick={pauseTimer}
              disabled={!isRunning}
            >
              <Pause className={!isRunning ? "text-gray-500" : "text-white"} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
              className="w-10 h-10 p-2 bg-gray-800 hover:bg-gray-400 rounded-full"
              onClick={resetTimer}
            >
              <RotateCcw />
            </motion.button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Stopwatch;
