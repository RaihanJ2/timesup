import { Alarm, DAYS_OF_WEEK } from "../types";

export const formatDisplayTime = (date: Date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  return `${formattedHours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")} ${ampm}`;
};
export const calculateTimeUntilAlarm = (alarm: Alarm) => {
  const now = new Date();
  let alarmHour = parseInt(alarm.hours, 10);
  if (alarm.ampm === "PM" && alarmHour !== 12) alarmHour += 12;
  if (alarm.ampm === "AM" && alarmHour === 12) alarmHour = 0;

  const alarmMinute = parseInt(alarm.minutes, 10);

  // Get current day index (0-6)
  const currentDayIndex = now.getDay();

  // If no days are selected or today is selected
  if (
    !alarm.days ||
    alarm.days.length === 0 ||
    alarm.days.includes(currentDayIndex)
  ) {
    const alarmTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      alarmHour,
      alarmMinute,
      0,
      0
    );

    // If the alarm time is in the past today, set it for today/next occurrence
    if (alarmTime < now) {
      if (!alarm.days || alarm.days.length === 0) {
        // Daily alarm - set for tomorrow
        alarmTime.setDate(alarmTime.getDate() + 1);
      } else {
        // Find the next day the alarm should trigger
        let daysToAdd = 1;
        let nextDayIndex = (currentDayIndex + daysToAdd) % 7;

        while (!alarm.days.includes(nextDayIndex) && daysToAdd < 7) {
          daysToAdd++;
          nextDayIndex = (currentDayIndex + daysToAdd) % 7;
        }

        alarmTime.setDate(alarmTime.getDate() + daysToAdd);
      }
    }

    const diffMs = Number(alarmTime) - Number(now);
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHrs = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays}d ${diffHrs}h`;
    } else if (diffHrs > 0) {
      return `${diffHrs}h ${diffMins}m`;
    }
    return `${diffMins}m`;
  } else {
    // Find the next day the alarm should trigger
    let daysToAdd = 1;
    let nextDayIndex = (currentDayIndex + daysToAdd) % 7;

    while (!alarm.days.includes(nextDayIndex) && daysToAdd < 7) {
      daysToAdd++;
      nextDayIndex = (currentDayIndex + daysToAdd) % 7;
    }

    const alarmTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + daysToAdd,
      alarmHour,
      alarmMinute,
      0,
      0
    );

    const diffMs = Number(alarmTime) - Number(now);
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHrs = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );

    if (diffDays > 0) {
      return `${diffDays}d ${diffHrs}h`;
    }
    return `${diffHrs}h`;
  }
};

export const formatSelectedDays = (days: number[]) => {
  if (!days || days.length === 0) return "Every day";
  if (days.length === 7) return "Every day";
  if (days.length === 5 && [1, 2, 3, 4, 5].every((day) => days.includes(day)))
    return "Weekdays";
  if (days.length === 2 && [0, 6].every((day) => days.includes(day)))
    return "Weekends";

  return days.map((day) => DAYS_OF_WEEK[day]).join(", ");
};

export const generateOptions = (
  start: number,
  end: number,
  step: number = 1
) => {
  return Array.from({ length: (end - start) / step + 1 }, (_, i) =>
    String(start + i * step).padStart(2, "0")
  );
};

export const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
