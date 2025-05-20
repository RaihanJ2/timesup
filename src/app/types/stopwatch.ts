export interface LapRecord {
  id: number;
  time: string;
  milliseconds: number;
}

export interface FormattedTime {
  hours: string;
  minutes: string;
  seconds: string;
  milliseconds: string;
}

export interface TimerDisplayProps {
  timeDisplay: FormattedTime;
}
export interface ControlButtonsProps {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export interface LapItemProps {
  lap: LapRecord;
  index: number;
  totalLaps: number;
  onDelete: (id: number) => void;
}

export interface LapRecordsProps {
  lapRecords: LapRecord[];
  onClearAll: () => void;
  onDeleteLap: (id: number) => void;
}
