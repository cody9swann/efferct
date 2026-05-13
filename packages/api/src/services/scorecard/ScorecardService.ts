import { Effect } from "effect"
import type {
  Scorecard,
  ScorecardId,
  InterviewId,
  CreateScorecardInput,
} from "@ats/shared"
import { ScorecardRepository, type UpdateScorecardInput } from "./ScorecardRepository.ts"
import { AuthService } from "../auth/AuthService.ts"

// Scorecard service errors
export class ScorecardNotFoundError {
  readonly _tag = "ScorecardNotFoundError"
  constructor(readonly scorecardId: string) {}
}

export class ScorecardService extends Effect.Service<ScorecardService>()("ScorecardService", {
  effect: Effect.gen(function* () {
    const repo = yield* ScorecardRepository
    const auth = yield* AuthService

    const getScorecard = (id: ScorecardId): Effect.Effect<Scorecard, ScorecardNotFoundError> =>
      Effect.gen(function* () {
        const user = yield* auth.getCurrentUser()
        const scorecard = yield* repo.findById(id, user.organizationId)
        if (!scorecard) {
          return yield* Effect.fail(new ScorecardNotFoundError(id))
        }
        return scorecard
      })

    const list = (): Effect.Effect<Scorecard[]> =>
      Effect.gen(function* () {
        const user = yield* auth.getCurrentUser()
        return yield* repo.findAll(user.organizationId)
      })

    const listByInterview = (interviewId: InterviewId): Effect.Effect<Scorecard[]> =>
      Effect.gen(function* () {
        const user = yield* auth.getCurrentUser()
        return yield* repo.findByInterviewId(interviewId, user.organizationId)
      })

    const createScorecard = (input: CreateScorecardInput): Effect.Effect<Scorecard> =>
      Effect.gen(function* () {
        const user = yield* auth.getCurrentUser()
        return yield* repo.create(user.organizationId, input)
      })

    const updateScorecard = (
      id: ScorecardId,
      input: UpdateScorecardInput
    ): Effect.Effect<Scorecard, ScorecardNotFoundError> =>
      Effect.gen(function* () {
        const user = yield* auth.getCurrentUser()
        const updated = yield* repo.update(id, user.organizationId, input)
        if (!updated) {
          return yield* Effect.fail(new ScorecardNotFoundError(id))
        }
        return updated
      })

    const deleteScorecard = (id: ScorecardId): Effect.Effect<void, ScorecardNotFoundError> =>
      Effect.gen(function* () {
        const user = yield* auth.getCurrentUser()
        const deleted = yield* repo.delete(id, user.organizationId)
        if (!deleted) {
          return yield* Effect.fail(new ScorecardNotFoundError(id))
        }
      })

    return {
      getScorecard,
      list,
      listByInterview,
      createScorecard,
      updateScorecard,
      deleteScorecard,
    } as const
  })
}) {}
