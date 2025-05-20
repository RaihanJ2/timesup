"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { LapRecord } from "../types";
import { formatTimeValue } from "../components/Stopwatch/utils";
import { LapRecords } from "../components/Stopwatch/LapRecords";
import Container from "../components/Container";
import { ControlButtons } from "../components/Stopwatch/ControlButton";
import { TimerDisplay } from "../components/Stopwatch/TimerDisplay";

const Stopwatch: React.FC = () => {
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [lapRecords, setLapRecords] = useState<LapRecord[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Effect for timer
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

  // Memoized handlers
  const startTimer = useCallback((): void => {
    setIsRunning(true);
  }, []);

  const pauseTimer = useCallback((): void => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback((): void => {
    if (time > 0) {
      // Add current time to lap records before resetting
      const formattedTime = formatTimeValue(time);
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
  }, [time]);

  const clearLapRecords = useCallback((): void => {
    setLapRecords([]);
  }, []);

  const deleteLapRecord = useCallback((id: number): void => {
    setLapRecords((prevLaps) => prevLaps.filter((lap) => lap.id !== id));
  }, []);

  // Memoized formatted time
  const timeDisplay = formatTimeValue(time);

  return (
    <div className="flex flex-row h-full">
      <LapRecords
        lapRecords={lapRecords}
        onClearAll={clearLapRecords}
        onDeleteLap={deleteLapRecord}
      />

      <Container className="w-3/4">
        <div className="flex flex-col items-center">
          <TimerDisplay timeDisplay={timeDisplay} />

          <ControlButtons
            isRunning={isRunning}
            onStart={startTimer}
            onPause={pauseTimer}
            onReset={resetTimer}
          />
        </div>
      </Container>
    </div>
  );
};

export default Stopwatch;
