export default function RootLoading() {
  return (
    <main
      style={{
        maxWidth: 560,
        margin: "0 auto",
        padding: "24px 20px 48px",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          height: 32,
          width: "50%",
          background: "#e0e0e0",
          borderRadius: 6,
          marginBottom: 24,
        }}
      />
      <div
        style={{
          height: 24,
          width: "70%",
          background: "#eee",
          borderRadius: 6,
          marginBottom: 32,
        }}
      />
      <p style={{ fontSize: "1.1rem", color: "#666" }}>Loading tasks…</p>
    </main>
  );
}
