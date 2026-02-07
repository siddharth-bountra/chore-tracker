import Link from "next/link";
import { getDay } from "@/app/lib/api";
import { TaskList } from "@/app/components/TaskList";

const DAY_NAMES: Record<string, string> = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
  SAT: "Saturday",
  SUN: "Sunday",
};

const DOW_OFFSET: Record<string, number> = {
  MON: 0,
  TUE: 1,
  WED: 2,
  THU: 3,
  FRI: 4,
  SAT: 5,
};

function getDateForDow(dow: string): string {
  const today = new Date();
  const jsDow = today.getDay();
  const daysToMonday = jsDow === 0 ? 6 : jsDow - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysToMonday);
  const offset = DOW_OFFSET[dow] ?? 0;
  const d = new Date(monday);
  d.setDate(monday.getDate() + offset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default async function DayPage({
  params,
}: {
  params: Promise<{ dow: string }>;
}) {
  const { dow } = await params;
  const upper = dow.toUpperCase();
  if (!DAY_NAMES[upper]) {
    return (
      <main style={mainStyle}>
        <p>Unknown day.</p>
        <Link href="/days">See other days</Link>
      </main>
    );
  }

  if (upper === "SUN") {
    return (
      <main style={mainStyle}>
        <h1 style={h1Style}>{DAY_NAMES.SUN}</h1>
        <p style={{ fontSize: "1.25rem", color: "#666" }}>Holiday. No chores.</p>
        <p style={linkStyle}>
          <Link href="/days">See other days</Link>
        </p>
      </main>
    );
  }

  const date = getDateForDow(upper);
  let dayData;
  let error = "";
  try {
    dayData = await getDay(date);
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load tasks.";
  }

  if (error) {
    return (
      <main style={mainStyle}>
        <h1 style={h1Style}>{DAY_NAMES[upper]}</h1>
        <p style={{ fontSize: "1.2rem", color: "#c00" }}>{error}</p>
        <p style={linkStyle}>
          <Link href="/days">See other days</Link>
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

  const displayDate = new Date(date + "T12:00:00").toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <main style={mainStyle}>
      <h1 style={h1Style}>{DAY_NAMES[upper]}</h1>
      <p style={dateStyle}>{displayDate}</p>
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
