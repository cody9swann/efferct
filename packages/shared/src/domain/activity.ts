import { Schema } from "effect"
import { ActivityId, OrganizationId, ApplicationId, CandidateId, UserId, NoteId } from "./ids.js"

// Activity type
export const ActivityType = Schema.Literal(
  "application_created",
  "stage_changed",
  "email_sent",
  "email_received",
  "note_added",
  "interview_scheduled",
  "scorecard_submitted",
  "offer_sent",
  "offer_accepted",
  "offer_rejected",
  "status_changed",
  "ai_screening_completed"
)
export type ActivityType = typeof ActivityType.Type

// Activity (audit log / timeline entry)
export const Activity = Schema.Struct({
  id: ActivityId,
  organizationId: OrganizationId,
  applicationId: Schema.optional(ApplicationId),
  candidateId: CandidateId,
  type: ActivityType,
  actorId: Schema.optional(UserId), // null for system/AI actions
  metadata: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
  createdAt: Schema.String,
})
export type Activity = typeof Activity.Type

// Note
export const Note = Schema.Struct({
  id: NoteId,
  organizationId: OrganizationId,
  candidateId: CandidateId,
  applicationId: Schema.optional(ApplicationId),
  authorId: UserId,
  content: Schema.String,
  isPrivate: Schema.Boolean,
  mentionedUserIds: Schema.Array(UserId),
  createdAt: Schema.String,
  updatedAt: Schema.String,
})
export type Note = typeof Note.Type

export const CreateNoteInput = Schema.Struct({
  candidateId: CandidateId,
  applicationId: Schema.optional(ApplicationId),
  content: Schema.String,
  isPrivate: Schema.optional(Schema.Boolean),
  mentionedUserIds: Schema.optional(Schema.Array(UserId)),
})
export type CreateNoteInput = typeof CreateNoteInput.Type
