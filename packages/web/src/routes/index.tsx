import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Dashboard</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <StatCard label="Open Jobs" value="0" />
        <StatCard label="Active Candidates" value="0" />
        <StatCard label="Applications This Week" value="0" />
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "#1a1a1a",
        border: "1px solid #333",
        borderRadius: 8,
        padding: 20,
      }}
    >
      <div style={{ color: "#888", fontSize: 14, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 600 }}>{value}</div>
    </div>
  )
}
