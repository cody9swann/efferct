import { createFileRoute } from "@tanstack/react-router"
import { Result, useAtomValue } from "@effect-atom/atom-react"
import { candidatesAtom } from "../../atoms/api"
import type { Candidate } from "@ats/shared"

export const Route = createFileRoute("/candidates/")({
  component: CandidatesPage,
})

function CandidatesPage() {
  const result = useAtomValue(candidatesAtom)

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h1>Candidates</h1>
        <button
          style={{
            background: "#fff",
            color: "#000",
            padding: "8px 16px",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          + Add Candidate
        </button>
      </div>
      {Result.builder(result)
        .onInitial(() => <div style={{ color: "#888" }}>Loading candidates...</div>)
        .onSuccess((data) => <CandidatesList candidates={data} />)
        .onFailure((err) => <div style={{ color: "#f87171" }}>Error: {String(err)}</div>)
        .onDefect(() => <div style={{ color: "#f87171" }}>Crash!</div>)
        .render()}
    </div>
  )
}

function CandidatesList({ candidates }: { candidates: Candidate[] }) {
  if (candidates.length === 0) {
    return <div style={{ color: "#888" }}>No candidates yet. Add your first candidate!</div>
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {candidates.map((candidate: Candidate) => (
        <div
          key={candidate.id}
          style={{
            display: "block",
            background: "#1a1a1a",
            border: "1px solid #333",
            borderRadius: 8,
            padding: 16,
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>
                {candidate.firstName} {candidate.lastName}
              </div>
              <div style={{ color: "#888", fontSize: 14 }}>
                {candidate.email}
              </div>
            </div>
            <SourceBadge source={candidate.source} />
          </div>
          {candidate.tags.length > 0 && (
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              {candidate.tags.map((tag: string) => (
                <span
                  key={tag}
                  style={{
                    background: "#333",
                    color: "#888",
                    padding: "2px 8px",
                    borderRadius: 4,
                    fontSize: 12,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function SourceBadge({ source }: { source: Candidate["source"] }) {
  const colors: Record<Candidate["source"], { bg: string; text: string }> = {
    applied: { bg: "#166534", text: "#4ade80" },
    sourced: { bg: "#1e3a8a", text: "#60a5fa" },
    referred: { bg: "#854d0e", text: "#fbbf24" },
    agency: { bg: "#7c2d12", text: "#fb923c" },
    internal: { bg: "#333", text: "#888" },
  }
  const { bg, text } = colors[source]
  return (
    <span
      style={{
        background: bg,
        color: text,
        padding: "4px 8px",
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 500,
        textTransform: "capitalize",
      }}
    >
      {source}
    </span>
  )
}
