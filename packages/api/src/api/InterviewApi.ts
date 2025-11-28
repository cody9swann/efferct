import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Schema } from "effect"
import {
  Interview,
  InterviewId,
  ApplicationId,
  CreateInterviewInput,
  InterviewStatus,
  Scorecard,
} from "@ats/shared"

// Error schemas
const InterviewNotFoundErrorSchema = Schema.Struct({
  _tag: Schema.Literal("InterviewNotFoundError"),
  interviewId: Schema.String,
})

// Update interview input schema
const UpdateInterviewInput = Schema.Struct({
  scheduledAt: Schema.optional(Schema.String),
  duration: Schema.optional(Schema.Number),
  location: Schema.optional(Schema.String),
  interviewerIds: Schema.optional(Schema.Array(Schema.String)),
  meetingLink: Schema.optional(Schema.String),
  notes: Schema.optional(Schema.String),
  status: Schema.optional(InterviewStatus),
  candidateConfirmed: Schema.optional(Schema.Boolean),
  interviewerConfirmed: Schema.optional(Schema.Boolean),
})

// Interview API Group
export class InterviewApi extends HttpApiGroup.make("interviews")
  .add(
    HttpApiEndpoint.get("list", "/")
      .addSuccess(Schema.Array(Interview))
  )
  .add(
    HttpApiEndpoint.get("getInterview", "/:id")
      .addSuccess(Interview)
      .addError(InterviewNotFoundErrorSchema, { status: 404 })
      .setPath(Schema.Struct({ id: InterviewId }))
  )
  .add(
    HttpApiEndpoint.get("listByApplication", "/by-application/:applicationId")
      .addSuccess(Schema.Array(Interview))
      .setPath(Schema.Struct({ applicationId: ApplicationId }))
  )
  .add(
    HttpApiEndpoint.post("createInterview", "/")
      .addSuccess(Interview, { status: 201 })
      .setPayload(CreateInterviewInput)
  )
  .add(
    HttpApiEndpoint.patch("updateInterview", "/:id")
      .addSuccess(Interview)
      .addError(InterviewNotFoundErrorSchema, { status: 404 })
      .setPath(Schema.Struct({ id: InterviewId }))
      .setPayload(UpdateInterviewInput)
  )
  .add(
    HttpApiEndpoint.del("deleteInterview", "/:id")
      .addSuccess(Schema.Void)
      .addError(InterviewNotFoundErrorSchema, { status: 404 })
      .setPath(Schema.Struct({ id: InterviewId }))
  )
  .add(
    HttpApiEndpoint.get("listScorecards", "/:id/scorecards")
      .addSuccess(Schema.Array(Scorecard))
      .addError(InterviewNotFoundErrorSchema, { status: 404 })
      .setPath(Schema.Struct({ id: InterviewId }))
  )
  .prefix("/api/interviews") {}
