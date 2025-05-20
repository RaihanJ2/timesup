export interface IAlarm extends Document {
  hours: string;
  minutes: string;
  ampm: "AM" | "PM";
  name: string;
  days: number[];
  isSet: boolean;
  userId: string;
  createdAt: Date;
}

export type Alarm = {
  _id?: string;
  hours: string;
  minutes: string;
  ampm: "AM" | "PM";
  name: string;
  days: number[];
  isSet: boolean;
};

export type CarouselProps = {
  options: string[];
  selected: string;
  onChange: (value: string) => void;
};

export type DaySelectorProps = {
  selectedDays: number[];
  onChange: (days: number[]) => void;
};

export const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
