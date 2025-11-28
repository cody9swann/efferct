import { Context, Effect, Layer } from "effect"
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

// Interview service interface
export interface InterviewServiceShape {
  readonly getInterview: (id: InterviewId) => Effect.Effect<Interview, InterviewNotFoundError>
  readonly list: () => Effect.Effect<Interview[]>
  readonly listByApplication: (applicationId: ApplicationId) => Effect.Effect<Interview[]>
  readonly createInterview: (input: CreateInterviewInput) => Effect.Effect<Interview>
  readonly updateInterview: (
    id: InterviewId,
    input: UpdateInterviewInput
  ) => Effect.Effect<Interview, InterviewNotFoundError>
  readonly deleteInterview: (id: InterviewId) => Effect.Effect<void, InterviewNotFoundError>
}

export class InterviewService extends Context.Tag("InterviewService")<
  InterviewService,
  InterviewServiceShape
>() {
  static readonly Live = Layer.effect(
    InterviewService,
    Effect.gen(function* () {
      const repo = yield* InterviewRepository
      const auth = yield* AuthService

      const getInterview = (id: InterviewId) =>
        Effect.gen(function* () {
          const user = yield* auth.getCurrentUser()
          const interview = yield* repo.findById(id, user.organizationId)
          if (!interview) {
            return yield* Effect.fail(new InterviewNotFoundError(id))
          }
          return interview
        })

      const list = () =>
        Effect.gen(function* () {
          const user = yield* auth.getCurrentUser()
          return yield* repo.findAll(user.organizationId)
        })

      const listByApplication = (applicationId: ApplicationId) =>
        Effect.gen(function* () {
          const user = yield* auth.getCurrentUser()
          return yield* repo.findByApplicationId(applicationId, user.organizationId)
        })

      const createInterview = (input: CreateInterviewInput) =>
        Effect.gen(function* () {
          const user = yield* auth.getCurrentUser()
          return yield* repo.create(user.organizationId, input)
        })

      const updateInterview = (id: InterviewId, input: UpdateInterviewInput) =>
        Effect.gen(function* () {
          const user = yield* auth.getCurrentUser()
          const updated = yield* repo.update(id, user.organizationId, input)
          if (!updated) {
            return yield* Effect.fail(new InterviewNotFoundError(id))
          }
          return updated
        })

      const deleteInterview = (id: InterviewId) =>
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
      }
    })
  )
}
