export interface TimerCircleProps {
  timeLeft: TimeLeft;
  timerType: string;
  progress: number;
  timerColor: string;
}
// types.ts
export interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface Task {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface PomodoroSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

export interface CompletedSessions {
  [key: number]: number;
}

export interface TimerState {
  timeLeft: TimeLeft;
  isActive: boolean;
  timerType: string;
  currentTaskId: number | null;
  pomodoroCount: number;
  autoPomodoro: boolean;
  pomodoroSettings: PomodoroSettings;
}

export interface TasksState {
  items: Task[];
  completedSessions: CompletedSessions;
}

export interface AppState {
  timer: TimerState;
  tasks: TasksState;
}

export interface TimerActions {
  setTimerActive: (active: boolean) => void;
  setTimerPreset: (type: string, settings: PomodoroSettings) => void;
  setTimeLeft: (timeLeft: TimeLeft) => void;
  setCurrentTask: (taskId: number | null) => void;
  setPomodoroCount: (count: number) => void;
  setAutoPomodoro: (auto: boolean) => void;
  updatePomodoroSetting: (
    key: keyof PomodoroSettings,
    value: number | boolean
  ) => void;
}

export interface TaskActions {
  addTask: (task: Task) => void;
  deleteTask: (taskId: number) => void;
  toggleTaskComplete: (taskId: number) => void;
  incrementCompletedSession: (taskId: number) => void;
}

export interface TimesupContext {
  state: AppState;
}
export interface TimerControlsProps {
  isActive: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  autoPomodoro: boolean;
  onResetSequence: () => void;
}

export interface TimerHeaderProps {
  timerType: string;
  displayTimerPresets: string[];
  setTimer: (type: string) => void;
  autoPomodoro: boolean;
  toggleAutoPomodoro: () => void;
  showSettings: boolean;
  toggleSettings: () => void;
}

export interface TaskListProps {
  tasks: Task[];
  currentTaskId: number | null;
  completedSessions: CompletedSessions;
  onSelectTask: (id: number) => void;
  onToggleComplete: (id: number) => void;
  onDeleteTask: (id: number) => void;
}

export interface TaskItemProps {
  task: Task;
  isSelected: boolean;
  completedSessions: CompletedSessions;
  onSelect: (id: number) => void;
  onToggleComplete: (id: number) => void;
  onDelete: (id: number) => void;
}

export interface AddTaskFormProps {
  newTaskText: string;
  onNewTaskTextChange: (text: string) => void;
  onAddTask: () => void;
}
export interface SettingsPanelProps {
  settings: PomodoroSettings;
  onUpdate: (key: keyof PomodoroSettings, value: number | boolean) => void;
  onClose: () => void;
}
