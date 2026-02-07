export type DayOfWeek = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

export interface TaskItem {
  taskId: string;
  text: string;
  completed: boolean;
  timestamp?: string;
}

export interface DayData {
  date: string;
  day: DayOfWeek;
  holiday: boolean;
  tasks: TaskItem[];
}
