import { HttpApiBuilder } from "@effect/platform"
import { Effect } from "effect"
import { Api } from "../Api.ts"
import { NoteService } from "../../services/note/NoteService.ts"

export const NoteHandlers = HttpApiBuilder.group(Api, "notes", (handlers) =>
  handlers
    .handle("list", () =>
      Effect.gen(function* () {
        const service = yield* NoteService
        return yield* service.list()
      })
    )
    .handle("getNote", ({ path }) =>
      Effect.gen(function* () {
        const service = yield* NoteService
        return yield* service.getNote(path.id)
      })
    )
    .handle("listByCandidate", ({ path }) =>
      Effect.gen(function* () {
        const service = yield* NoteService
        return yield* service.listByCandidate(path.candidateId)
      })
    )
    .handle("listByApplication", ({ path }) =>
      Effect.gen(function* () {
        const service = yield* NoteService
        return yield* service.listByApplication(path.applicationId)
      })
    )
    .handle("createNote", ({ payload }) =>
      Effect.gen(function* () {
        const service = yield* NoteService
        return yield* service.createNote(payload)
      })
    )
    .handle("updateNote", ({ path, payload }) =>
      Effect.gen(function* () {
        const service = yield* NoteService
        return yield* service.updateNote(path.id, payload)
      })
    )
    .handle("deleteNote", ({ path }) =>
      Effect.gen(function* () {
        const service = yield* NoteService
        return yield* service.deleteNote(path.id)
      })
    )
)
