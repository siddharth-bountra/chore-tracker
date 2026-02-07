import Link from "next/link";

const DAYS: { dow: string; label: string }[] = [
  { dow: "MON", label: "Monday" },
  { dow: "TUE", label: "Tuesday" },
  { dow: "WED", label: "Wednesday" },
  { dow: "THU", label: "Thursday" },
  { dow: "FRI", label: "Friday" },
  { dow: "SAT", label: "Saturday" },
  { dow: "SUN", label: "Sunday" },
];

export default function DaysPage() {
  return (
    <main style={mainStyle}>
      <h1 style={h1Style}>Pick a day</h1>
      <p style={subStyle}>See chores for that day this week.</p>
      <div style={gridStyle}>
        {DAYS.map(({ dow, label }) =>
          dow === "SUN" ? (
            <div key={dow} style={buttonWrapStyle}>
              <span style={holidayStyle}>Holiday</span>
              <span style={labelSmallStyle}>{label}</span>
            </div>
          ) : (
            <a key={dow} href={`/day/${dow}`} style={linkStyle}>
              <span style={buttonStyle}>{label}</span>
            </a>
          )
        )}
      </div>
      <p style={backStyle}>
        <Link href="/">Back to today</Link>
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

const subStyle: React.CSSProperties = {
  fontSize: "1rem",
  color: "#555",
  margin: "0 0 24px",
};

const gridStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const linkStyle: React.CSSProperties = {
  display: "block",
  textDecoration: "none",
  color: "inherit",
  cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
};

const buttonStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "18px 20px",
  minHeight: 48,
  fontSize: "1.25rem",
  fontWeight: 600,
  textAlign: "left",
  background: "#fff",
  border: "2px solid #ddd",
  borderRadius: 10,
  cursor: "pointer",
};

const buttonWrapStyle: React.CSSProperties = {
  padding: "18px 20px",
  background: "#f0f0f0",
  borderRadius: 10,
  border: "2px solid #e0e0e0",
};

const holidayStyle: React.CSSProperties = {
  fontSize: "1.25rem",
  fontWeight: 600,
  color: "#666",
};

const labelSmallStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.95rem",
  color: "#888",
  marginTop: 4,
};

const backStyle: React.CSSProperties = {
  marginTop: 28,
  fontSize: "1.1rem",
};
