/**
 * Scheduling logic (ported from GAS): which tasks are due on a given date.
 */

const DOW = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

export interface TaskRow {
  task_id: string;
  text: string;
  schedule_type: string;
  days: string;
  rule: string;
  active: boolean;
}

interface DateParts {
  y: number;
  m: number;
  d: number;
  dateStr: string;
}

function parseDate(dateStr: string): DateParts | null {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  return { y, m, d, dateStr };
}

function getDayOfWeek(dateObj: DateParts): string {
  const d = new Date(dateObj.y, dateObj.m - 1, dateObj.d);
  return DOW[d.getDay()];
}

function getWeekOccurrenceInMonth(dateObj: DateParts): number {
  return Math.ceil(dateObj.d / 7);
}

function getMMDD(dateObj: DateParts): string {
  const m = dateObj.m < 10 ? "0" + dateObj.m : "" + dateObj.m;
  const d = dateObj.d < 10 ? "0" + dateObj.d : "" + dateObj.d;
  return m + "-" + d;
}

function isTaskDueToday(
  task: TaskRow,
  dateObj: DateParts,
  dayOfWeek: string
): boolean {
  const scheduleType = (task.schedule_type || "").toUpperCase();
  const days = (task.days || "")
    .toUpperCase()
    .split(",")
    .map((s) => s.trim());
  const rule = (task.rule || "").toUpperCase();

  if (scheduleType === "DAILY") return days.includes(dayOfWeek);
  if (scheduleType === "WEEKLY") return days.includes(dayOfWeek);
  if (scheduleType === "FORTNIGHTLY") {
    const occ = getWeekOccurrenceInMonth(dateObj);
    const parts = rule.split(":");
    if (parts.length >= 3 && parts[1].indexOf("ND") >= 0) {
      let n = parseInt(parts[1], 10);
      if (isNaN(n)) n = 2;
      const ruleDay = parts[2];
      return ruleDay === dayOfWeek && occ === n;
    }
    return false;
  }
  if (scheduleType === "MONTHLY") {
    const dayParts = rule.split(":");
    if (dayParts.length >= 3 && dayParts[1] === "DAY") {
      const dayNum = parseInt(dayParts[2], 10);
      return dateObj.d === dayNum;
    }
    return false;
  }
  if (scheduleType === "QUARTERLY") {
    const dateParts = rule.split(":");
    if (dateParts.length >= 3) {
      const allowed = dateParts[2].split(",").map((s) => s.trim());
      const mmdd = getMMDD(dateObj);
      return allowed.includes(mmdd);
    }
    return false;
  }
  return false;
}

export function getTasksForDate(
  allTasks: TaskRow[],
  dateStr: string
): { taskId: string; text: string }[] {
  const dateObj = parseDate(dateStr);
  if (!dateObj) return [];
  const dayOfWeek = getDayOfWeek(dateObj);
  return allTasks
    .filter((t) => t.active && isTaskDueToday(t, dateObj, dayOfWeek))
    .map((t) => ({ taskId: t.task_id, text: t.text }));
}
