"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import Container from "../components/Container";
import AlarmList from "../components/Alarms/AlarmList";
import TimeDisplay from "../components/Alarms/TimeDisplay";
import type { Alarm } from "../types";
import { Plus } from "lucide-react";
import AlarmForm from "../components/Alarms/AlarmForm";
import { formatDisplayTime } from "./utils";

export default function Alarm() {
  const [currentTime, setCurrentTime] = useState("00:00 AM");
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [isAddingAlarm, setIsAddingAlarm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [activeAlarmIndex, setActiveAlarmIndex] = useState<number | null>(null);
  const { data: session, status } = useSession();
  const [newAlarm, setNewAlarm] = useState<Omit<Alarm, "isSet">>({
    hours: "12",
    minutes: "00",
    ampm: "AM",
    name: "",
    days: [],
  });

  const isAuthenticated = status === "authenticated";

  const enableAudio = () => {
    // Initialize the audio element if it doesn't exist
    if (!alarmAudioRef.current) {
      alarmAudioRef.current = new Audio("/alarm-sound.mp4");
      alarmAudioRef.current.volume = 0.5;
      alarmAudioRef.current.loop = true; // Make the alarm loop until stopped
    }

    // Try to play the audio to trigger the permission request
    alarmAudioRef.current
      .play()
      .then(() => {
        // Immediately pause and reset if it worked
        alarmAudioRef.current?.pause();
        alarmAudioRef.current!.currentTime = 0;
        setAudioEnabled(true);
      })
      .catch((e) => console.log("Audio permission request failed:", e));
  };

  const handleToggleAlarm = async (index: number) => {
    const alarm = alarms[index];
    const updatedAlarm = { ...alarm, isSet: !alarm.isSet };

    if (isAuthenticated && alarm._id) {
      try {
        await axios.put(`/api/alarms/${alarm._id}`, updatedAlarm);
      } catch (error) {
        console.error("Error toggling alarm in database:", error);
      }
    }

    setAlarms((prev) => prev.map((a, i) => (i === index ? updatedAlarm : a)));
  };
  const handleRemoveAlarm = async (index: number) => {
    if (activeAlarmIndex === index) {
      stopAlarm(index);
    }

    const alarm = alarms[index];

    if (isAuthenticated && alarm._id) {
      try {
        await axios.delete(`/api/alarms/${alarm._id}`);
      } catch (error) {
        console.error("Error removing alarm from database:", error);
      }
    }

    setAlarms((prev) => prev.filter((_, i) => i !== index));
  };

  const stopAlarm = async (index: number) => {
    if (alarmAudioRef.current) {
      alarmAudioRef.current.pause();
      alarmAudioRef.current.currentTime = 0;
    }
    setActiveAlarmIndex(null);

    try {
      const alarm = alarms[index];

      if (isAuthenticated && alarm._id) {
        await axios.put(`/api/alarms/${alarm._id}`, { ...alarm, isSet: false });
      }

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
      try {
        const res = await axios.post("/api/alarms", alarmToAdd);
        if (res.data && res.data.alarm) {
          setAlarms((prev) => [...prev, res.data.alarm]);
        }
      } catch (error) {
        console.error("Error adding alarm to database:", error);
        const newAlarmWithId = { ...alarmToAdd, _id: Date.now().toString() };
        setAlarms((prev) => [...prev, newAlarmWithId]);
      }
    } else {
      const newAlarmWithId = { ...alarmToAdd, _id: Date.now().toString() };
      setAlarms((prev) => [...prev, newAlarmWithId]);
    }

    setNewAlarm({
      hours: "12",
      minutes: "00",
      ampm: "AM",
      name: "",
      days: [],
    });
    setIsAddingAlarm(false);
  };

  const handleCarouselChange = (
    type: keyof Omit<Alarm, "_id" | "isSet" | "name">,
    value: string
  ) => {
    setNewAlarm((prev) => ({ ...prev, [type]: value }));
  };

  const handleNameChange = (name: string) => {
    setNewAlarm((prev) => ({ ...prev, name }));
  };

  const handleDaysChange = (days: number[]) => {
    setNewAlarm((prev) => ({ ...prev, days }));
  };

  useEffect(() => {
    const fetchAlarms = async () => {
      try {
        setIsLoading(true);
        if (isAuthenticated) {
          const response = await axios.get("/api/alarms");
          setAlarms(response.data.alarms || []);
        } else {
          // Load from localStorage if not authenticated
          const localAlarms = localStorage.getItem("alarms");
          setAlarms(localAlarms ? JSON.parse(localAlarms) : []);
        }
      } catch (error) {
        console.error("Error fetching alarms:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlarms();

    // Set up interval for current time
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(formatDisplayTime(now));

      checkAlarms(now);
    }, 1000);

    return () => clearInterval(timer);
  }, [isAuthenticated]); // Add isAuthenticated as dependency

  // Add this helper function to the component
  const checkAlarms = (now: Date) => {
    alarms.forEach((alarm, index) => {
      if (!alarm.isSet) return;

      const alarmTime = getNextAlarmTime(alarm, now);
      if (alarmTime <= now && alarmTime > new Date(now.getTime() - 1000)) {
        triggerAlarm(index);
      }
    });
  };

  // Add this helper function
  const getNextAlarmTime = (alarm: Alarm, now: Date): Date => {
    let alarmHour = parseInt(alarm.hours, 10);
    if (alarm.ampm === "PM" && alarmHour !== 12) alarmHour += 12;
    if (alarm.ampm === "AM" && alarmHour === 12) alarmHour = 0;

    const alarmMinute = parseInt(alarm.minutes, 10);
    const currentDayIndex = now.getDay();

    let alarmTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      alarmHour,
      alarmMinute,
      0,
      0
    );

    // If alarm is in past or not set for today
    if (
      alarmTime < now ||
      (alarm.days.length > 0 && !alarm.days.includes(currentDayIndex))
    ) {
      if (alarm.days.length === 0) {
        // Daily alarm - set for tomorrow
        alarmTime.setDate(alarmTime.getDate() + 1);
      } else {
        // Find next scheduled day
        let daysToAdd = 1;
        let nextDayIndex = (currentDayIndex + daysToAdd) % 7;
        while (!alarm.days.includes(nextDayIndex)) {
          daysToAdd++;
          nextDayIndex = (currentDayIndex + daysToAdd) % 7;
        }
        alarmTime.setDate(alarmTime.getDate() + daysToAdd);
      }
    }

    return alarmTime;
  };

  const triggerAlarm = (index: number) => {
    setActiveAlarmIndex(index);
    if (alarmAudioRef.current && audioEnabled) {
      alarmAudioRef.current.currentTime = 0;
      alarmAudioRef.current.loop = true;
      alarmAudioRef.current
        .play()
        .catch((e) => console.error("Audio play failed:", e));
    }
  };

  useEffect(() => {
    setCurrentTime(formatDisplayTime(new Date()));
    return () => {
      // Clean up the audio element when component unmounts
      if (alarmAudioRef.current) {
        alarmAudioRef.current.pause();
        alarmAudioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated && alarms.length > 0) {
      localStorage.setItem("alarms", JSON.stringify(alarms));
    }
  }, [alarms, isAuthenticated]);
  return (
    <div className="flex flex-row">
      <audio ref={alarmAudioRef} src="/alarm-sound.mp4" loop />
      {!audioEnabled && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md">
            <h2 className="text-xl font-bold mb-4">Enable Alarm Sounds</h2>
            <p className="mb-4">
              For the best experience, please enable audio notifications.
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

      <AlarmList
        alarms={alarms}
        isLoading={isLoading}
        onToggleAlarm={handleToggleAlarm}
        onRemoveAlarm={handleRemoveAlarm}
      />

      <Container className="w-3/4 h-11/12 flex flex-col">
        <TimeDisplay currentTime={currentTime} />
        {isAddingAlarm ? (
          <AlarmForm
            newAlarm={newAlarm}
            onCancel={() => setIsAddingAlarm(false)}
            onAddAlarm={handleAddAlarm}
            onCarouselChange={handleCarouselChange}
            onNameChange={handleNameChange}
            onDaysChange={handleDaysChange}
          />
        ) : (
          <button
            onClick={() => setIsAddingAlarm(true)}
            className="flex items-center justify-center cursor-pointer active:scale-95 hover:scale-105 bg-blue-500 text-white px-6 py-3 rounded-lg m-2 transition duration-100 ease-in font-semibold"
          >
            <Plus className="mr-2" /> Create New Alarm
          </button>
        )}
      </Container>
    </div>
  );
}
