import { Schema } from "effect"
import { CandidateId, OrganizationId, ApplicationId, JobId, PipelineStageId } from "./ids.js"

// Candidate source
export const CandidateSource = Schema.Literal("applied", "sourced", "referred", "agency", "internal")
export type CandidateSource = typeof CandidateSource.Type

// Candidate
export const Candidate = Schema.Struct({
  id: CandidateId,
  organizationId: OrganizationId,
  email: Schema.String,
  firstName: Schema.String,
  lastName: Schema.String,
  phone: Schema.optional(Schema.String),
  linkedinUrl: Schema.optional(Schema.String),
  resumeUrl: Schema.optional(Schema.String),
  source: CandidateSource,
  sourceDetails: Schema.optional(Schema.String),
  tags: Schema.Array(Schema.String),
  createdAt: Schema.String,
  updatedAt: Schema.String,
})
export type Candidate = typeof Candidate.Type

export const CreateCandidateInput = Schema.Struct({
  email: Schema.String,
  firstName: Schema.String,
  lastName: Schema.String,
  phone: Schema.optional(Schema.String),
  linkedinUrl: Schema.optional(Schema.String),
  source: CandidateSource,
  sourceDetails: Schema.optional(Schema.String),
  tags: Schema.optional(Schema.Array(Schema.String)),
})
export type CreateCandidateInput = typeof CreateCandidateInput.Type

export const UpdateCandidateInput = Schema.partial(CreateCandidateInput)
export type UpdateCandidateInput = typeof UpdateCandidateInput.Type

// Application status
export const ApplicationStatus = Schema.Literal("active", "hired", "rejected", "withdrawn")
export type ApplicationStatus = typeof ApplicationStatus.Type

// AI screening score
export const AIScore = Schema.Struct({
  overall: Schema.Number,
  skills: Schema.Number,
  experience: Schema.Number,
  culture: Schema.Number,
  reasoning: Schema.String,
})
export type AIScore = typeof AIScore.Type

// Application (links candidate to job)
export const Application = Schema.Struct({
  id: ApplicationId,
  candidateId: CandidateId,
  jobId: JobId,
  organizationId: OrganizationId,
  currentStageId: PipelineStageId,
  status: ApplicationStatus,
  appliedAt: Schema.String,
  movedToStageAt: Schema.String,
  rejectionReason: Schema.optional(Schema.String),
  rating: Schema.optional(Schema.Number),
  aiScore: Schema.optional(AIScore),
})
export type Application = typeof Application.Type

export const CreateApplicationInput = Schema.Struct({
  candidateId: CandidateId,
  jobId: JobId,
  stageId: Schema.optional(PipelineStageId),
})
export type CreateApplicationInput = typeof CreateApplicationInput.Type

export const MoveApplicationInput = Schema.Struct({
  stageId: PipelineStageId,
})
export type MoveApplicationInput = typeof MoveApplicationInput.Type
