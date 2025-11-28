import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Schema } from "effect"
import {
  Scorecard,
  ScorecardId,
  InterviewId,
  CreateScorecardInput,
  ScorecardRecommendation,
  ScorecardCriteria,
} from "@ats/shared"

// Error schemas
const ScorecardNotFoundErrorSchema = Schema.Struct({
  _tag: Schema.Literal("ScorecardNotFoundError"),
  scorecardId: Schema.String,
})

// Update scorecard input schema
const UpdateScorecardInput = Schema.Struct({
  overallRating: Schema.optional(Schema.Number),
  recommendation: Schema.optional(ScorecardRecommendation),
  criteria: Schema.optional(Schema.Array(ScorecardCriteria)),
  strengths: Schema.optional(Schema.String),
  concerns: Schema.optional(Schema.String),
  additionalNotes: Schema.optional(Schema.String),
})

// Scorecard API Group
export class ScorecardApi extends HttpApiGroup.make("scorecards")
  .add(
    HttpApiEndpoint.get("list", "/")
      .addSuccess(Schema.Array(Scorecard))
  )
  .add(
    HttpApiEndpoint.get("getScorecard", "/:id")
      .addSuccess(Scorecard)
      .addError(ScorecardNotFoundErrorSchema, { status: 404 })
      .setPath(Schema.Struct({ id: ScorecardId }))
  )
  .add(
    HttpApiEndpoint.get("listByInterview", "/by-interview/:interviewId")
      .addSuccess(Schema.Array(Scorecard))
      .setPath(Schema.Struct({ interviewId: InterviewId }))
  )
  .add(
    HttpApiEndpoint.post("createScorecard", "/")
      .addSuccess(Scorecard, { status: 201 })
      .setPayload(CreateScorecardInput)
  )
  .add(
    HttpApiEndpoint.patch("updateScorecard", "/:id")
      .addSuccess(Scorecard)
      .addError(ScorecardNotFoundErrorSchema, { status: 404 })
      .setPath(Schema.Struct({ id: ScorecardId }))
      .setPayload(UpdateScorecardInput)
  )
  .add(
    HttpApiEndpoint.del("deleteScorecard", "/:id")
      .addSuccess(Schema.Void)
      .addError(ScorecardNotFoundErrorSchema, { status: 404 })
      .setPath(Schema.Struct({ id: ScorecardId }))
  )
  .prefix("/api/scorecards") {}
