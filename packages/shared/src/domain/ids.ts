import { Schema } from "effect"

// Branded ID types for type-safe entity references
export const OrganizationId = Schema.String.pipe(Schema.brand("OrganizationId"))
export type OrganizationId = typeof OrganizationId.Type

export const UserId = Schema.String.pipe(Schema.brand("UserId"))
export type UserId = typeof UserId.Type

export const JobId = Schema.String.pipe(Schema.brand("JobId"))
export type JobId = typeof JobId.Type

export const CandidateId = Schema.String.pipe(Schema.brand("CandidateId"))
export type CandidateId = typeof CandidateId.Type

export const ApplicationId = Schema.String.pipe(Schema.brand("ApplicationId"))
export type ApplicationId = typeof ApplicationId.Type

export const PipelineStageId = Schema.String.pipe(Schema.brand("PipelineStageId"))
export type PipelineStageId = typeof PipelineStageId.Type

export const InterviewId = Schema.String.pipe(Schema.brand("InterviewId"))
export type InterviewId = typeof InterviewId.Type

export const ScorecardId = Schema.String.pipe(Schema.brand("ScorecardId"))
export type ScorecardId = typeof ScorecardId.Type

export const ActivityId = Schema.String.pipe(Schema.brand("ActivityId"))
export type ActivityId = typeof ActivityId.Type

export const NoteId = Schema.String.pipe(Schema.brand("NoteId"))
export type NoteId = typeof NoteId.Type
