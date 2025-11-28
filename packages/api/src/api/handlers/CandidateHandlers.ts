import { HttpApiBuilder } from "@effect/platform"
import { Effect } from "effect"
import { Api } from "../Api.ts"
import { CandidateService } from "../../services/candidate/CandidateService.ts"
import { NoteService } from "../../services/note/NoteService.ts"
import { ActivityService } from "../../services/activity/ActivityService.ts"

export const CandidateHandlers = HttpApiBuilder.group(Api, "candidates", (handlers) =>
  handlers
    .handle("getCandidate", ({ path }) =>
      Effect.gen(function* () {
        const service = yield* CandidateService
        return yield* service.getCandidate(path.id)
      })
    )
    .handle("listCandidates", () =>
      Effect.gen(function* () {
        const service = yield* CandidateService
        return yield* service.listCandidates()
      })
    )
    .handle("createCandidate", ({ payload }) =>
      Effect.gen(function* () {
        const service = yield* CandidateService
        return yield* service.createCandidate(payload)
      })
    )
    .handle("updateCandidate", ({ path, payload }) =>
      Effect.gen(function* () {
        const service = yield* CandidateService
        return yield* service.updateCandidate(path.id, payload)
      })
    )
    .handle("deleteCandidate", ({ path }) =>
      Effect.gen(function* () {
        const service = yield* CandidateService
        return yield* service.deleteCandidate(path.id)
      })
    )
    .handle("listCandidateNotes", ({ path }) =>
      Effect.gen(function* () {
        // First verify the candidate exists
        const candidateService = yield* CandidateService
        yield* candidateService.getCandidate(path.id)
        // Then get the notes
        const noteService = yield* NoteService
        return yield* noteService.listByCandidate(path.id)
      })
    )
    .handle("listCandidateActivities", ({ path }) =>
      Effect.gen(function* () {
        // First verify the candidate exists
        const candidateService = yield* CandidateService
        yield* candidateService.getCandidate(path.id)
        // Then get the activities
        const activityService = yield* ActivityService
        return yield* activityService.listByCandidate(path.id)
      })
    )
)
