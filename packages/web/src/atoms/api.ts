import { Atom, Result } from "@effect-atom/atom-react"
import { Effect, Schema } from "effect"
import type { Job, Candidate, Application, CreateJobInput, UpdateJobInput, CreateCandidateInput, UpdateCandidateInput, CreateApplicationInput } from "@ats/shared"

const API_BASE = "http://localhost:3001/api"

// Generic fetch helper
const fetchApi = <A>(
  url: string,
  schema: Schema.Schema<A>,
  options?: RequestInit
): Effect.Effect<A, Error> =>
  Effect.tryPromise({
    try: async () => {
      const res = await fetch(`${API_BASE}${url}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
    catch: (e) => new Error(String(e)),
  }).pipe(
    Effect.flatMap((data) =>
      Schema.decodeUnknown(schema)(data).pipe(
        Effect.mapError((e) => new Error(`Decode error: ${e.message}`))
      )
    )
  )

// Jobs atoms
export const jobsAtom = Atom.make(
  Effect.gen(function* () {
    const res = yield* Effect.tryPromise({
      try: () => fetch(`${API_BASE}/jobs`),
      catch: (e) => new Error(`Fetch failed: ${e}`),
    })
    const json = yield* Effect.tryPromise({
      try: () => res.json() as Promise<Job[]>,
      catch: (e) => new Error(`JSON parse failed: ${e}`),
    })
    return json
  })
)

export const jobAtom = Atom.family((id: string) =>
  Atom.make(
    Effect.tryPromise({
      try: () => fetch(`${API_BASE}/jobs/${id}`).then((r) => r.json()),
      catch: (e) => new Error(String(e)),
    })
  )
)

// Candidates atoms
export const candidatesAtom = Atom.make(
  Effect.gen(function* () {
    const res = yield* Effect.tryPromise({
      try: () => fetch(`${API_BASE}/candidates`),
      catch: (e) => new Error(`Fetch failed: ${e}`),
    })
    const json = yield* Effect.tryPromise({
      try: () => res.json() as Promise<Candidate[]>,
      catch: (e) => new Error(`JSON parse failed: ${e}`),
    })
    return json
  })
)

export const candidateAtom = Atom.family((id: string) =>
  Atom.make(
    Effect.tryPromise({
      try: () => fetch(`${API_BASE}/candidates/${id}`).then((r) => r.json()),
      catch: (e) => new Error(String(e)),
    })
  )
)

// Applications atoms
export const applicationsAtom = Atom.make(
  Effect.tryPromise({
    try: () => fetch(`${API_BASE}/applications`).then((r) => r.json()),
    catch: (e) => new Error(String(e)),
  })
)

export const applicationsByJobAtom = Atom.family((jobId: string) =>
  Atom.make(
    Effect.tryPromise({
      try: () => fetch(`${API_BASE}/applications/by-job/${jobId}`).then((r) => r.json()),
      catch: (e) => new Error(String(e)),
    })
  )
)

// Mutation atoms
export const createJobAtom = Atom.fn<CreateJobInput>()(
  (input) =>
    Effect.tryPromise({
      try: () =>
        fetch(`${API_BASE}/jobs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        }).then((r) => r.json()),
      catch: (e) => new Error(String(e)),
    })
)

export const updateJobAtom = Atom.fn<{ id: string; data: UpdateJobInput }>()(
  ({ id, data }) =>
    Effect.tryPromise({
      try: () =>
        fetch(`${API_BASE}/jobs/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }).then((r) => r.json()),
      catch: (e) => new Error(String(e)),
    })
)

export const deleteJobAtom = Atom.fn<string>()(
  (id) =>
    Effect.tryPromise({
      try: () =>
        fetch(`${API_BASE}/jobs/${id}`, { method: "DELETE" }).then(() => true),
      catch: (e) => new Error(String(e)),
    })
)

export const createCandidateAtom = Atom.fn<CreateCandidateInput>()(
  (input) =>
    Effect.tryPromise({
      try: () =>
        fetch(`${API_BASE}/candidates`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        }).then((r) => r.json()),
      catch: (e) => new Error(String(e)),
    })
)

export const createApplicationAtom = Atom.fn<CreateApplicationInput>()(
  (input) =>
    Effect.tryPromise({
      try: () =>
        fetch(`${API_BASE}/applications`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        }).then((r) => r.json()),
      catch: (e) => new Error(String(e)),
    })
)
