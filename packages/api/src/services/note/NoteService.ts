import { Effect } from "effect"
import type {
  Note,
  NoteId,
  CandidateId,
  ApplicationId,
  CreateNoteInput,
} from "@ats/shared"
import { NoteRepository, type UpdateNoteInput } from "./NoteRepository.ts"
import { AuthService } from "../auth/AuthService.ts"

// Note service errors
export class NoteNotFoundError {
  readonly _tag = "NoteNotFoundError"
  constructor(readonly noteId: string) {}
}

export class NoteService extends Effect.Service<NoteService>()("NoteService", {
  effect: Effect.gen(function* () {
    const repo = yield* NoteRepository
    const auth = yield* AuthService

    const getNote = (id: NoteId): Effect.Effect<Note, NoteNotFoundError> =>
      Effect.gen(function* () {
        const user = yield* auth.getCurrentUser()
        const note = yield* repo.findById(id, user.organizationId)
        if (!note) {
          return yield* Effect.fail(new NoteNotFoundError(id))
        }
        return note
      })

    const list = (): Effect.Effect<Note[]> =>
      Effect.gen(function* () {
        const user = yield* auth.getCurrentUser()
        return yield* repo.findAll(user.organizationId)
      })

    const listByCandidate = (candidateId: CandidateId): Effect.Effect<Note[]> =>
      Effect.gen(function* () {
        const user = yield* auth.getCurrentUser()
        return yield* repo.findByCandidateId(candidateId, user.organizationId)
      })

    const listByApplication = (applicationId: ApplicationId): Effect.Effect<Note[]> =>
      Effect.gen(function* () {
        const user = yield* auth.getCurrentUser()
        return yield* repo.findByApplicationId(applicationId, user.organizationId)
      })

    const createNote = (input: CreateNoteInput): Effect.Effect<Note> =>
      Effect.gen(function* () {
        const user = yield* auth.getCurrentUser()
        return yield* repo.create(user.organizationId, user.id, input)
      })

    const updateNote = (id: NoteId, input: UpdateNoteInput): Effect.Effect<Note, NoteNotFoundError> =>
      Effect.gen(function* () {
        const user = yield* auth.getCurrentUser()
        const updated = yield* repo.update(id, user.organizationId, input)
        if (!updated) {
          return yield* Effect.fail(new NoteNotFoundError(id))
        }
        return updated
      })

    const deleteNote = (id: NoteId): Effect.Effect<void, NoteNotFoundError> =>
      Effect.gen(function* () {
        const user = yield* auth.getCurrentUser()
        const deleted = yield* repo.delete(id, user.organizationId)
        if (!deleted) {
          return yield* Effect.fail(new NoteNotFoundError(id))
        }
      })

    return {
      getNote,
      list,
      listByCandidate,
      listByApplication,
      createNote,
      updateNote,
      deleteNote,
    } as const
  })
}) {}
