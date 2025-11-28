import { Atom } from "@effect-atom/atom-react";
import { Effect } from "effect";
import type {
  Job,
  Candidate,
  Application,
  PipelineStage,
  Interview,
  Scorecard,
  Note,
  Activity,
  CreateJobInput,
  CreateCandidateInput,
  CreateApplicationInput,
  CreateInterviewInput,
  CreateScorecardInput,
  CreateNoteInput,
} from "@ats/shared";

const API_BASE = "http://localhost:3001/api";

// ============================================
// ERROR HANDLING
// ============================================

interface ErrorResponse {
  message?: string;
}

function isErrorResponse(value: unknown): value is ErrorResponse {
  return typeof value === "object" && value !== null && "message" in value;
}

// ============================================
// FETCH HELPERS
// ============================================

const fetchJson = <T>(url: string, options?: RequestInit) =>
  Effect.gen(function* () {
    const res = yield* Effect.tryPromise({
      try: () => fetch(url, options),
      catch: (e) => new Error(`Fetch failed: ${e}`),
    });
    if (!res.ok) {
      const error = yield* Effect.tryPromise({
        try: () => res.json().catch(() => ({ message: res.statusText })),
        catch: () => ({ message: res.statusText }),
      });
      const errorMessage = isErrorResponse(error) ? error.message : undefined;
      return yield* Effect.fail(new Error(errorMessage ?? `HTTP ${res.status}`));
    }
    const json = yield* Effect.tryPromise({
      try: () => res.json() as Promise<T>,
      catch: (e) => new Error(`JSON parse failed: ${e}`),
    });
    return json;
  });

const postJson = <T>(url: string, data: unknown) =>
  fetchJson<T>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

const patchJson = <T>(url: string, data: unknown) =>
  fetchJson<T>(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

const deleteRequest = (url: string) =>
  Effect.gen(function* () {
    const res = yield* Effect.tryPromise({
      try: () => fetch(url, { method: "DELETE" }),
      catch: (e) => new Error(`Fetch failed: ${e}`),
    });
    if (!res.ok) {
      const error = yield* Effect.tryPromise({
        try: () => res.json().catch(() => ({ message: res.statusText })),
        catch: () => ({ message: res.statusText }),
      });
      const errorMessage = isErrorResponse(error) ? error.message : undefined;
      return yield* Effect.fail(new Error(errorMessage ?? `HTTP ${res.status}`));
    }
  });

// ============================================
// LIST ATOMS
// ============================================

export const jobsAtom = Atom.make(
  fetchJson<Job[]>(`${API_BASE}/jobs`)
);

export const candidatesAtom = Atom.make(
  fetchJson<Candidate[]>(`${API_BASE}/candidates`)
);

export const applicationsAtom = Atom.make(
  fetchJson<Application[]>(`${API_BASE}/applications`)
);

export const interviewsAtom = Atom.make(
  fetchJson<Interview[]>(`${API_BASE}/interviews`)
);

export const scorecardsAtom = Atom.make(
  fetchJson<Scorecard[]>(`${API_BASE}/scorecards`)
);

export const notesAtom = Atom.make(
  fetchJson<Note[]>(`${API_BASE}/notes`)
);

export const activitiesAtom = Atom.make(
  fetchJson<Activity[]>(`${API_BASE}/activities`)
);

// ============================================
// SINGLE RESOURCE ATOMS
// ============================================

export const jobAtom = Atom.family((id: string) =>
  Atom.make(fetchJson<Job>(`${API_BASE}/jobs/${id}`))
);

export const candidateAtom = Atom.family((id: string) =>
  Atom.make(fetchJson<Candidate>(`${API_BASE}/candidates/${id}`))
);

export const applicationAtom = Atom.family((id: string) =>
  Atom.make(fetchJson<Application>(`${API_BASE}/applications/${id}`))
);

export const interviewAtom = Atom.family((id: string) =>
  Atom.make(fetchJson<Interview>(`${API_BASE}/interviews/${id}`))
);

// ============================================
// RELATED DATA ATOMS
// ============================================

export const pipelineStagesAtom = Atom.family((jobId: string) =>
  Atom.make(fetchJson<PipelineStage[]>(`${API_BASE}/jobs/${jobId}/pipeline`))
);

export const applicationsByJobAtom = Atom.family((jobId: string) =>
  Atom.make(fetchJson<Application[]>(`${API_BASE}/applications/by-job/${jobId}`))
);

export const applicationsByCandidateAtom = Atom.family((candidateId: string) =>
  Atom.make(fetchJson<Application[]>(`${API_BASE}/applications/by-candidate/${candidateId}`))
);

export const interviewsByApplicationAtom = Atom.family((applicationId: string) =>
  Atom.make(fetchJson<Interview[]>(`${API_BASE}/applications/${applicationId}/interviews`))
);

export const scorecardsByInterviewAtom = Atom.family((interviewId: string) =>
  Atom.make(fetchJson<Scorecard[]>(`${API_BASE}/scorecards/by-interview/${interviewId}`))
);

export const notesByCandidateAtom = Atom.family((candidateId: string) =>
  Atom.make(fetchJson<Note[]>(`${API_BASE}/candidates/${candidateId}/notes`))
);

export const notesByApplicationAtom = Atom.family((applicationId: string) =>
  Atom.make(fetchJson<Note[]>(`${API_BASE}/applications/${applicationId}/notes`))
);

export const activitiesByCandidateAtom = Atom.family((candidateId: string) =>
  Atom.make(fetchJson<Activity[]>(`${API_BASE}/candidates/${candidateId}/activities`))
);

export const activitiesByApplicationAtom = Atom.family((applicationId: string) =>
  Atom.make(fetchJson<Activity[]>(`${API_BASE}/applications/${applicationId}/activities`))
);

// ============================================
// MUTATION EFFECTS
// ============================================

// Jobs
export const createJob = (data: CreateJobInput) =>
  postJson<Job>(`${API_BASE}/jobs`, data);

export const updateJob = (id: string, data: Partial<Job>) =>
  patchJson<Job>(`${API_BASE}/jobs/${id}`, data);

export const deleteJob = (id: string) =>
  deleteRequest(`${API_BASE}/jobs/${id}`);

// Candidates
export const createCandidate = (data: CreateCandidateInput) =>
  postJson<Candidate>(`${API_BASE}/candidates`, data);

export const updateCandidate = (id: string, data: Partial<Candidate>) =>
  patchJson<Candidate>(`${API_BASE}/candidates/${id}`, data);

export const deleteCandidate = (id: string) =>
  deleteRequest(`${API_BASE}/candidates/${id}`);

// Applications
export const createApplication = (data: CreateApplicationInput) =>
  postJson<Application>(`${API_BASE}/applications`, data);

export const moveApplicationStage = (applicationId: string, stageId: string) =>
  patchJson<Application>(`${API_BASE}/applications/${applicationId}/stage`, { stageId });

export const rejectApplication = (applicationId: string, reason?: string) =>
  postJson<Application>(`${API_BASE}/applications/${applicationId}/reject`, { reason });

export const withdrawApplication = (applicationId: string) =>
  postJson<Application>(`${API_BASE}/applications/${applicationId}/withdraw`, {});

// Interviews
export const scheduleInterview = (data: CreateInterviewInput) =>
  postJson<Interview>(`${API_BASE}/interviews`, data);

export const updateInterview = (id: string, data: Partial<Interview>) =>
  patchJson<Interview>(`${API_BASE}/interviews/${id}`, data);

export const deleteInterview = (id: string) =>
  deleteRequest(`${API_BASE}/interviews/${id}`);

// Scorecards
export const submitScorecard = (data: CreateScorecardInput) =>
  postJson<Scorecard>(`${API_BASE}/scorecards`, data);

export const updateScorecard = (id: string, data: Partial<Scorecard>) =>
  patchJson<Scorecard>(`${API_BASE}/scorecards/${id}`, data);

// Notes
export const createNote = (data: CreateNoteInput) =>
  postJson<Note>(`${API_BASE}/notes`, data);

export const updateNote = (id: string, data: Partial<Note>) =>
  patchJson<Note>(`${API_BASE}/notes/${id}`, data);

export const deleteNote = (id: string) =>
  deleteRequest(`${API_BASE}/notes/${id}`);
