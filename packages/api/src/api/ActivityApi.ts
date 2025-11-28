import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Schema } from "effect"
import {
  Activity,
  ActivityId,
  CandidateId,
  ApplicationId,
} from "@ats/shared"

// Error schemas
const ActivityNotFoundErrorSchema = Schema.Struct({
  _tag: Schema.Literal("ActivityNotFoundError"),
  activityId: Schema.String,
})

// Activity API Group (read-only - activities are system-generated)
export class ActivityApi extends HttpApiGroup.make("activities")
  .add(
    HttpApiEndpoint.get("list", "/")
      .addSuccess(Schema.Array(Activity))
  )
  .add(
    HttpApiEndpoint.get("getActivity", "/:id")
      .addSuccess(Activity)
      .addError(ActivityNotFoundErrorSchema, { status: 404 })
      .setPath(Schema.Struct({ id: ActivityId }))
  )
  .add(
    HttpApiEndpoint.get("listByCandidate", "/by-candidate/:candidateId")
      .addSuccess(Schema.Array(Activity))
      .setPath(Schema.Struct({ candidateId: CandidateId }))
  )
  .add(
    HttpApiEndpoint.get("listByApplication", "/by-application/:applicationId")
      .addSuccess(Schema.Array(Activity))
      .setPath(Schema.Struct({ applicationId: ApplicationId }))
  )
  .prefix("/api/activities") {}
