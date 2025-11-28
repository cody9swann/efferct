import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Schema } from "effect"
import { Candidate, CandidateId, CreateCandidateInput, UpdateCandidateInput, Note, Activity } from "@ats/shared"

// Error schemas
const CandidateNotFoundErrorSchema = Schema.Struct({
  _tag: Schema.Literal("CandidateNotFoundError"),
  candidateId: Schema.String,
})

const CandidateExistsErrorSchema = Schema.Struct({
  _tag: Schema.Literal("CandidateExistsError"),
  email: Schema.String,
})

// Candidate API Group
export class CandidateApi extends HttpApiGroup.make("candidates")
  .add(
    HttpApiEndpoint.get("getCandidate", "/:id")
      .addSuccess(Candidate)
      .addError(CandidateNotFoundErrorSchema, { status: 404 })
      .setPath(Schema.Struct({ id: CandidateId }))
  )
  .add(
    HttpApiEndpoint.get("listCandidates", "/")
      .addSuccess(Schema.Array(Candidate))
  )
  .add(
    HttpApiEndpoint.post("createCandidate", "/")
      .addSuccess(Candidate, { status: 201 })
      .addError(CandidateExistsErrorSchema, { status: 409 })
      .setPayload(CreateCandidateInput)
  )
  .add(
    HttpApiEndpoint.patch("updateCandidate", "/:id")
      .addSuccess(Candidate)
      .addError(CandidateNotFoundErrorSchema, { status: 404 })
      .setPath(Schema.Struct({ id: CandidateId }))
      .setPayload(UpdateCandidateInput)
  )
  .add(
    HttpApiEndpoint.del("deleteCandidate", "/:id")
      .addSuccess(Schema.Void)
      .addError(CandidateNotFoundErrorSchema, { status: 404 })
      .setPath(Schema.Struct({ id: CandidateId }))
  )
  .add(
    HttpApiEndpoint.get("listCandidateNotes", "/:id/notes")
      .addSuccess(Schema.Array(Note))
      .addError(CandidateNotFoundErrorSchema, { status: 404 })
      .setPath(Schema.Struct({ id: CandidateId }))
  )
  .add(
    HttpApiEndpoint.get("listCandidateActivities", "/:id/activities")
      .addSuccess(Schema.Array(Activity))
      .addError(CandidateNotFoundErrorSchema, { status: 404 })
      .setPath(Schema.Struct({ id: CandidateId }))
  )
  .prefix("/api/candidates") {}
