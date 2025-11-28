import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Schema } from "effect"
import {
  Application,
  ApplicationId,
  JobId,
  CandidateId,
  CreateApplicationInput,
  MoveApplicationInput,
  Interview,
  Note,
  Activity,
} from "@ats/shared"

// Error schemas
const ApplicationNotFoundErrorSchema = Schema.Struct({
  _tag: Schema.Literal("ApplicationNotFoundError"),
  applicationId: Schema.String,
})

const ApplicationExistsErrorSchema = Schema.Struct({
  _tag: Schema.Literal("ApplicationExistsError"),
  jobId: Schema.String,
  candidateId: Schema.String,
})

const InvalidStageErrorSchema = Schema.Struct({
  _tag: Schema.Literal("InvalidStageError"),
  stageId: Schema.String,
  jobId: Schema.String,
})

// Application API Group
export class ApplicationApi extends HttpApiGroup.make("applications")
  .add(
    HttpApiEndpoint.get("list", "/")
      .addSuccess(Schema.Array(Application))
  )
  .add(
    HttpApiEndpoint.get("getApplication", "/:id")
      .addSuccess(Application)
      .addError(ApplicationNotFoundErrorSchema, { status: 404 })
      .setPath(Schema.Struct({ id: ApplicationId }))
  )
  .add(
    HttpApiEndpoint.get("listByJob", "/by-job/:jobId")
      .addSuccess(Schema.Array(Application))
      .setPath(Schema.Struct({ jobId: JobId }))
  )
  .add(
    HttpApiEndpoint.get("listByCandidate", "/by-candidate/:candidateId")
      .addSuccess(Schema.Array(Application))
      .setPath(Schema.Struct({ candidateId: CandidateId }))
  )
  .add(
    HttpApiEndpoint.post("createApplication", "/")
      .addSuccess(Application, { status: 201 })
      .addError(ApplicationExistsErrorSchema, { status: 409 })
      .addError(InvalidStageErrorSchema, { status: 400 })
      .setPayload(CreateApplicationInput)
  )
  .add(
    HttpApiEndpoint.patch("moveToStage", "/:id/stage")
      .addSuccess(Application)
      .addError(ApplicationNotFoundErrorSchema, { status: 404 })
      .addError(InvalidStageErrorSchema, { status: 400 })
      .setPath(Schema.Struct({ id: ApplicationId }))
      .setPayload(MoveApplicationInput)
  )
  .add(
    HttpApiEndpoint.post("reject", "/:id/reject")
      .addSuccess(Application)
      .addError(ApplicationNotFoundErrorSchema, { status: 404 })
      .setPath(Schema.Struct({ id: ApplicationId }))
      .setPayload(Schema.Struct({ reason: Schema.optional(Schema.String) }))
  )
  .add(
    HttpApiEndpoint.post("withdraw", "/:id/withdraw")
      .addSuccess(Application)
      .addError(ApplicationNotFoundErrorSchema, { status: 404 })
      .setPath(Schema.Struct({ id: ApplicationId }))
  )
  .add(
    HttpApiEndpoint.get("listInterviews", "/:id/interviews")
      .addSuccess(Schema.Array(Interview))
      .addError(ApplicationNotFoundErrorSchema, { status: 404 })
      .setPath(Schema.Struct({ id: ApplicationId }))
  )
  .add(
    HttpApiEndpoint.get("listApplicationNotes", "/:id/notes")
      .addSuccess(Schema.Array(Note))
      .addError(ApplicationNotFoundErrorSchema, { status: 404 })
      .setPath(Schema.Struct({ id: ApplicationId }))
  )
  .add(
    HttpApiEndpoint.get("listApplicationActivities", "/:id/activities")
      .addSuccess(Schema.Array(Activity))
      .addError(ApplicationNotFoundErrorSchema, { status: 404 })
      .setPath(Schema.Struct({ id: ApplicationId }))
  )
  .prefix("/api/applications") {}
