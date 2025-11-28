import { Schema } from "effect"
import { JobId, OrganizationId, UserId, PipelineStageId } from "./ids.js"

// Job status
export const JobStatus = Schema.Literal("draft", "open", "paused", "closed", "archived")
export type JobStatus = typeof JobStatus.Type

// Employment type
export const EmploymentType = Schema.Literal("full_time", "part_time", "contract", "internship")
export type EmploymentType = typeof EmploymentType.Type

// Location type
export const LocationType = Schema.Literal("remote", "onsite", "hybrid")
export type LocationType = typeof LocationType.Type

export const JobLocation = Schema.Struct({
  type: LocationType,
  city: Schema.optional(Schema.String),
  country: Schema.optional(Schema.String),
})

export const SalaryRange = Schema.Struct({
  min: Schema.Number,
  max: Schema.Number,
  currency: Schema.String,
  period: Schema.Literal("yearly", "monthly", "hourly"),
})

// Job
export const Job = Schema.Struct({
  id: JobId,
  organizationId: OrganizationId,
  title: Schema.String,
  description: Schema.String,
  requirements: Schema.optional(Schema.String),
  status: JobStatus,
  employmentType: EmploymentType,
  location: JobLocation,
  salary: Schema.optional(SalaryRange),
  hiringManagerId: Schema.optional(UserId),
  recruiterId: Schema.optional(UserId),
  createdAt: Schema.String,
  updatedAt: Schema.String,
})
export type Job = typeof Job.Type

export const CreateJobInput = Schema.Struct({
  title: Schema.String,
  description: Schema.String,
  requirements: Schema.optional(Schema.String),
  employmentType: EmploymentType,
  location: JobLocation,
  salary: Schema.optional(SalaryRange),
  hiringManagerId: Schema.optional(UserId),
  recruiterId: Schema.optional(UserId),
})
export type CreateJobInput = typeof CreateJobInput.Type

export const UpdateJobInput = Schema.partial(CreateJobInput).pipe(
  Schema.extend(Schema.Struct({
    status: Schema.optional(JobStatus),
  }))
)
export type UpdateJobInput = typeof UpdateJobInput.Type

// Pipeline stage type
export const PipelineStageType = Schema.Literal(
  "sourced",
  "applied",
  "screening",
  "interview",
  "offer",
  "hired",
  "rejected"
)
export type PipelineStageType = typeof PipelineStageType.Type

// Pipeline stage
export const PipelineStage = Schema.Struct({
  id: PipelineStageId,
  jobId: JobId,
  name: Schema.String,
  order: Schema.Number,
  type: PipelineStageType,
})
export type PipelineStage = typeof PipelineStage.Type

export const CreatePipelineStageInput = Schema.Struct({
  jobId: JobId,
  name: Schema.String,
  order: Schema.Number,
  type: PipelineStageType,
})
export type CreatePipelineStageInput = typeof CreatePipelineStageInput.Type

// Default pipeline stages for new jobs
export const DEFAULT_PIPELINE_STAGES: Array<Omit<PipelineStage, "id" | "jobId">> = [
  { name: "Applied", order: 0, type: "applied" },
  { name: "Screening", order: 1, type: "screening" },
  { name: "Interview", order: 2, type: "interview" },
  { name: "Offer", order: 3, type: "offer" },
  { name: "Hired", order: 4, type: "hired" },
]
