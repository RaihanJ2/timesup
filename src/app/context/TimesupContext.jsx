// src/app/context/TimesupContext.jsx
"use client";
import React, { createContext, useContext, useReducer, useEffect } from "react";

// Define initial state
const initialState = {
  timer: {
    isActive: false,
    timerType: "Pomodoro",
    timeLeft: { hours: 0, minutes: 25, seconds: 0 },
    currentTaskId: null,
    pomodoroCount: 0,
    autoPomodoro: true,
    pomodoroSettings: {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      longBreakInterval: 4,
      autoStartBreaks: true,
      autoStartPomodoros: true,
    },
  },
  tasks: {
    items: [],
    completedSessions: {},
  },
  stopwatch: {
    time: 0,
    isRunning: false,
  },
  alarms: {
    items: [],
    newAlarm: { hours: "12", minutes: "00", ampm: "AM" },
  },
};

// Create context
const TimesupContext = createContext();

// Define action types
const ActionTypes = {
  // Timer actions
  SET_TIMER_ACTIVE: "SET_TIMER_ACTIVE",
  SET_TIMER_TYPE: "SET_TIMER_TYPE",
  SET_TIME_LEFT: "SET_TIME_LEFT",
  SET_CURRENT_TASK: "SET_CURRENT_TASK",
  SET_POMODORO_COUNT: "SET_POMODORO_COUNT",
  SET_AUTO_POMODORO: "SET_AUTO_POMODORO",
  UPDATE_POMODORO_SETTINGS: "UPDATE_POMODORO_SETTINGS",
  RESET_TIMER: "RESET_TIMER",

  // Tasks actions
  ADD_TASK: "ADD_TASK",
  DELETE_TASK: "DELETE_TASK",
  TOGGLE_TASK_COMPLETE: "TOGGLE_TASK_COMPLETE",
  INCREMENT_COMPLETED_SESSION: "INCREMENT_COMPLETED_SESSION",

  // Stopwatch actions
  SET_STOPWATCH_TIME: "SET_STOPWATCH_TIME",
  SET_STOPWATCH_RUNNING: "SET_STOPWATCH_RUNNING",
  RESET_STOPWATCH: "RESET_STOPWATCH",

  // Alarm actions
  ADD_ALARM: "ADD_ALARM",
  REMOVE_ALARM: "REMOVE_ALARM",
  UPDATE_NEW_ALARM: "UPDATE_NEW_ALARM",
};

// Define reducer function
function appReducer(state, action) {
  switch (action.type) {
    // Timer actions
    case ActionTypes.SET_TIMER_ACTIVE:
      return {
        ...state,
        timer: { ...state.timer, isActive: action.payload },
      };
    case ActionTypes.SET_TIMER_TYPE:
      return {
        ...state,
        timer: { ...state.timer, timerType: action.payload },
      };
    case ActionTypes.SET_TIME_LEFT:
      return {
        ...state,
        timer: { ...state.timer, timeLeft: action.payload },
      };
    case ActionTypes.SET_CURRENT_TASK:
      return {
        ...state,
        timer: { ...state.timer, currentTaskId: action.payload },
      };
    case ActionTypes.SET_POMODORO_COUNT:
      return {
        ...state,
        timer: { ...state.timer, pomodoroCount: action.payload },
      };
    case ActionTypes.SET_AUTO_POMODORO:
      return {
        ...state,
        timer: { ...state.timer, autoPomodoro: action.payload },
      };
    case ActionTypes.UPDATE_POMODORO_SETTINGS:
      return {
        ...state,
        timer: {
          ...state.timer,
          pomodoroSettings: {
            ...state.timer.pomodoroSettings,
            [action.payload.key]: action.payload.value,
          },
        },
      };
    case ActionTypes.RESET_TIMER:
      return {
        ...state,
        timer: {
          ...state.timer,
          isActive: false,
          timeLeft: action.payload,
        },
      };

    // Tasks actions
    case ActionTypes.ADD_TASK:
      return {
        ...state,
        tasks: {
          ...state.tasks,
          items: [...state.tasks.items, action.payload],
        },
      };
    case ActionTypes.DELETE_TASK: {
      const newCompletedSessions = { ...state.tasks.completedSessions };
      delete newCompletedSessions[action.payload];

      return {
        ...state,
        tasks: {
          ...state.tasks,
          items: state.tasks.items.filter((task) => task.id !== action.payload),
          completedSessions: newCompletedSessions,
        },
        timer: {
          ...state.timer,
          currentTaskId:
            state.timer.currentTaskId === action.payload
              ? null
              : state.timer.currentTaskId,
        },
      };
    }
    case ActionTypes.TOGGLE_TASK_COMPLETE:
      return {
        ...state,
        tasks: {
          ...state.tasks,
          items: state.tasks.items.map((task) =>
            task.id === action.payload
              ? { ...task, completed: !task.completed }
              : task
          ),
        },
      };
    case ActionTypes.INCREMENT_COMPLETED_SESSION:
      return {
        ...state,
        tasks: {
          ...state.tasks,
          completedSessions: {
            ...state.tasks.completedSessions,
            [action.payload]:
              (state.tasks.completedSessions[action.payload] || 0) + 1,
          },
        },
      };

    // Stopwatch actions
    case ActionTypes.SET_STOPWATCH_TIME:
      return {
        ...state,
        stopwatch: { ...state.stopwatch, time: action.payload },
      };
    case ActionTypes.SET_STOPWATCH_RUNNING:
      return {
        ...state,
        stopwatch: { ...state.stopwatch, isRunning: action.payload },
      };
    case ActionTypes.RESET_STOPWATCH:
      return {
        ...state,
        stopwatch: { ...state.stopwatch, time: 0, isRunning: false },
      };

    // Alarm actions
    case ActionTypes.ADD_ALARM:
      return {
        ...state,
        alarms: {
          ...state.alarms,
          items: [
            ...state.alarms.items,
            { ...state.alarms.newAlarm, isSet: true },
          ],
          newAlarm: { hours: "12", minutes: "00", ampm: "AM" },
        },
      };
    case ActionTypes.REMOVE_ALARM:
      return {
        ...state,
        alarms: {
          ...state.alarms,
          items: state.alarms.items.filter(
            (_, index) => index !== action.payload
          ),
        },
      };
    case ActionTypes.UPDATE_NEW_ALARM:
      return {
        ...state,
        alarms: {
          ...state.alarms,
          newAlarm: {
            ...state.alarms.newAlarm,
            [action.payload.type]: action.payload.value,
          },
        },
      };

    default:
      return state;
  }
}

// Provider component
export function TimesupProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load state from localStorage on initial render
  useEffect(() => {
    try {
      const savedState = localStorage.getItem("timesupState");

      if (savedState) {
        const parsedState = JSON.parse(savedState);

        // Use the parsed state to initialize the different parts
        if (parsedState.tasks?.items) {
          dispatch({
            type: ActionTypes.SET_TASKS,
            payload: parsedState.tasks.items,
          });
        }

        if (parsedState.tasks?.completedSessions) {
          dispatch({
            type: ActionTypes.SET_COMPLETED_SESSIONS,
            payload: parsedState.tasks.completedSessions,
          });
        }

        if (parsedState.timer?.pomodoroSettings) {
          Object.entries(parsedState.timer.pomodoroSettings).forEach(
            ([key, value]) => {
              dispatch({
                type: ActionTypes.UPDATE_POMODORO_SETTINGS,
                payload: { key, value },
              });
            }
          );
        }

        if (parsedState.timer?.pomodoroCount !== undefined) {
          dispatch({
            type: ActionTypes.SET_POMODORO_COUNT,
            payload: parsedState.timer.pomodoroCount,
          });
        }

        if (parsedState.timer?.autoPomodoro !== undefined) {
          dispatch({
            type: ActionTypes.SET_AUTO_POMODORO,
            payload: parsedState.timer.autoPomodoro,
          });
        }

        if (parsedState.alarms?.items) {
          dispatch({
            type: ActionTypes.SET_ALARMS,
            payload: parsedState.alarms.items,
          });
        }
      }
    } catch (error) {
      console.error("Could not load data from localStorage", error);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(
        "timesupState",
        JSON.stringify({
          tasks: state.tasks,
          timer: {
            pomodoroSettings: state.timer.pomodoroSettings,
            pomodoroCount: state.timer.pomodoroCount,
            autoPomodoro: state.timer.autoPomodoro,
          },
          alarms: {
            items: state.alarms.items,
          },
        })
      );
    } catch (error) {
      console.error("Could not save data to localStorage", error);
    }
  }, [
    state.tasks,
    state.timer.pomodoroSettings,
    state.timer.pomodoroCount,
    state.timer.autoPomodoro,
    state.alarms.items,
  ]);

  return (
    <TimesupContext.Provider value={{ state, dispatch, ActionTypes }}>
      {children}
    </TimesupContext.Provider>
  );
}

// Custom hook for using the context
export function useTimesup() {
  const context = useContext(TimesupContext);
  if (!context) {
    throw new Error("useTimesup must be used within a TimesupProvider");
  }
  return context;
}

// Action creator hooks for each feature
export function useTimerActions() {
  const { dispatch, ActionTypes } = useTimesup();

  return {
    setTimerActive: (isActive) =>
      dispatch({ type: ActionTypes.SET_TIMER_ACTIVE, payload: isActive }),
    setTimerType: (timerType) =>
      dispatch({ type: ActionTypes.SET_TIMER_TYPE, payload: timerType }),
    setTimeLeft: (timeLeft) =>
      dispatch({ type: ActionTypes.SET_TIME_LEFT, payload: timeLeft }),
    setCurrentTask: (taskId) =>
      dispatch({ type: ActionTypes.SET_CURRENT_TASK, payload: taskId }),
    setPomodoroCount: (count) =>
      dispatch({ type: ActionTypes.SET_POMODORO_COUNT, payload: count }),
    setAutoPomodoro: (auto) =>
      dispatch({ type: ActionTypes.SET_AUTO_POMODORO, payload: auto }),
    updatePomodoroSetting: (key, value) =>
      dispatch({
        type: ActionTypes.UPDATE_POMODORO_SETTINGS,
        payload: { key, value },
      }),
    resetTimer: (timeLeft) =>
      dispatch({ type: ActionTypes.RESET_TIMER, payload: timeLeft }),

    // Helper to set timer presets
    setTimerPreset: (type, settings) => {
      const timerPresets = {
        Pomodoro: settings.workDuration * 60,
        "Short Break": settings.shortBreakDuration * 60,
        "Long Break": settings.longBreakDuration * 60,
        "1 min": 1 * 60,
        "5 min": 5 * 60,
        "10 min": 10 * 60,
        "15 min": 15 * 60,
      };

      const totalSeconds = timerPresets[type];
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      dispatch({ type: ActionTypes.SET_TIMER_TYPE, payload: type });
      dispatch({
        type: ActionTypes.SET_TIME_LEFT,
        payload: { hours, minutes, seconds },
      });
    },
  };
}

export function useTaskActions() {
  const { dispatch, ActionTypes } = useTimesup();

  return {
    addTask: (task) => dispatch({ type: ActionTypes.ADD_TASK, payload: task }),
    deleteTask: (taskId) =>
      dispatch({ type: ActionTypes.DELETE_TASK, payload: taskId }),
    toggleTaskComplete: (taskId) =>
      dispatch({ type: ActionTypes.TOGGLE_TASK_COMPLETE, payload: taskId }),
    incrementCompletedSession: (taskId) =>
      dispatch({
        type: ActionTypes.INCREMENT_COMPLETED_SESSION,
        payload: taskId,
      }),
  };
}

export function useStopwatchActions() {
  const { dispatch, ActionTypes } = useTimesup();

  return {
    setTime: (time) =>
      dispatch({ type: ActionTypes.SET_STOPWATCH_TIME, payload: time }),
    setRunning: (isRunning) =>
      dispatch({ type: ActionTypes.SET_STOPWATCH_RUNNING, payload: isRunning }),
    resetStopwatch: () => dispatch({ type: ActionTypes.RESET_STOPWATCH }),
  };
}

export function useAlarmActions() {
  const { dispatch, ActionTypes } = useTimesup();

  return {
    addAlarm: () => dispatch({ type: ActionTypes.ADD_ALARM }),
    removeAlarm: (index) =>
      dispatch({ type: ActionTypes.REMOVE_ALARM, payload: index }),
    updateNewAlarm: (type, value) =>
      dispatch({
        type: ActionTypes.UPDATE_NEW_ALARM,
        payload: { type, value },
      }),
  };
}
