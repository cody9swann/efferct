import { Effect } from "effect"
import type {
  Interview,
  InterviewId,
  ApplicationId,
  CreateInterviewInput,
} from "@ats/shared"
import { InterviewRepository, type UpdateInterviewInput } from "./InterviewRepository.ts"
import { AuthService } from "../auth/AuthService.ts"

// Interview service errors
export class InterviewNotFoundError {
  readonly _tag = "InterviewNotFoundError"
  constructor(readonly interviewId: string) {}
}

export class InterviewService extends Effect.Service<InterviewService>()("InterviewService", {
  effect: Effect.gen(function* () {
    const repo = yield* InterviewRepository
    const auth = yield* AuthService

    const getInterview = (id: InterviewId): Effect.Effect<Interview, InterviewNotFoundError> =>
      Effect.gen(function* () {
        const user = yield* auth.getCurrentUser()
        const interview = yield* repo.findById(id, user.organizationId)
        if (!interview) {
          return yield* Effect.fail(new InterviewNotFoundError(id))
        }
        return interview
      })

    const list = (): Effect.Effect<Interview[]> =>
      Effect.gen(function* () {
        const user = yield* auth.getCurrentUser()
        return yield* repo.findAll(user.organizationId)
      })

    const listByApplication = (applicationId: ApplicationId): Effect.Effect<Interview[]> =>
      Effect.gen(function* () {
        const user = yield* auth.getCurrentUser()
        return yield* repo.findByApplicationId(applicationId, user.organizationId)
      })

    const createInterview = (input: CreateInterviewInput): Effect.Effect<Interview> =>
      Effect.gen(function* () {
        const user = yield* auth.getCurrentUser()
        return yield* repo.create(user.organizationId, input)
      })

    const updateInterview = (
      id: InterviewId,
      input: UpdateInterviewInput
    ): Effect.Effect<Interview, InterviewNotFoundError> =>
      Effect.gen(function* () {
        const user = yield* auth.getCurrentUser()
        const updated = yield* repo.update(id, user.organizationId, input)
        if (!updated) {
          return yield* Effect.fail(new InterviewNotFoundError(id))
        }
        return updated
      })

    const deleteInterview = (id: InterviewId): Effect.Effect<void, InterviewNotFoundError> =>
      Effect.gen(function* () {
        const user = yield* auth.getCurrentUser()
        const deleted = yield* repo.delete(id, user.organizationId)
        if (!deleted) {
          return yield* Effect.fail(new InterviewNotFoundError(id))
        }
      })

    return {
      getInterview,
      list,
      listByApplication,
      createInterview,
      updateInterview,
      deleteInterview,
    } as const
  })
}) {}
