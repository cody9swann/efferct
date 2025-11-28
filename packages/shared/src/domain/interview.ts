import { Schema } from "effect"
import { InterviewId, ApplicationId, OrganizationId, UserId, ScorecardId } from "./ids.js"

// Interview type
export const InterviewType = Schema.Literal(
  "phone_screen",
  "video",
  "onsite",
  "technical",
  "cultural",
  "executive"
)
export type InterviewType = typeof InterviewType.Type

// Interview status
export const InterviewStatus = Schema.Literal("scheduled", "completed", "cancelled", "no_show")
export type InterviewStatus = typeof InterviewStatus.Type

// Interview
export const Interview = Schema.Struct({
  id: InterviewId,
  applicationId: ApplicationId,
  organizationId: OrganizationId,
  type: InterviewType,
  scheduledAt: Schema.String,
  duration: Schema.Number, // minutes
  location: Schema.optional(Schema.String), // URL for video, address for onsite
  interviewerIds: Schema.Array(UserId),
  candidateConfirmed: Schema.Boolean,
  interviewerConfirmed: Schema.Boolean,
  meetingLink: Schema.optional(Schema.String),
  notes: Schema.optional(Schema.String),
  status: InterviewStatus,
  createdAt: Schema.String,
})
export type Interview = typeof Interview.Type

export const CreateInterviewInput = Schema.Struct({
  applicationId: ApplicationId,
  type: InterviewType,
  scheduledAt: Schema.String,
  duration: Schema.Number,
  location: Schema.optional(Schema.String),
  interviewerIds: Schema.Array(UserId),
  meetingLink: Schema.optional(Schema.String),
  notes: Schema.optional(Schema.String),
})
export type CreateInterviewInput = typeof CreateInterviewInput.Type

// Scorecard recommendation
export const ScorecardRecommendation = Schema.Literal(
  "strong_yes",
  "yes",
  "neutral",
  "no",
  "strong_no"
)
export type ScorecardRecommendation = typeof ScorecardRecommendation.Type

// Scorecard criteria
export const ScorecardCriteria = Schema.Struct({
  name: Schema.String,
  score: Schema.Number, // 1-5
  notes: Schema.optional(Schema.String),
})
export type ScorecardCriteria = typeof ScorecardCriteria.Type

// Scorecard
export const Scorecard = Schema.Struct({
  id: ScorecardId,
  interviewId: InterviewId,
  interviewerId: UserId,
  organizationId: OrganizationId,
  overallRating: Schema.Number, // 1-5
  recommendation: ScorecardRecommendation,
  criteria: Schema.Array(ScorecardCriteria),
  strengths: Schema.String,
  concerns: Schema.String,
  additionalNotes: Schema.optional(Schema.String),
  submittedAt: Schema.String,
})
export type Scorecard = typeof Scorecard.Type

export const CreateScorecardInput = Schema.Struct({
  interviewId: InterviewId,
  overallRating: Schema.Number,
  recommendation: ScorecardRecommendation,
  criteria: Schema.Array(ScorecardCriteria),
  strengths: Schema.String,
  concerns: Schema.String,
  additionalNotes: Schema.optional(Schema.String),
})
export type CreateScorecardInput = typeof CreateScorecardInput.Type
