import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Schema } from "effect"
import {
  Note,
  NoteId,
  CandidateId,
  ApplicationId,
  CreateNoteInput,
  UserId,
} from "@ats/shared"

// Error schemas
const NoteNotFoundErrorSchema = Schema.Struct({
  _tag: Schema.Literal("NoteNotFoundError"),
  noteId: Schema.String,
})

// Update note input schema
const UpdateNoteInput = Schema.Struct({
  content: Schema.optional(Schema.String),
  isPrivate: Schema.optional(Schema.Boolean),
  mentionedUserIds: Schema.optional(Schema.Array(UserId)),
})

// Note API Group
export class NoteApi extends HttpApiGroup.make("notes")
  .add(
    HttpApiEndpoint.get("list", "/")
      .addSuccess(Schema.Array(Note))
  )
  .add(
    HttpApiEndpoint.get("getNote", "/:id")
      .addSuccess(Note)
      .addError(NoteNotFoundErrorSchema, { status: 404 })
      .setPath(Schema.Struct({ id: NoteId }))
  )
  .add(
    HttpApiEndpoint.get("listByCandidate", "/by-candidate/:candidateId")
      .addSuccess(Schema.Array(Note))
      .setPath(Schema.Struct({ candidateId: CandidateId }))
  )
  .add(
    HttpApiEndpoint.get("listByApplication", "/by-application/:applicationId")
      .addSuccess(Schema.Array(Note))
      .setPath(Schema.Struct({ applicationId: ApplicationId }))
  )
  .add(
    HttpApiEndpoint.post("createNote", "/")
      .addSuccess(Note, { status: 201 })
      .setPayload(CreateNoteInput)
  )
  .add(
    HttpApiEndpoint.patch("updateNote", "/:id")
      .addSuccess(Note)
      .addError(NoteNotFoundErrorSchema, { status: 404 })
      .setPath(Schema.Struct({ id: NoteId }))
      .setPayload(UpdateNoteInput)
  )
  .add(
    HttpApiEndpoint.del("deleteNote", "/:id")
      .addSuccess(Schema.Void)
      .addError(NoteNotFoundErrorSchema, { status: 404 })
      .setPath(Schema.Struct({ id: NoteId }))
  )
  .prefix("/api/notes") {}
