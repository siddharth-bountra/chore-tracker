import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { getDay } from "./lib/api";
import { TaskList } from "./components/TaskList";
import { SyncStatus } from "./components/SyncStatus";

export const dynamic = "force-dynamic";

const DAY_NAMES: Record<string, string> = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
  SAT: "Saturday",
  SUN: "Sunday",
};

function todayDateString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default async function TodayPage() {
  noStore();
  const date = todayDateString();
  let dayData;
  let error = "";
  try {
    dayData = await getDay(date, { revalidate: 0 });
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load tasks.";
  }

  if (error) {
    return (
      <main style={mainStyle}>
        <h1 style={h1Style}>Chores Today</h1>
        <p style={{ fontSize: "1.2rem", color: "#c00" }}>{error}</p>
        <p style={{ fontSize: "1rem", marginTop: 8 }}>
          Check that the app is set up and the sheet is ready.
        </p>
      </main>
    );
  }

  if (!dayData) {
    return (
      <main style={mainStyle}>
        <p>Loading…</p>
      </main>
    );
  }

  const dayName = DAY_NAMES[dayData.day] ?? dayData.day;
  const displayDate = new Date(date + "T12:00:00").toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <main style={mainStyle}>
      <h1 style={h1Style}>Chores Today</h1>
      <p style={dateStyle}>{displayDate}</p>
      {!dayData.holiday && <SyncStatus />}
      {dayData.holiday ? (
        <p style={{ fontSize: "1.25rem", color: "#666" }}>Holiday. No chores.</p>
      ) : (
        <TaskList date={dayData.date} initialTasks={dayData.tasks} />
      )}
      <p style={linkStyle}>
        <Link href="/days">See other days</Link>
      </p>
    </main>
  );
}

const mainStyle: React.CSSProperties = {
  maxWidth: 560,
  margin: "0 auto",
  padding: "24px 20px 48px",
  minHeight: "100vh",
};

const h1Style: React.CSSProperties = {
  fontSize: "1.75rem",
  fontWeight: 700,
  margin: "0 0 8px",
};

const dateStyle: React.CSSProperties = {
  fontSize: "1.15rem",
  color: "#555",
  margin: "0 0 24px",
};

const linkStyle: React.CSSProperties = {
  marginTop: 32,
  fontSize: "1.1rem",
};
