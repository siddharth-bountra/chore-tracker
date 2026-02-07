import Link from "next/link";
import { getDayByDow } from "@/app/lib/api";
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

  let tasks: { taskId: string; text: string }[] = [];
  try {
    const data = await getDayByDow(upper);
    tasks = data.tasks;
  } catch (e) {
    return (
      <main style={mainStyle}>
        <h1 style={h1Style}>{DAY_NAMES[upper]}</h1>
        <p style={{ fontSize: "1.2rem", color: "#c00" }}>
          {e instanceof Error ? e.message : "Could not load tasks."}
        </p>
        <p style={linkStyle}>
          <Link href="/days">See other days</Link>
        </p>
      </main>
    );
  }

  const initialTasks = tasks.map((t) => ({
    taskId: t.taskId,
    text: t.text,
    completed: false,
  }));

  return (
    <main style={mainStyle}>
      <h1 style={h1Style}>{DAY_NAMES[upper]}</h1>
      <TaskList
        date=""
        initialTasks={initialTasks}
        readOnly
        numbered
      />
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
  margin: "0 0 24px",
};

const linkStyle: React.CSSProperties = {
  marginTop: 32,
  fontSize: "1.1rem",
};
