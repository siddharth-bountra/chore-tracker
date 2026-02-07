import type { DayData, DayOfWeek, TaskItem } from "../types";
import type { TaskRow } from "./schedule";
import { getTasksForDate } from "./schedule";
import { getSupabase } from "./supabase-server";

const DOW: DayOfWeek[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function getDayOfWeek(dateStr: string): DayOfWeek {
  const [y, m, d] = dateStr.split("-").map(Number);
  const day = new Date(y, m - 1, d).getDay();
  return DOW[day];
}

export async function getDayFromSupabase(dateStr: string): Promise<DayData | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: tasksRows, error: tasksError } = await supabase
    .from("tasks")
    .select("task_id, text, schedule_type, days, rule, active")
    .eq("active", true);

  if (tasksError || !tasksRows?.length) {
    return {
      date: dateStr,
      day: getDayOfWeek(dateStr),
      holiday: false,
      tasks: [],
    };
  }

  const tasks = getTasksForDate(tasksRows as TaskRow[], dateStr);

  const { data: statusRows } = await supabase
    .from("status")
    .select("task_id, completed, timestamp")
    .eq("date", dateStr);

  const statusByTask = new Map<
    string,
    { completed: boolean; timestamp?: string }
  >();
  for (const row of statusRows ?? []) {
    statusByTask.set(row.task_id, {
      completed: row.completed ?? false,
      timestamp: row.timestamp ?? undefined,
    });
  }

  const taskItems: TaskItem[] = tasks.map((t) => {
    const st = statusByTask.get(t.taskId);
    return {
      taskId: t.taskId,
      text: t.text,
      completed: st?.completed ?? false,
      timestamp: st?.timestamp,
    };
  });

  return {
    date: dateStr,
    day: getDayOfWeek(dateStr),
    holiday: false,
    tasks: taskItems,
  };
}

export async function toggleInSupabase(
  dateStr: string,
  taskId: string,
  completed: boolean
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not configured");

  const { error } = await supabase.from("status").upsert(
    {
      date: dateStr,
      task_id: taskId,
      completed,
      timestamp: new Date().toISOString(),
    },
    { onConflict: "date,task_id" }
  );

  if (error) throw new Error(error.message);
}
