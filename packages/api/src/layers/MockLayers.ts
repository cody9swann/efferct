import { Effect, Layer } from "effect"
import type {
  Job,
  JobId,
  OrganizationId,
  CreateJobInput,
  UpdateJobInput,
  PipelineStage,
  PipelineStageId,
  CreatePipelineStageInput,
  Candidate,
  CandidateId,
  CreateCandidateInput,
  UpdateCandidateInput,
  Application,
  ApplicationId,
  UserId,
  Interview,
  InterviewId,
  CreateInterviewInput,
  Scorecard,
  ScorecardId,
  CreateScorecardInput,
  Note,
  NoteId,
  CreateNoteInput,
  Activity,
  ActivityId,
  User,
  CreateUserInput,
  Organization,
} from "@ats/shared"
import { AuthService, UnauthorizedError, type CurrentUser } from "../services/auth/AuthService.ts"
import { JobRepository, PipelineStageRepository } from "../services/job/JobRepository.ts"
import { CandidateRepository } from "../services/candidate/CandidateRepository.ts"
import { ApplicationRepository } from "../services/application/ApplicationRepository.ts"
import { InterviewRepository, type UpdateInterviewInput } from "../services/interview/InterviewRepository.ts"
import { ScorecardRepository, type UpdateScorecardInput } from "../services/scorecard/ScorecardRepository.ts"
import { NoteRepository, type UpdateNoteInput } from "../services/note/NoteRepository.ts"
import { ActivityRepository } from "../services/activity/ActivityRepository.ts"
import { UserRepository, type UpdateUserInput } from "../services/user/UserRepository.ts"
import { OrganizationRepository, type UpdateOrganizationInput } from "../services/organization/OrganizationRepository.ts"

// Helper to generate IDs
const generateId = () => crypto.randomUUID()
const now = () => new Date().toISOString()

// Mock current user (hardcoded for development)
const MOCK_ORG_ID = "org_mock_123" as OrganizationId
const MOCK_USER: CurrentUser = {
  id: "user_mock_456" as UserId,
  organizationId: MOCK_ORG_ID,
  email: "dev@example.com",
  name: "Dev User",
  role: "admin",
}

// Auth Service Mock
export const AuthServiceMock = Layer.succeed(AuthService, {
  getCurrentUser: () => Effect.succeed(MOCK_USER),
  requireRole: (...roles) => {
    if (!roles.includes(MOCK_USER.role)) {
      return Effect.fail(new UnauthorizedError("Insufficient permissions"))
    }
    return Effect.void
  },
})

// Seed Data
const SEED_JOBS: Job[] = [
  {
    id: "job_1" as JobId,
    organizationId: MOCK_ORG_ID,
    title: "Senior Full Stack Engineer",
    description: "Build and scale our core platform using TypeScript, React, and Effect.",
    requirements: "5+ years experience with TypeScript and React. Experience with functional programming preferred.",
    status: "open",
    employmentType: "full_time",
    location: { type: "remote" },
    salary: { min: 150000, max: 200000, currency: "USD", period: "yearly" },
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "job_2" as JobId,
    organizationId: MOCK_ORG_ID,
    title: "Product Designer",
    description: "Design beautiful and intuitive user experiences for our ATS platform.",
    status: "open",
    employmentType: "full_time",
    location: { type: "hybrid", city: "San Francisco", country: "USA" },
    salary: { min: 120000, max: 160000, currency: "USD", period: "yearly" },
    createdAt: "2024-01-20T14:30:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
  },
  {
    id: "job_3" as JobId,
    organizationId: MOCK_ORG_ID,
    title: "DevOps Engineer",
    description: "Manage our cloud infrastructure and CI/CD pipelines.",
    status: "paused",
    employmentType: "full_time",
    location: { type: "remote" },
    createdAt: "2024-02-01T09:00:00Z",
    updatedAt: "2024-02-10T11:00:00Z",
  },
]

const SEED_CANDIDATES: Candidate[] = [
  {
    id: "cand_1" as CandidateId,
    organizationId: MOCK_ORG_ID,
    email: "alice.johnson@email.com",
    firstName: "Alice",
    lastName: "Johnson",
    phone: "+1-555-0101",
    linkedinUrl: "https://linkedin.com/in/alicejohnson",
    source: "applied",
    tags: ["senior", "typescript", "react"],
    createdAt: "2024-01-16T08:00:00Z",
    updatedAt: "2024-01-16T08:00:00Z",
  },
  {
    id: "cand_2" as CandidateId,
    organizationId: MOCK_ORG_ID,
    email: "bob.smith@email.com",
    firstName: "Bob",
    lastName: "Smith",
    source: "sourced",
    sourceDetails: "Found on LinkedIn",
    tags: ["design", "figma"],
    createdAt: "2024-01-21T10:30:00Z",
    updatedAt: "2024-01-21T10:30:00Z",
  },
  {
    id: "cand_3" as CandidateId,
    organizationId: MOCK_ORG_ID,
    email: "carol.williams@email.com",
    firstName: "Carol",
    lastName: "Williams",
    phone: "+1-555-0103",
    source: "referred",
    sourceDetails: "Referred by John Doe",
    tags: ["devops", "aws", "kubernetes"],
    createdAt: "2024-02-02T14:00:00Z",
    updatedAt: "2024-02-02T14:00:00Z",
  },
  {
    id: "cand_4" as CandidateId,
    organizationId: MOCK_ORG_ID,
    email: "david.lee@email.com",
    firstName: "David",
    lastName: "Lee",
    source: "applied",
    tags: ["fullstack", "node", "react"],
    createdAt: "2024-02-05T09:15:00Z",
    updatedAt: "2024-02-05T09:15:00Z",
  },
]

const SEED_STAGES: PipelineStage[] = [
  { id: "stage_1_1" as PipelineStageId, jobId: "job_1" as JobId, name: "Applied", order: 0, type: "applied" },
  { id: "stage_1_2" as PipelineStageId, jobId: "job_1" as JobId, name: "Phone Screen", order: 1, type: "screening" },
  { id: "stage_1_3" as PipelineStageId, jobId: "job_1" as JobId, name: "Technical", order: 2, type: "interview" },
  { id: "stage_1_4" as PipelineStageId, jobId: "job_1" as JobId, name: "Onsite", order: 3, type: "interview" },
  { id: "stage_1_5" as PipelineStageId, jobId: "job_1" as JobId, name: "Offer", order: 4, type: "offer" },
  { id: "stage_2_1" as PipelineStageId, jobId: "job_2" as JobId, name: "Applied", order: 0, type: "applied" },
  { id: "stage_2_2" as PipelineStageId, jobId: "job_2" as JobId, name: "Portfolio Review", order: 1, type: "screening" },
  { id: "stage_2_3" as PipelineStageId, jobId: "job_2" as JobId, name: "Design Challenge", order: 2, type: "interview" },
  { id: "stage_2_4" as PipelineStageId, jobId: "job_2" as JobId, name: "Final Interview", order: 3, type: "interview" },
]

const SEED_APPLICATIONS: Application[] = [
  {
    id: "app_1" as ApplicationId,
    candidateId: "cand_1" as CandidateId,
    jobId: "job_1" as JobId,
    organizationId: MOCK_ORG_ID,
    currentStageId: "stage_1_3" as PipelineStageId,
    status: "active",
    appliedAt: "2024-01-17T09:00:00Z",
    movedToStageAt: "2024-01-25T14:00:00Z",
  },
  {
    id: "app_2" as ApplicationId,
    candidateId: "cand_2" as CandidateId,
    jobId: "job_2" as JobId,
    organizationId: MOCK_ORG_ID,
    currentStageId: "stage_2_2" as PipelineStageId,
    status: "active",
    appliedAt: "2024-01-22T11:00:00Z",
    movedToStageAt: "2024-01-28T10:00:00Z",
  },
  {
    id: "app_3" as ApplicationId,
    candidateId: "cand_4" as CandidateId,
    jobId: "job_1" as JobId,
    organizationId: MOCK_ORG_ID,
    currentStageId: "stage_1_2" as PipelineStageId,
    status: "active",
    appliedAt: "2024-02-06T08:30:00Z",
    movedToStageAt: "2024-02-08T16:00:00Z",
  },
]

// Job Repository Mock
export const JobRepositoryMock = Layer.sync(JobRepository, () => {
  const jobs = new Map<string, Job>(SEED_JOBS.map(j => [j.id, j]))

  return {
    findById: (id: JobId, orgId: OrganizationId) =>
      Effect.sync(() => {
        const job = jobs.get(id)
        return job && job.organizationId === orgId ? job : null
      }),

    findAll: (orgId: OrganizationId) =>
      Effect.sync(() => [...jobs.values()].filter((j) => j.organizationId === orgId)),

    create: (orgId: OrganizationId, input: CreateJobInput) =>
      Effect.sync(() => {
        const job: Job = {
          id: generateId() as JobId,
          organizationId: orgId,
          title: input.title,
          description: input.description,
          requirements: input.requirements,
          status: "draft",
          employmentType: input.employmentType,
          location: input.location,
          salary: input.salary,
          hiringManagerId: input.hiringManagerId,
          recruiterId: input.recruiterId,
          createdAt: now(),
          updatedAt: now(),
        }
        jobs.set(job.id, job)
        return job
      }),

    update: (id: JobId, orgId: OrganizationId, input: UpdateJobInput) =>
      Effect.sync(() => {
        const existing = jobs.get(id)
        if (!existing || existing.organizationId !== orgId) return null
        const updated: Job = {
          ...existing,
          title: input.title ?? existing.title,
          description: input.description ?? existing.description,
          requirements: input.requirements ?? existing.requirements,
          status: input.status ?? existing.status,
          employmentType: input.employmentType ?? existing.employmentType,
          location: input.location ?? existing.location,
          salary: input.salary ?? existing.salary,
          hiringManagerId: input.hiringManagerId ?? existing.hiringManagerId,
          recruiterId: input.recruiterId ?? existing.recruiterId,
          updatedAt: now(),
        }
        jobs.set(id, updated)
        return updated
      }),

    delete: (id: JobId, orgId: OrganizationId) =>
      Effect.sync(() => {
        const existing = jobs.get(id)
        if (!existing || existing.organizationId !== orgId) return false
        return jobs.delete(id)
      }),
  }
})

// Pipeline Stage Repository Mock
export const PipelineStageRepositoryMock = Layer.sync(PipelineStageRepository, () => {
  const stages = new Map<string, PipelineStage>(SEED_STAGES.map(s => [s.id, s]))

  return {
    findByJobId: (jobId: JobId) =>
      Effect.sync(() =>
        [...stages.values()].filter((s) => s.jobId === jobId).sort((a, b) => a.order - b.order)
      ),

    findById: (id: PipelineStageId) => Effect.sync(() => stages.get(id) ?? null),

    create: (input: CreatePipelineStageInput & { id?: PipelineStageId }) =>
      Effect.sync(() => {
        const stage: PipelineStage = {
          id: (input.id ?? generateId()) as PipelineStageId,
          jobId: input.jobId,
          name: input.name,
          order: input.order,
          type: input.type,
        }
        stages.set(stage.id, stage)
        return stage
      }),

    createMany: (inputs: Array<CreatePipelineStageInput>) =>
      Effect.sync(() => {
        const created: PipelineStage[] = []
        for (const input of inputs) {
          const stage: PipelineStage = {
            id: generateId() as PipelineStageId,
            jobId: input.jobId,
            name: input.name,
            order: input.order,
            type: input.type,
          }
          stages.set(stage.id, stage)
          created.push(stage)
        }
        return created
      }),

    update: (id: PipelineStageId, input: Partial<PipelineStage>) =>
      Effect.sync(() => {
        const existing = stages.get(id)
        if (!existing) return null
        const updated: PipelineStage = {
          ...existing,
          name: input.name ?? existing.name,
          order: input.order ?? existing.order,
          type: input.type ?? existing.type,
        }
        stages.set(id, updated)
        return updated
      }),

    delete: (id: PipelineStageId) => Effect.sync(() => stages.delete(id)),

    deleteByJobId: (jobId: JobId) =>
      Effect.sync(() => {
        let count = 0
        for (const [id, stage] of stages) {
          if (stage.jobId === jobId) {
            stages.delete(id)
            count++
          }
        }
        return count
      }),
  }
})

// Candidate Repository Mock
export const CandidateRepositoryMock = Layer.sync(CandidateRepository, () => {
  const candidates = new Map<string, Candidate>(SEED_CANDIDATES.map(c => [c.id, c]))

  return {
    findById: (id: CandidateId, orgId: OrganizationId) =>
      Effect.sync(() => {
        const candidate = candidates.get(id)
        return candidate && candidate.organizationId === orgId ? candidate : null
      }),

    findByEmail: (email: string, orgId: OrganizationId) =>
      Effect.sync(() =>
        [...candidates.values()].find((c) => c.email === email && c.organizationId === orgId) ??
        null
      ),

    findAll: (orgId: OrganizationId) =>
      Effect.sync(() => [...candidates.values()].filter((c) => c.organizationId === orgId)),

    create: (orgId: OrganizationId, input: CreateCandidateInput) =>
      Effect.sync(() => {
        const candidate: Candidate = {
          id: generateId() as CandidateId,
          organizationId: orgId,
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          linkedinUrl: input.linkedinUrl,
          source: input.source,
          sourceDetails: input.sourceDetails,
          tags: input.tags ?? [],
          createdAt: now(),
          updatedAt: now(),
        }
        candidates.set(candidate.id, candidate)
        return candidate
      }),

    update: (id: CandidateId, orgId: OrganizationId, input: UpdateCandidateInput) =>
      Effect.sync(() => {
        const existing = candidates.get(id)
        if (!existing || existing.organizationId !== orgId) return null
        const updated: Candidate = {
          ...existing,
          email: input.email ?? existing.email,
          firstName: input.firstName ?? existing.firstName,
          lastName: input.lastName ?? existing.lastName,
          phone: input.phone ?? existing.phone,
          linkedinUrl: input.linkedinUrl ?? existing.linkedinUrl,
          source: input.source ?? existing.source,
          sourceDetails: input.sourceDetails ?? existing.sourceDetails,
          tags: input.tags ?? existing.tags,
          updatedAt: now(),
        }
        candidates.set(id, updated)
        return updated
      }),

    delete: (id: CandidateId, orgId: OrganizationId) =>
      Effect.sync(() => {
        const existing = candidates.get(id)
        if (!existing || existing.organizationId !== orgId) return false
        return candidates.delete(id)
      }),
  }
})

// Application Repository Mock
export const ApplicationRepositoryMock = Layer.sync(ApplicationRepository, () => {
  const applications = new Map<string, Application>(SEED_APPLICATIONS.map(a => [a.id, a]))

  return {
    findById: (id: ApplicationId, orgId: OrganizationId) =>
      Effect.sync(() => {
        const app = applications.get(id)
        return app && app.organizationId === orgId ? app : null
      }),

    findAll: (orgId: OrganizationId) =>
      Effect.sync(() => [...applications.values()].filter((a) => a.organizationId === orgId)),

    findByJobId: (jobId: JobId, orgId: OrganizationId) =>
      Effect.sync(() =>
        [...applications.values()].filter((a) => a.jobId === jobId && a.organizationId === orgId)
      ),

    findByCandidateId: (candidateId: CandidateId, orgId: OrganizationId) =>
      Effect.sync(() =>
        [...applications.values()].filter(
          (a) => a.candidateId === candidateId && a.organizationId === orgId
        )
      ),

    findByJobAndCandidate: (jobId: JobId, candidateId: CandidateId, orgId: OrganizationId) =>
      Effect.sync(() =>
        [...applications.values()].find(
          (a) => a.jobId === jobId && a.candidateId === candidateId && a.organizationId === orgId
        ) ?? null
      ),

    create: (
      orgId: OrganizationId,
      input: { candidateId: CandidateId; jobId: JobId },
      stageId: PipelineStageId
    ) =>
      Effect.sync(() => {
        const app: Application = {
          id: generateId() as ApplicationId,
          candidateId: input.candidateId,
          jobId: input.jobId,
          organizationId: orgId,
          currentStageId: stageId,
          status: "active",
          appliedAt: now(),
          movedToStageAt: now(),
        }
        applications.set(app.id, app)
        return app
      }),

    updateStage: (id: ApplicationId, orgId: OrganizationId, stageId: PipelineStageId) =>
      Effect.sync(() => {
        const existing = applications.get(id)
        if (!existing || existing.organizationId !== orgId) return null
        const updated: Application = {
          ...existing,
          currentStageId: stageId,
          movedToStageAt: now(),
        }
        applications.set(id, updated)
        return updated
      }),

    updateStatus: (
      id: ApplicationId,
      orgId: OrganizationId,
      status: Application["status"],
      rejectionReason?: string
    ) =>
      Effect.sync(() => {
        const existing = applications.get(id)
        if (!existing || existing.organizationId !== orgId) return null
        const updated: Application = {
          ...existing,
          status,
          rejectionReason,
        }
        applications.set(id, updated)
        return updated
      }),

    delete: (id: ApplicationId, orgId: OrganizationId) =>
      Effect.sync(() => {
        const existing = applications.get(id)
        if (!existing || existing.organizationId !== orgId) return false
        return applications.delete(id)
      }),
  }
})

// Seed Interviews
const SEED_INTERVIEWS: Interview[] = [
  {
    id: "int_1" as InterviewId,
    applicationId: "app_1" as ApplicationId,
    organizationId: MOCK_ORG_ID,
    type: "technical",
    scheduledAt: "2024-01-30T14:00:00Z",
    duration: 60,
    location: "https://zoom.us/j/123456789",
    interviewerIds: [MOCK_USER.id],
    meetingLink: "https://zoom.us/j/123456789",
    candidateConfirmed: true,
    interviewerConfirmed: true,
    notes: "Focus on system design and TypeScript proficiency",
    status: "completed",
    createdAt: "2024-01-25T10:00:00Z",
  },
  {
    id: "int_2" as InterviewId,
    applicationId: "app_1" as ApplicationId,
    organizationId: MOCK_ORG_ID,
    type: "onsite",
    scheduledAt: "2024-02-05T10:00:00Z",
    duration: 180,
    location: "123 Main St, San Francisco, CA",
    interviewerIds: [MOCK_USER.id],
    candidateConfirmed: true,
    interviewerConfirmed: false,
    status: "scheduled",
    createdAt: "2024-01-31T09:00:00Z",
  },
  {
    id: "int_3" as InterviewId,
    applicationId: "app_2" as ApplicationId,
    organizationId: MOCK_ORG_ID,
    type: "phone_screen",
    scheduledAt: "2024-01-29T15:00:00Z",
    duration: 30,
    meetingLink: "https://meet.google.com/abc-defg-hij",
    interviewerIds: [MOCK_USER.id],
    candidateConfirmed: true,
    interviewerConfirmed: true,
    status: "completed",
    createdAt: "2024-01-27T11:00:00Z",
  },
]

// Interview Repository Mock
export const InterviewRepositoryMock = Layer.sync(InterviewRepository, () => {
  const interviews = new Map<string, Interview>(SEED_INTERVIEWS.map(i => [i.id, i]))

  return {
    findById: (id: InterviewId, orgId: OrganizationId) =>
      Effect.sync(() => {
        const interview = interviews.get(id)
        return interview && interview.organizationId === orgId ? interview : null
      }),

    findAll: (orgId: OrganizationId) =>
      Effect.sync(() => [...interviews.values()].filter((i) => i.organizationId === orgId)),

    findByApplicationId: (applicationId: ApplicationId, orgId: OrganizationId) =>
      Effect.sync(() =>
        [...interviews.values()].filter(
          (i) => i.applicationId === applicationId && i.organizationId === orgId
        )
      ),

    create: (orgId: OrganizationId, input: CreateInterviewInput) =>
      Effect.sync(() => {
        const interview: Interview = {
          id: generateId() as InterviewId,
          organizationId: orgId,
          applicationId: input.applicationId,
          type: input.type,
          scheduledAt: input.scheduledAt,
          duration: input.duration,
          location: input.location,
          interviewerIds: input.interviewerIds,
          meetingLink: input.meetingLink,
          notes: input.notes,
          candidateConfirmed: false,
          interviewerConfirmed: false,
          status: "scheduled",
          createdAt: now(),
        }
        interviews.set(interview.id, interview)
        return interview
      }),

    update: (id: InterviewId, orgId: OrganizationId, input: UpdateInterviewInput) =>
      Effect.sync(() => {
        const existing = interviews.get(id)
        if (!existing || existing.organizationId !== orgId) return null
        const updated: Interview = {
          ...existing,
          scheduledAt: input.scheduledAt ?? existing.scheduledAt,
          duration: input.duration ?? existing.duration,
          location: input.location ?? existing.location,
          interviewerIds: (input.interviewerIds as UserId[]) ?? existing.interviewerIds,
          meetingLink: input.meetingLink ?? existing.meetingLink,
          notes: input.notes ?? existing.notes,
          status: input.status ?? existing.status,
          candidateConfirmed: input.candidateConfirmed ?? existing.candidateConfirmed,
          interviewerConfirmed: input.interviewerConfirmed ?? existing.interviewerConfirmed,
        }
        interviews.set(id, updated)
        return updated
      }),

    delete: (id: InterviewId, orgId: OrganizationId) =>
      Effect.sync(() => {
        const existing = interviews.get(id)
        if (!existing || existing.organizationId !== orgId) return false
        return interviews.delete(id)
      }),
  }
})

// Seed Scorecards
const SEED_SCORECARDS: Scorecard[] = [
  {
    id: "sc_1" as ScorecardId,
    interviewId: "int_1" as InterviewId,
    interviewerId: MOCK_USER.id,
    organizationId: MOCK_ORG_ID,
    overallRating: 4,
    recommendation: "yes",
    criteria: [
      { name: "Technical Skills", score: 4, notes: "Strong TypeScript knowledge" },
      { name: "System Design", score: 4, notes: "Good understanding of distributed systems" },
      { name: "Communication", score: 5, notes: "Excellent communication skills" },
    ],
    strengths: "Strong technical background, great communicator, good cultural fit",
    concerns: "Could benefit from more experience with Effect",
    submittedAt: "2024-01-30T16:00:00Z",
  },
  {
    id: "sc_2" as ScorecardId,
    interviewId: "int_3" as InterviewId,
    interviewerId: MOCK_USER.id,
    organizationId: MOCK_ORG_ID,
    overallRating: 3,
    recommendation: "neutral",
    criteria: [
      { name: "Design Skills", score: 4, notes: "Good portfolio" },
      { name: "Tool Proficiency", score: 3, notes: "Knows Figma well" },
      { name: "Communication", score: 3, notes: "Adequate" },
    ],
    strengths: "Good eye for design, strong portfolio",
    concerns: "Limited experience with design systems at scale",
    submittedAt: "2024-01-29T16:30:00Z",
  },
]

// Scorecard Repository Mock
export const ScorecardRepositoryMock = Layer.sync(ScorecardRepository, () => {
  const scorecards = new Map<string, Scorecard>(SEED_SCORECARDS.map(s => [s.id, s]))

  return {
    findById: (id: ScorecardId, orgId: OrganizationId) =>
      Effect.sync(() => {
        const scorecard = scorecards.get(id)
        return scorecard && scorecard.organizationId === orgId ? scorecard : null
      }),

    findAll: (orgId: OrganizationId) =>
      Effect.sync(() => [...scorecards.values()].filter((s) => s.organizationId === orgId)),

    findByInterviewId: (interviewId: InterviewId, orgId: OrganizationId) =>
      Effect.sync(() =>
        [...scorecards.values()].filter(
          (s) => s.interviewId === interviewId && s.organizationId === orgId
        )
      ),

    create: (orgId: OrganizationId, input: CreateScorecardInput) =>
      Effect.sync(() => {
        const scorecard: Scorecard = {
          id: generateId() as ScorecardId,
          organizationId: orgId,
          interviewId: input.interviewId,
          interviewerId: MOCK_USER.id,
          overallRating: input.overallRating,
          recommendation: input.recommendation,
          criteria: input.criteria as Scorecard["criteria"],
          strengths: input.strengths,
          concerns: input.concerns,
          additionalNotes: input.additionalNotes,
          submittedAt: now(),
        }
        scorecards.set(scorecard.id, scorecard)
        return scorecard
      }),

    update: (id: ScorecardId, orgId: OrganizationId, input: UpdateScorecardInput) =>
      Effect.sync(() => {
        const existing = scorecards.get(id)
        if (!existing || existing.organizationId !== orgId) return null
        const updated: Scorecard = {
          ...existing,
          overallRating: input.overallRating ?? existing.overallRating,
          recommendation: input.recommendation ?? existing.recommendation,
          criteria: (input.criteria as Scorecard["criteria"]) ?? existing.criteria,
          strengths: input.strengths ?? existing.strengths,
          concerns: input.concerns ?? existing.concerns,
          additionalNotes: input.additionalNotes ?? existing.additionalNotes,
        }
        scorecards.set(id, updated)
        return updated
      }),

    delete: (id: ScorecardId, orgId: OrganizationId) =>
      Effect.sync(() => {
        const existing = scorecards.get(id)
        if (!existing || existing.organizationId !== orgId) return false
        return scorecards.delete(id)
      }),
  }
})

// Seed Notes
const SEED_NOTES: Note[] = [
  {
    id: "note_1" as NoteId,
    organizationId: MOCK_ORG_ID,
    candidateId: "cand_1" as CandidateId,
    applicationId: "app_1" as ApplicationId,
    authorId: MOCK_USER.id,
    content: "Had a great phone screen with Alice. Very articulate and knowledgeable about TypeScript.",
    isPrivate: false,
    mentionedUserIds: [],
    createdAt: "2024-01-18T10:00:00Z",
    updatedAt: "2024-01-18T10:00:00Z",
  },
  {
    id: "note_2" as NoteId,
    organizationId: MOCK_ORG_ID,
    candidateId: "cand_2" as CandidateId,
    applicationId: "app_2" as ApplicationId,
    authorId: MOCK_USER.id,
    content: "Portfolio looks impressive. Schedule design challenge next.",
    isPrivate: false,
    mentionedUserIds: [],
    createdAt: "2024-01-23T14:00:00Z",
    updatedAt: "2024-01-23T14:00:00Z",
  },
  {
    id: "note_3" as NoteId,
    organizationId: MOCK_ORG_ID,
    candidateId: "cand_1" as CandidateId,
    authorId: MOCK_USER.id,
    content: "Salary expectations are within range. Discussed equity options.",
    isPrivate: true,
    mentionedUserIds: [],
    createdAt: "2024-01-25T11:00:00Z",
    updatedAt: "2024-01-25T11:00:00Z",
  },
]

// Note Repository Mock
export const NoteRepositoryMock = Layer.sync(NoteRepository, () => {
  const notes = new Map<string, Note>(SEED_NOTES.map(n => [n.id, n]))

  return {
    findById: (id: NoteId, orgId: OrganizationId) =>
      Effect.sync(() => {
        const note = notes.get(id)
        return note && note.organizationId === orgId ? note : null
      }),

    findAll: (orgId: OrganizationId) =>
      Effect.sync(() => [...notes.values()].filter((n) => n.organizationId === orgId)),

    findByCandidateId: (candidateId: CandidateId, orgId: OrganizationId) =>
      Effect.sync(() =>
        [...notes.values()].filter(
          (n) => n.candidateId === candidateId && n.organizationId === orgId
        )
      ),

    findByApplicationId: (applicationId: ApplicationId, orgId: OrganizationId) =>
      Effect.sync(() =>
        [...notes.values()].filter(
          (n) => n.applicationId === applicationId && n.organizationId === orgId
        )
      ),

    create: (orgId: OrganizationId, authorId: string, input: CreateNoteInput) =>
      Effect.sync(() => {
        const note: Note = {
          id: generateId() as NoteId,
          organizationId: orgId,
          candidateId: input.candidateId,
          applicationId: input.applicationId,
          authorId: authorId as UserId,
          content: input.content,
          isPrivate: input.isPrivate ?? false,
          mentionedUserIds: (input.mentionedUserIds ?? []) as UserId[],
          createdAt: now(),
          updatedAt: now(),
        }
        notes.set(note.id, note)
        return note
      }),

    update: (id: NoteId, orgId: OrganizationId, input: UpdateNoteInput) =>
      Effect.sync(() => {
        const existing = notes.get(id)
        if (!existing || existing.organizationId !== orgId) return null
        const updated: Note = {
          ...existing,
          content: input.content ?? existing.content,
          isPrivate: input.isPrivate ?? existing.isPrivate,
          mentionedUserIds: (input.mentionedUserIds as UserId[]) ?? existing.mentionedUserIds,
          updatedAt: now(),
        }
        notes.set(id, updated)
        return updated
      }),

    delete: (id: NoteId, orgId: OrganizationId) =>
      Effect.sync(() => {
        const existing = notes.get(id)
        if (!existing || existing.organizationId !== orgId) return false
        return notes.delete(id)
      }),
  }
})

// Seed Activities
const SEED_ACTIVITIES: Activity[] = [
  {
    id: "act_1" as ActivityId,
    organizationId: MOCK_ORG_ID,
    candidateId: "cand_1" as CandidateId,
    applicationId: "app_1" as ApplicationId,
    type: "application_created",
    actorId: MOCK_USER.id,
    metadata: { jobTitle: "Senior Full Stack Engineer" },
    createdAt: "2024-01-17T09:00:00Z",
  },
  {
    id: "act_2" as ActivityId,
    organizationId: MOCK_ORG_ID,
    candidateId: "cand_1" as CandidateId,
    applicationId: "app_1" as ApplicationId,
    type: "stage_changed",
    actorId: MOCK_USER.id,
    metadata: { fromStage: "Applied", toStage: "Phone Screen" },
    createdAt: "2024-01-18T14:00:00Z",
  },
  {
    id: "act_3" as ActivityId,
    organizationId: MOCK_ORG_ID,
    candidateId: "cand_1" as CandidateId,
    applicationId: "app_1" as ApplicationId,
    type: "interview_scheduled",
    actorId: MOCK_USER.id,
    metadata: { interviewType: "technical", scheduledAt: "2024-01-30T14:00:00Z" },
    createdAt: "2024-01-25T10:00:00Z",
  },
  {
    id: "act_4" as ActivityId,
    organizationId: MOCK_ORG_ID,
    candidateId: "cand_1" as CandidateId,
    applicationId: "app_1" as ApplicationId,
    type: "scorecard_submitted",
    actorId: MOCK_USER.id,
    metadata: { recommendation: "yes", overallRating: 4 },
    createdAt: "2024-01-30T16:00:00Z",
  },
  {
    id: "act_5" as ActivityId,
    organizationId: MOCK_ORG_ID,
    candidateId: "cand_2" as CandidateId,
    applicationId: "app_2" as ApplicationId,
    type: "application_created",
    actorId: MOCK_USER.id,
    metadata: { jobTitle: "Product Designer" },
    createdAt: "2024-01-22T11:00:00Z",
  },
]

// Activity Repository Mock (read-only + internal create)
export const ActivityRepositoryMock = Layer.sync(ActivityRepository, () => {
  const activities = new Map<string, Activity>(SEED_ACTIVITIES.map(a => [a.id, a]))

  return {
    findById: (id: ActivityId, orgId: OrganizationId) =>
      Effect.sync(() => {
        const activity = activities.get(id)
        return activity && activity.organizationId === orgId ? activity : null
      }),

    findAll: (orgId: OrganizationId) =>
      Effect.sync(() =>
        [...activities.values()]
          .filter((a) => a.organizationId === orgId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      ),

    findByCandidateId: (candidateId: CandidateId, orgId: OrganizationId) =>
      Effect.sync(() =>
        [...activities.values()]
          .filter((a) => a.candidateId === candidateId && a.organizationId === orgId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      ),

    findByApplicationId: (applicationId: ApplicationId, orgId: OrganizationId) =>
      Effect.sync(() =>
        [...activities.values()]
          .filter((a) => a.applicationId === applicationId && a.organizationId === orgId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      ),

    create: (activity: Activity) =>
      Effect.sync(() => {
        activities.set(activity.id, activity)
        return activity
      }),
  }
})

// Seed Users
const SEED_USERS: User[] = [
  {
    id: MOCK_USER.id,
    organizationId: MOCK_ORG_ID,
    email: "dev@example.com",
    name: "Dev User",
    role: "admin",
    isActive: true,
    lastLoginAt: "2024-02-10T08:00:00Z",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "user_recruiter_1" as UserId,
    organizationId: MOCK_ORG_ID,
    email: "sarah.recruiter@example.com",
    name: "Sarah Recruiter",
    role: "recruiter",
    isActive: true,
    lastLoginAt: "2024-02-09T14:00:00Z",
    createdAt: "2024-01-05T10:00:00Z",
  },
  {
    id: "user_hiring_mgr_1" as UserId,
    organizationId: MOCK_ORG_ID,
    email: "mike.manager@example.com",
    name: "Mike Manager",
    role: "hiring_manager",
    isActive: true,
    createdAt: "2024-01-10T09:00:00Z",
  },
]

// User Repository Mock
export const UserRepositoryMock = Layer.sync(UserRepository, () => {
  const users = new Map<string, User>(SEED_USERS.map(u => [u.id, u]))

  return {
    findById: (id: UserId, orgId: OrganizationId) =>
      Effect.sync(() => {
        const user = users.get(id)
        return user && user.organizationId === orgId ? user : null
      }),

    findByEmail: (email: string, orgId: OrganizationId) =>
      Effect.sync(() =>
        [...users.values()].find((u) => u.email === email && u.organizationId === orgId) ?? null
      ),

    findAll: (orgId: OrganizationId) =>
      Effect.sync(() => [...users.values()].filter((u) => u.organizationId === orgId)),

    create: (orgId: OrganizationId, input: CreateUserInput) =>
      Effect.sync(() => {
        const user: User = {
          id: generateId() as UserId,
          organizationId: orgId,
          email: input.email,
          name: input.name,
          role: input.role,
          isActive: true,
          createdAt: now(),
        }
        users.set(user.id, user)
        return user
      }),

    update: (id: UserId, orgId: OrganizationId, input: UpdateUserInput) =>
      Effect.sync(() => {
        const existing = users.get(id)
        if (!existing || existing.organizationId !== orgId) return null
        const updated: User = {
          ...existing,
          name: input.name ?? existing.name,
          role: input.role ?? existing.role,
          avatarUrl: input.avatarUrl ?? existing.avatarUrl,
          isActive: input.isActive ?? existing.isActive,
        }
        users.set(id, updated)
        return updated
      }),

    delete: (id: UserId, orgId: OrganizationId) =>
      Effect.sync(() => {
        const existing = users.get(id)
        if (!existing || existing.organizationId !== orgId) return false
        return users.delete(id)
      }),
  }
})

// Seed Organization
const SEED_ORGANIZATION: Organization = {
  id: MOCK_ORG_ID,
  name: "Acme Corp",
  slug: "acme-corp",
  plan: "growth",
  settings: {
    timezone: "America/Los_Angeles",
    dateFormat: "MM/DD/YYYY",
    brandingColor: "#4F46E5",
  },
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
}

// Organization Repository Mock
export const OrganizationRepositoryMock = Layer.sync(OrganizationRepository, () => {
  const organizations = new Map<string, Organization>([[SEED_ORGANIZATION.id, SEED_ORGANIZATION]])

  return {
    findById: (id: OrganizationId) =>
      Effect.sync(() => organizations.get(id) ?? null),

    update: (id: OrganizationId, input: UpdateOrganizationInput) =>
      Effect.sync(() => {
        const existing = organizations.get(id)
        if (!existing) return null
        const updated: Organization = {
          ...existing,
          name: input.name ?? existing.name,
          settings: {
            ...existing.settings,
            timezone: input.settings?.timezone ?? existing.settings.timezone,
            dateFormat: input.settings?.dateFormat ?? existing.settings.dateFormat,
            brandingColor: input.settings?.brandingColor ?? existing.settings.brandingColor,
          },
          updatedAt: now(),
        }
        organizations.set(id, updated)
        return updated
      }),
  }
})

// Compose all mock layers
export const MockRepositories = Layer.mergeAll(
  JobRepositoryMock,
  PipelineStageRepositoryMock,
  CandidateRepositoryMock,
  ApplicationRepositoryMock,
  InterviewRepositoryMock,
  ScorecardRepositoryMock,
  NoteRepositoryMock,
  ActivityRepositoryMock,
  UserRepositoryMock,
  OrganizationRepositoryMock
)

export const MockLayers = Layer.mergeAll(AuthServiceMock, MockRepositories)
