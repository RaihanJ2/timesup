import { memo } from "react";
import { TimerDisplayProps } from "../../types";

export const TimerDisplay = memo(({ timeDisplay }: TimerDisplayProps) => {
  return (
    <div className="text-6xl flex items-center justify-center">
      <div className="font-bold">{timeDisplay.hours}</div>
      <div className="font-bold">:</div>
      <div className="font-bold">{timeDisplay.minutes}</div>
      <div className="font-bold">:</div>
      <div className="font-bold">{timeDisplay.seconds}</div>
      <div className="font-bold">.</div>
      <div className="font-bold">{timeDisplay.milliseconds}</div>
    </div>
  );
});

TimerDisplay.displayName = "TimerDisplay";
