"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Circle,
  Plus,
  X,
  Clock,
  Settings,
} from "lucide-react";
import Container from "@/app/components/Container";
import {
  useTimesup,
  useTimerActions,
  useTaskActions,
} from "@/app/context/TimesupContext";
import { motion } from "framer-motion";

const TaskTimer = () => {
  const { state } = useTimesup();
  const {
    timeLeft,
    isActive,
    timerType,
    currentTaskId,
    pomodoroCount,
    autoPomodoro,
    pomodoroSettings,
    initialTime,
  } = state.timer;

  const { items: tasks, completedSessions } = state.tasks;

  const {
    setTimerActive,
    setTimerPreset,
    setTimeLeft,
    setCurrentTask,
    setPomodoroCount,
    setAutoPomodoro,
    updatePomodoroSetting,
  } = useTimerActions();

  const { addTask, deleteTask, toggleTaskComplete, incrementCompletedSession } =
    useTaskActions();

  const [newTaskText, setNewTaskText] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [progress, setProgress] = useState(100);
  const intervalRef = useRef(null);

  // Timer presets in seconds - dynamic based on settings
  const timerPresets = {
    Pomodoro: pomodoroSettings.workDuration * 60,
    "Short Break": pomodoroSettings.shortBreakDuration * 60,
    "Long Break": pomodoroSettings.longBreakDuration * 60,
    "1 min": 1 * 60,
    "5 min": 5 * 60,
    "10 min": 10 * 60,
    "15 min": 15 * 60,
  };

  // Calculate total seconds from the timeLeft object
  const calculateTotalSeconds = (time) => {
    return time.hours * 3600 + time.minutes * 60 + time.seconds;
  };

  // Calculate initial total seconds when timer is set
  const calculateInitialSeconds = (type) => {
    if (type === "Pomodoro") return pomodoroSettings.workDuration * 60;
    if (type === "Short Break") return pomodoroSettings.shortBreakDuration * 60;
    if (type === "Long Break") return pomodoroSettings.longBreakDuration * 60;
    return timerPresets[type] || 0;
  };

  // Set timer based on preset
  const setTimer = (type) => {
    // Calculate the appropriate time in seconds based on type
    let timeInSeconds;

    if (type === "Pomodoro") {
      timeInSeconds = pomodoroSettings.workDuration * 60;
    } else if (type === "Short Break") {
      timeInSeconds = pomodoroSettings.shortBreakDuration * 60;
    } else if (type === "Long Break") {
      timeInSeconds = pomodoroSettings.longBreakDuration * 60;
    } else {
      timeInSeconds = timerPresets[type] || 0;
    }

    // Convert to hours, minutes, seconds
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;

    // Stop the timer
    setTimerActive(false);

    // Set the timer type
    setTimerPreset(type, pomodoroSettings);

    // Explicitly set time values
    setTimeLeft({
      hours,
      minutes,
      seconds,
    });

    // Reset progress
    setProgress(100);
  };

  // Toggle timer start/pause
  const toggleTimer = () => {
    setTimerActive(!isActive);
  };

  // Reset timer to current preset
  const resetTimer = () => {
    setTimerActive(false);
    setTimer(timerType);
  };

  const handleTimerComplete = () => {
    // Stop the timer first
    setTimerActive(false);

    // Play notification sound
    try {
      const audio = new Audio("/alarm-sound.mp4");
      audio.play();
    } catch (error) {
      console.log("Notification sound couldn't be played");
    }

    // Show notification
    if (Notification.permission === "granted") {
      new Notification("Timer Complete", {
        body: `Completed a ${timerType} session!`,
      });
    }

    // Handle state updates based on current timer type
    if (timerType === "Pomodoro") {
      // Only increment completed sessions if there's a task
      if (currentTaskId) {
        incrementCompletedSession(currentTaskId);
      }

      // Increment pomodoro count for sequence tracking
      const newCount = pomodoroCount + 1;
      setPomodoroCount(newCount);

      // If automatic pomodoro is enabled
      if (autoPomodoro) {
        // Determine next timer type
        const nextTimerType =
          newCount % pomodoroSettings.longBreakInterval === 0
            ? "Long Break"
            : "Short Break";

        // Use timeout to ensure state changes are processed
        setTimeout(() => {
          setTimer(nextTimerType);
        }, 500);
      }
    }
    // Handle break completion
    else if (
      (timerType === "Short Break" || timerType === "Long Break") &&
      autoPomodoro
    ) {
      // Use timeout to ensure state changes are processed
      setTimeout(() => {
        // Switch back to Pomodoro
        setTimer("Pomodoro");
      }, 500);
    }
  };

  // Additionally, let's add this effect to watch for timer type changes
  useEffect(() => {
    console.log(`Timer type changed to: ${timerType}`);
    console.log(
      `Time left: ${timeLeft.hours}:${timeLeft.minutes}:${timeLeft.seconds}`
    );

    // If the timer changes type but time is still at 0, force a reset
    if (
      timeLeft.hours === 0 &&
      timeLeft.minutes === 0 &&
      timeLeft.seconds === 0 &&
      !isActive
    ) {
      console.log("Detected timer at 0:0:0, forcing reset");
      setTimer(timerType);
    }
  }, [timerType]);

  // Timer countdown effect
  useEffect(() => {
    let interval = null;

    if (isActive) {
      interval = setInterval(() => {
        if (
          timeLeft.hours === 0 &&
          timeLeft.minutes === 0 &&
          timeLeft.seconds === 0
        ) {
          clearInterval(interval);
          handleTimerComplete();
          return;
        }

        let newHours = timeLeft.hours;
        let newMinutes = timeLeft.minutes;
        let newSeconds = timeLeft.seconds - 1;

        if (newSeconds < 0) {
          newMinutes--;
          newSeconds = 59;
        }

        if (newMinutes < 0) {
          newHours--;
          newMinutes = 59;
        }

        setTimeLeft({
          hours: newHours,
          minutes: newMinutes,
          seconds: newSeconds,
        });

        // Update progress for circle
        const initialSeconds = calculateInitialSeconds(timerType);
        const remainingSeconds = newHours * 3600 + newMinutes * 60 + newSeconds;
        const newProgress = (remainingSeconds / initialSeconds) * 100;
        setProgress(newProgress);
      }, 1000);
    } else if (!isActive && interval) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, currentTaskId, timerType]);

  // Initialize timer on first render
  useEffect(() => {
    // Request notification permission
    if (
      typeof window !== "undefined" &&
      Notification &&
      Notification.permission !== "granted"
    ) {
      Notification.requestPermission();
    }

    // Set initial timer
    setTimer("Pomodoro");
  }, []);

  // Update progress when timer type changes
  useEffect(() => {
    const initialSeconds = calculateInitialSeconds(timerType);
    const currentSeconds = calculateTotalSeconds(timeLeft);
    const newProgress = (currentSeconds / initialSeconds) * 100;
    setProgress(newProgress);
  }, [timerType]);

  // Format number to always have two digits
  const formatTime = (time) => {
    return time.toString().padStart(2, "0");
  };

  // Add a new task
  const handleAddTask = () => {
    if (newTaskText.trim() === "") return;

    const newTask = {
      id: Date.now(),
      text: newTaskText,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    addTask(newTask);
    setNewTaskText("");
  };

  // Select a task to associate with the timer
  const handleSelectTask = (taskId) => {
    setCurrentTask(taskId === currentTaskId ? null : taskId);
  };

  // Reset pomodoro sequence
  const resetPomodoroSequence = () => {
    setPomodoroCount(0);
    setTimer("Pomodoro");
  };

  // Update a setting value
  const handleSettingUpdate = (key, value) => {
    updatePomodoroSetting(key, value);
  };

  // Handle toggling task completion
  const handleToggleComplete = (taskId) => {
    toggleTaskComplete(taskId);
  };

  // Handle deleting a task
  const handleDeleteTask = (taskId) => {
    deleteTask(taskId);
  };

  // Get color based on timer type
  const getTimerColor = () => {
    switch (timerType) {
      case "Pomodoro":
        return "#EF4444"; // red-500
      case "Short Break":
        return "#10B981"; // green-500
      case "Long Break":
        return "#3B82F6"; // blue-500
      default:
        return "#6366F1"; // indigo-500
    }
  };

  // Circle progress properties
  const timerColor = getTimerColor();
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Container className="flex flex-col justify-evenly h-fit">
      <div className="w-full flex flex-row items-center justify-between px-2 rounded-t border-b-2 border-gray-800">
        <div className="flex flex-row items-center">
          {Object.keys(timerPresets)
            .slice(0, 3)
            .map((type) => (
              <div
                key={type}
                className={`cursor-pointer hover:bg-gray-600 p-3 h-full ${
                  timerType === type ? "bg-gray-700" : ""
                }`}
                onClick={() => setTimer(type)}
              >
                {type}
              </div>
            ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoPomodoro"
              checked={autoPomodoro}
              onChange={() => setAutoPomodoro(!autoPomodoro)}
              className="h-4 w-4"
            />
            <label htmlFor="autoPomodoro" className="text-sm">
              Auto Pomodoro
            </label>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-700 rounded-full"
          >
            <motion.div
              animate={{
                rotate: showSettings ? 180 : 0,
                scale: showSettings ? 1.1 : 1,
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 10,
              }}
            >
              <Settings size={18} />
            </motion.div>
          </button>
        </div>
      </div>
      <motion.div
        initial={false}
        animate={{
          opacity: showSettings ? 1 : 0,
          height: showSettings ? "auto" : 0,
          marginBottom: showSettings ? "1rem" : 0,
          transformOrigin: "top center",
        }}
        transition={{
          type: "spring",
          bounce: 0.1,
          duration: 0.5,
          opacity: { duration: 0.2 },
        }}
        className="overflow-hidden bg-gray-800 rounded-md"
        style={{
          pointerEvents: showSettings ? "auto" : "none",
        }}
      >
        {/* Settings Panel */}
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="p-4"
          >
            <h3 className="font-bold mb-3">Pomodoro Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-300">
                  Work Duration (minutes)
                </label>
                <input
                  type="number"
                  value={pomodoroSettings.workDuration}
                  onChange={(e) =>
                    handleSettingUpdate("workDuration", Number(e.target.value))
                  }
                  className="w-full p-2 bg-gray-700 rounded mt-1"
                  min="1"
                  max="60"
                />
              </div>
              <div>
                <label className="text-sm text-gray-300">
                  Short Break (minutes)
                </label>
                <input
                  type="number"
                  value={pomodoroSettings.shortBreakDuration}
                  onChange={(e) =>
                    handleSettingUpdate(
                      "shortBreakDuration",
                      Number(e.target.value)
                    )
                  }
                  className="w-full p-2 bg-gray-700 rounded mt-1"
                  min="1"
                  max="30"
                />
              </div>
              <div>
                <label className="text-sm text-gray-300">
                  Long Break (minutes)
                </label>
                <input
                  type="number"
                  value={pomodoroSettings.longBreakDuration}
                  onChange={(e) =>
                    handleSettingUpdate(
                      "longBreakDuration",
                      Number(e.target.value)
                    )
                  }
                  className="w-full p-2 bg-gray-700 rounded mt-1"
                  min="1"
                  max="60"
                />
              </div>
              <div>
                <label className="text-sm text-gray-300">
                  Long Break After (pomodoros)
                </label>
                <input
                  type="number"
                  value={pomodoroSettings.longBreakInterval}
                  onChange={(e) =>
                    handleSettingUpdate(
                      "longBreakInterval",
                      Number(e.target.value)
                    )
                  }
                  className="w-full p-2 bg-gray-700 rounded mt-1"
                  min="1"
                  max="10"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoStartBreaks"
                  checked={pomodoroSettings.autoStartBreaks}
                  onChange={() =>
                    handleSettingUpdate(
                      "autoStartBreaks",
                      !pomodoroSettings.autoStartBreaks
                    )
                  }
                  className="h-4 w-4 mr-2"
                />
                <label htmlFor="autoStartBreaks">Auto-start breaks</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoStartPomodoros"
                  checked={pomodoroSettings.autoStartPomodoros}
                  onChange={() =>
                    handleSettingUpdate(
                      "autoStartPomodoros",
                      !pomodoroSettings.autoStartPomodoros
                    )
                  }
                  className="h-4 w-4 mr-2"
                />
                <label htmlFor="autoStartPomodoros">Auto-start pomodoros</label>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
              >
                Done
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full px-2 py-4">
        {/* Timer Section with Circular Progress */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* SVG Circle Progress */}
            <svg className="absolute w-full h-full" viewBox="0 0 264 264">
              {/* Background circle */}
              <circle
                cx="132"
                cy="132"
                r={radius}
                fill="transparent"
                stroke="#1F2937" // gray-800
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="132"
                cy="132"
                r={radius}
                fill="transparent"
                stroke={timerColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 132 132)"
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
            </svg>

            {/* Timer text in the middle */}
            <div className="z-10 flex flex-col items-center justify-center">
              <div className="text-5xl flex items-center justify-center">
                <span className="font-bold">
                  {formatTime(timeLeft.minutes)}
                </span>
                <span className="font-bold">:</span>
                <span className="font-bold">
                  {formatTime(timeLeft.seconds)}
                </span>
              </div>
              {timeLeft.hours > 0 && (
                <div className="text-sm mt-1">
                  +{timeLeft.hours} {timeLeft.hours === 1 ? "hour" : "hours"}
                </div>
              )}
              <div className="text-md mt-2 font-medium">{timerType}</div>
            </div>
          </div>

          {currentTaskId ? (
            <div className="mt-4 p-2 bg-gray-700 rounded-md text-center">
              Working on: {tasks.find((t) => t.id === currentTaskId)?.text}
            </div>
          ) : (
            <div className="mt-4 p-2 bg-gray-700 rounded-md text-center text-gray-400">
              No task selected
            </div>
          )}

          {autoPomodoro && (
            <div className="mt-2 text-sm text-gray-400">
              Pomodoro{" "}
              {(pomodoroCount % pomodoroSettings.longBreakInterval) + 1}
              &nbsp; of &nbsp;{pomodoroSettings.longBreakInterval} • Next:{" "}
              {timerType === "Pomodoro"
                ? (pomodoroCount + 1) % pomodoroSettings.longBreakInterval === 0
                  ? "Long Break"
                  : "Short Break"
                : "Pomodoro"}
            </div>
          )}

          <div className="mt-6 flex flex-row gap-6 items-center justify-center">
            <button
              className="w-12 h-12 p-2 bg-gray-800 hover:bg-gray-700 rounded-full active:scale-95 hover:scale-105 flex items-center justify-center"
              onClick={toggleTimer}
            >
              {isActive ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button
              className="w-12 h-12 p-2 bg-gray-800 hover:bg-gray-700 rounded-full active:scale-95 hover:scale-105 flex items-center justify-center"
              onClick={resetTimer}
            >
              <RotateCcw size={24} />
            </button>
            {autoPomodoro && (
              <button
                className="text-sm py-1 px-3 bg-gray-800 hover:bg-gray-600 rounded active:scale-95"
                onClick={resetPomodoroSequence}
              >
                Reset Sequence
              </button>
            )}
          </div>
        </div>

        {/* Tasks Section */}
        <div className="flex flex-col h-full bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-3">Tasks</h2>

          {/* Add new task */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddTask();
              }}
            />
            <button
              onClick={handleAddTask}
              className="p-2 bg-blue-600 hover:bg-blue-700 rounded"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Task list */}
          <div className="flex-1 overflow-y-auto">
            {tasks.length === 0 ? (
              <div className="text-gray-400 text-center py-4">
                No tasks yet. Add one to get started!
              </div>
            ) : (
              <ul className="space-y-2">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className={`
                      p-3 rounded-lg flex items-center justify-between
                      ${
                        task.completed
                          ? "bg-gray-700 text-gray-400"
                          : "bg-gray-700"
                      }
                      ${
                        currentTaskId === task.id
                          ? "border-2 border-blue-500"
                          : ""
                      }
                      hover:bg-gray-600 transition-colors
                    `}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <button
                        onClick={() => handleToggleComplete(task.id)}
                        className="text-gray-300 hover:text-white"
                      >
                        {task.completed ? (
                          <CheckCircle2 size={20} />
                        ) : (
                          <Circle size={20} />
                        )}
                      </button>
                      <span className={task.completed ? "line-through" : ""}>
                        {task.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {completedSessions[task.id] > 0 && (
                        <span className="flex items-center text-sm text-gray-400 gap-1">
                          <Clock size={14} />
                          {completedSessions[task.id]}
                        </span>
                      )}
                      <button
                        onClick={() => handleSelectTask(task.id)}
                        className={`p-1 rounded-md ${
                          currentTaskId === task.id
                            ? "bg-blue-600"
                            : "bg-gray-600"
                        } hover:bg-blue-500`}
                      >
                        <Clock size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default TaskTimer;
