"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  AlarmClock,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Check,
} from "lucide-react";
import Container from "@/app/components/Container";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";

// Utility functions
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const generateOptions = (start, end, step = 1) => {
  return Array.from({ length: (end - start) / step + 1 }, (_, i) =>
    String(start + i * step).padStart(2, "0")
  );
};

const formatDisplayTime = (date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  return `${formattedHours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")} ${ampm}`;
};

// Days of the week array
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const calculateTimeUntilAlarm = (alarm) => {
  const now = new Date();
  let alarmHour = parseInt(alarm.hours);
  if (alarm.ampm === "PM" && alarmHour !== 12) alarmHour += 12;
  if (alarm.ampm === "AM" && alarmHour === 12) alarmHour = 0;

  const alarmMinute = parseInt(alarm.minutes);

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

    const diffMs = alarmTime - now;
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

    const diffMs = alarmTime - now;
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

// Carousel Component (same as before)
const Carousel = React.memo(({ options, selected, onChange }) => {
  const carouselRef = useRef(null);
  const isScrolling = useRef(false);

  const scrollToSelected = useCallback(() => {
    if (carouselRef.current && !isScrolling.current) {
      const selectedElement = carouselRef.current.querySelector(
        `[data-value="${selected}"]`
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [selected]);

  useEffect(() => {
    scrollToSelected();
  }, [selected, scrollToSelected]);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleScroll = () => {
      const options = carousel.querySelectorAll("[data-value]");
      let closestOption = null;
      let closestDistance = Infinity;

      const carouselRect = carousel.getBoundingClientRect();
      const carouselCenter = carouselRect.top + carouselRect.height / 2;

      options.forEach((option) => {
        const rect = option.getBoundingClientRect();
        const optionCenter = rect.top + rect.height / 2;
        const distance = Math.abs(optionCenter - carouselCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestOption = option;
        }
      });

      if (closestOption && closestOption.dataset.value !== selected) {
        onChange(closestOption.dataset.value);
      }
    };

    const handleScrollStart = () => {
      isScrolling.current = true;
    };

    const handleScrollEnd = debounce(() => {
      isScrolling.current = false;
      handleScroll();
    }, 150);

    carousel.addEventListener("touchstart", handleScrollStart);
    carousel.addEventListener("mousedown", handleScrollStart);
    carousel.addEventListener("scroll", handleScrollEnd);

    return () => {
      carousel.removeEventListener("touchstart", handleScrollStart);
      carousel.removeEventListener("mousedown", handleScrollStart);
      carousel.removeEventListener("scroll", handleScrollEnd);
    };
  }, [selected, onChange]);

  const handleUpClick = () => {
    const currentIndex = options.indexOf(selected);
    const newIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
    onChange(options[newIndex]);
  };

  const handleDownClick = () => {
    const currentIndex = options.indexOf(selected);
    const newIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
    onChange(options[newIndex]);
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleUpClick}
        className="cursor-pointer rounded active:scale-95 border w-full p-1 h-8 flex items-center justify-center"
        aria-label="Scroll up"
      >
        <ChevronUp />
      </button>

      <div
        ref={carouselRef}
        className="flex flex-col items-center overflow-y-auto h-20 scroll-smooth hide-scrollbar snap-y snap-mandatory"
        style={{ scrollBehavior: "smooth" }}
      >
        <div className="h-8 invisible" />
        {options.map((option) => (
          <div
            key={option}
            data-value={option}
            className={`p-2 text-6xl font-bold snap-center ${
              option === selected ? "text-white rounded-lg" : "text-gray-700"
            }`}
            onClick={() => onChange(option)}
          >
            {option}
          </div>
        ))}
        <div className="h-8 invisible" />
      </div>

      <button
        onClick={handleDownClick}
        className="cursor-pointer active:scale-95 rounded border w-full p-1 h-8 flex items-center justify-center"
        aria-label="Scroll down"
      >
        <ChevronDown />
      </button>
    </div>
  );
});

// Day Selector Component
const DaySelector = ({ selectedDays, onChange }) => {
  const toggleDay = (dayIndex) => {
    const newSelectedDays = selectedDays.includes(dayIndex)
      ? selectedDays.filter((d) => d !== dayIndex)
      : [...selectedDays, dayIndex];
    onChange(newSelectedDays);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-2">Repeat on days</label>
      <div className="flex justify-between">
        {DAYS_OF_WEEK.map((day, index) => (
          <button
            key={day}
            onClick={() => toggleDay(index)}
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              selectedDays.includes(index)
                ? "bg-blue-500 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
};

// Main Alarm Component
const Alarm = () => {
  const [currentTime, setCurrentTime] = useState("00:00 AM");
  const [alarms, setAlarms] = useState([]);
  const [isAddingAlarm, setIsAddingAlarm] = useState(false);
  const [newAlarm, setNewAlarm] = useState({
    hours: "12",
    minutes: "00",
    ampm: "AM",
    name: "",
    days: [], // Empty array means every day
  });
  const [activeAlarmIndex, setActiveAlarmIndex] = useState(null);
  const alarmAudioRef = useRef(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { data: session, status } = useSession();
  const router = useRouter();
  const localStorageKey = "localAlarms";

  const isAuthenticated = status === "authenticated";

  const enableAudio = () => {
    // Create and immediately pause audio to satisfy browser requirements
    const audio = new Audio("/alarm-sound.mp4");
    audio.volume = 0.5;
    audio
      .play()
      .then(() => {
        audio.pause();
        setAudioEnabled(true);
      })
      .catch((e) => console.log("Audio permission request failed:", e));
  };

  // Load alarms - either from API or localStorage
  useEffect(() => {
    const loadAlarms = async () => {
      setIsLoading(true);

      if (isAuthenticated) {
        // If logged in, try to fetch from API
        try {
          const res = await axios.get("/api/alarms");
          if (res.data && res.data.alarms) {
            setAlarms(res.data.alarms);
          }
        } catch (error) {
          console.error("Error fetching alarms:", error);
          // Fall back to local storage if API fails
          loadFromLocalStorage();
        }
      } else {
        // Not logged in, use localStorage
        loadFromLocalStorage();
      }

      setIsLoading(false);
    };

    const loadFromLocalStorage = () => {
      try {
        const savedAlarms = localStorage.getItem(localStorageKey);
        if (savedAlarms) {
          setAlarms(JSON.parse(savedAlarms));
        }
      } catch (error) {
        console.error("Error loading alarms from localStorage:", error);
      }
    };

    loadAlarms();
  }, [status, isAuthenticated]);

  // Save alarms to localStorage when they change
  useEffect(() => {
    if (!isLoading && alarms.length > 0) {
      localStorage.setItem(localStorageKey, JSON.stringify(alarms));
    }
  }, [alarms, isLoading]);

  // Time update and alarm checking
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(formatDisplayTime(now));

      alarms.forEach((alarm, index) => {
        if (alarm.isSet && shouldTriggerAlarm(now, alarm)) {
          triggerAlarm(index);
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [alarms]);

  // Audio setup
  useEffect(() => {
    alarmAudioRef.current = new Audio("/alarm-sound.mp4");
    alarmAudioRef.current.loop = true;

    return () => {
      alarmAudioRef.current?.pause();
    };
  }, []);

  const shouldTriggerAlarm = (now, alarm) => {
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDay = now.getDay(); // 0-6, Sunday is 0

    let alarmHour = parseInt(alarm.hours);
    if (alarm.ampm === "PM" && alarmHour !== 12) alarmHour += 12;
    if (alarm.ampm === "AM" && alarmHour === 12) alarmHour = 0;

    const alarmMinute = parseInt(alarm.minutes);

    // If days array is empty, alarm triggers every day
    // Otherwise, check if today's day is in the alarm's days array
    const shouldTriggerToday =
      alarm.days.length === 0 || alarm.days.includes(currentDay);

    return (
      shouldTriggerToday &&
      currentHour === alarmHour &&
      currentMinute === alarmMinute &&
      now.getSeconds() === 0
    );
  };

  const triggerAlarm = async (index) => {
    setActiveAlarmIndex(index);

    if (!audioEnabled) {
      // Show visual alert if audio isn't enabled
      alert("ALARM! Please enable audio for sound notifications");
      return;
    }

    try {
      // Create new audio instance each time to work around browser restrictions
      alarmAudioRef.current = new Audio("/alarm-sound.mp4");
      alarmAudioRef.current.loop = true;
      alarmAudioRef.current.volume = 0.5;
      await alarmAudioRef.current.play();
    } catch (err) {
      console.error("Failed to play alarm sound:", err);
      alert("ALARM! (Sound blocked by browser)");
    }
  };

  const stopAlarm = async (index) => {
    if (alarmAudioRef.current) {
      alarmAudioRef.current.pause();
      alarmAudioRef.current.currentTime = 0;
    }
    setActiveAlarmIndex(null);

    try {
      const alarm = alarms[index];

      if (isAuthenticated && alarm._id) {
        // Update in database if logged in and alarm has an ID
        await axios.put(`/api/alarms/${alarm._id}`, { ...alarm, isSet: false });
      }

      // Update local state
      setAlarms((prev) =>
        prev.map((a, i) => (i === index ? { ...a, isSet: false } : a))
      );
    } catch (error) {
      console.error("Error updating alarm:", error);
    }
  };

  const handleAddAlarm = async () => {
    if (!newAlarm.name.trim()) {
      alert("Please give your alarm a name");
      return;
    }

    const alarmToAdd = { ...newAlarm, isSet: true };

    if (isAuthenticated) {
      // If logged in, save to database
      try {
        const res = await axios.post("/api/alarms", alarmToAdd);
        if (res.data && res.data.alarm) {
          setAlarms((prev) => [...prev, res.data.alarm]);
        }
      } catch (error) {
        console.error("Error adding alarm to database:", error);
        // Fall back to local storage
        const newAlarmWithId = { ...alarmToAdd, _id: Date.now().toString() };
        setAlarms((prev) => [...prev, newAlarmWithId]);
      }
    } else {
      // Not logged in, just add to local state with temporary ID
      const newAlarmWithId = { ...alarmToAdd, _id: Date.now().toString() };
      setAlarms((prev) => [...prev, newAlarmWithId]);
    }

    // Reset form
    setNewAlarm({
      hours: "12",
      minutes: "00",
      ampm: "AM",
      name: "",
      days: [],
    });
    setIsAddingAlarm(false);
  };

  const handleRemoveAlarm = async (index) => {
    if (activeAlarmIndex === index) {
      stopAlarm(index);
    }

    const alarm = alarms[index];

    if (isAuthenticated && alarm._id) {
      // If logged in and alarm has an ID, delete from database
      try {
        await axios.delete(`/api/alarms/${alarm._id}`);
      } catch (error) {
        console.error("Error removing alarm from database:", error);
      }
    }

    // Remove from local state
    setAlarms((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToggleAlarm = async (index) => {
    const alarm = alarms[index];
    const updatedAlarm = { ...alarm, isSet: !alarm.isSet };

    if (isAuthenticated && alarm._id) {
      // If logged in and alarm has ID, update in database
      try {
        await axios.put(`/api/alarms/${alarm._id}`, updatedAlarm);
      } catch (error) {
        console.error("Error toggling alarm in database:", error);
      }
    }

    // Update local state
    setAlarms((prev) => prev.map((a, i) => (i === index ? updatedAlarm : a)));
  };

  const handleCarouselChange = (type, value) => {
    setNewAlarm((prev) => ({ ...prev, [type]: value }));
  };

  const formatSelectedDays = (days) => {
    if (!days || days.length === 0) return "Every day";
    if (days.length === 7) return "Every day";
    if (days.length === 5 && [1, 2, 3, 4, 5].every((day) => days.includes(day)))
      return "Weekdays";
    if (days.length === 2 && [0, 6].every((day) => days.includes(day)))
      return "Weekends";

    return days.map((day) => DAYS_OF_WEEK[day]).join(", ");
  };

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    await signIn("google", { callbackUrl: "/" });
  };
  return (
    <div className="flex flex-row">
      {!audioEnabled && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md">
            <h2 className="text-xl font-bold mb-4">Enable Alarm Sounds</h2>
            <p className="mb-4">
              For the best experience, please enable audio notifications. Your
              browser requires permission to play sounds.
            </p>
            <button
              onClick={enableAudio}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              Enable Alarm Sounds
            </button>
          </div>
        </div>
      )}
      <div className="w-1/4 flex flex-col items-center justify-start gap-4 bg-gray-800 rounded-lg px-4 mb-4">
        <div className="w-full flex justify-between items-center m-4">
          <h2 className="text-xl font-bold flex items-center ">
            <AlarmClock size={20} className="mr-2" /> Active Alarms
          </h2>
          {!isAuthenticated && (
            <div className="text-xs text-blue-400">
              <button onClick={handleGoogleSignIn} className="hover:underline">
                Login to sync
              </button>
            </div>
          )}
        </div>
        <div className="flex-1 flex-col w-full overflow-y-auto max-h-[60vh] pr-2 rounded">
          {isLoading ? (
            <div className="text-center text-gray-400 py-4">
              Loading alarms...
            </div>
          ) : alarms.length === 0 ? (
            <div className="text-center text-gray-400 py-4">
              No alarms yet. Create one to get started!
            </div>
          ) : (
            alarms.map((alarm, index) => (
              <div
                key={
                  alarm._id ||
                  `${alarm.hours}-${alarm.minutes}-${alarm.ampm}-${index}`
                }
                className="flex flex-col my-2 p-3 bg-gray-900 shadow-lg shadow-gray-800 rounded-lg hover:bg-gray-800 duration-200"
              >
                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold">
                    {alarm.name || `Alarm ${index + 1}`}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleAlarm(index)}
                      className={`p-1 rounded-full ${
                        alarm.isSet ? "text-green-500" : "text-gray-400"
                      }`}
                      aria-label={
                        alarm.isSet ? "Disable alarm" : "Enable alarm"
                      }
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => handleRemoveAlarm(index)}
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
            ))
          )}
        </div>
      </div>
      <Container className="w-3/4 h-11/12">
        <div className="flex flex-col items-center justify-center w-full">
          <h1 className="text-4xl font-bold mb-4 text-center">{currentTime}</h1>

          {isAddingAlarm ? (
            <div className="flex flex-col items-center justify-center gap-4 w-full max-w-md">
              <div className="w-full">
                <label
                  htmlFor="alarm-name"
                  className="block text-sm font-medium mb-1"
                >
                  Alarm Name
                </label>
                <input
                  id="alarm-name"
                  type="text"
                  value={newAlarm.name}
                  onChange={(e) =>
                    setNewAlarm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full p-2 border rounded bg-gray-700 text-white"
                  placeholder="Wake up, Workout, etc."
                />
              </div>

              <div className="flex items-center justify-center gap-4 p-4 rounded-lg w-full">
                <Carousel
                  options={generateOptions(1, 12)}
                  selected={newAlarm.hours}
                  onChange={(value) => handleCarouselChange("hours", value)}
                />
                <div className="font-bold text-6xl pb-3">:</div>

                <Carousel
                  options={generateOptions(0, 59)}
                  selected={newAlarm.minutes}
                  onChange={(value) => handleCarouselChange("minutes", value)}
                />
                <div className="font-bold text-6xl pb-3 text-gray-900">
                  &nbsp;
                </div>

                <Carousel
                  options={["AM", "PM"]}
                  selected={newAlarm.ampm}
                  onChange={(value) => handleCarouselChange("ampm", value)}
                />
              </div>

              <DaySelector
                selectedDays={newAlarm.days}
                onChange={(days) => setNewAlarm((prev) => ({ ...prev, days }))}
              />

              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => setIsAddingAlarm(false)}
                  className="flex items-center justify-center cursor-pointer active:scale-95 hover:scale-105 bg-gray-500 text-white px-6 py-3 rounded-lg m-2 transition duration-100 ease-in font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAlarm}
                  className="flex items-center justify-center cursor-pointer active:scale-95 hover:scale-105 bg-blue-500 text-white px-6 py-3 rounded-lg m-2 transition duration-100 ease-in font-semibold"
                  aria-label="Add new alarm"
                >
                  <Plus className="mr-2" /> Add Alarm
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingAlarm(true)}
              className="flex items-center justify-center cursor-pointer active:scale-95 hover:scale-105 bg-blue-500 text-white px-6 py-3 rounded-lg m-2 transition duration-100 ease-in font-semibold"
              aria-label="Add new alarm"
            >
              <Plus className="mr-2" /> Create New Alarm
            </button>
          )}
        </div>
      </Container>
    </div>
  );
};

export default Alarm;
