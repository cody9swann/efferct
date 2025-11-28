import { Context, Effect, Layer } from "effect"
import type {
  Activity,
  ActivityId,
  CandidateId,
  ApplicationId,
} from "@ats/shared"
import { ActivityRepository } from "./ActivityRepository.ts"
import { AuthService } from "../auth/AuthService.ts"

// Activity service errors
export class ActivityNotFoundError {
  readonly _tag = "ActivityNotFoundError"
  constructor(readonly activityId: string) {}
}

// Activity service interface (read-only for API consumers)
export interface ActivityServiceShape {
  readonly getActivity: (id: ActivityId) => Effect.Effect<Activity, ActivityNotFoundError>
  readonly list: () => Effect.Effect<Activity[]>
  readonly listByCandidate: (candidateId: CandidateId) => Effect.Effect<Activity[]>
  readonly listByApplication: (applicationId: ApplicationId) => Effect.Effect<Activity[]>
}

export class ActivityService extends Context.Tag("ActivityService")<
  ActivityService,
  ActivityServiceShape
>() {
  static readonly Live = Layer.effect(
    ActivityService,
    Effect.gen(function* () {
      const repo = yield* ActivityRepository
      const auth = yield* AuthService

      const getActivity = (id: ActivityId) =>
        Effect.gen(function* () {
          const user = yield* auth.getCurrentUser()
          const activity = yield* repo.findById(id, user.organizationId)
          if (!activity) {
            return yield* Effect.fail(new ActivityNotFoundError(id))
          }
          return activity
        })

      const list = () =>
        Effect.gen(function* () {
          const user = yield* auth.getCurrentUser()
          return yield* repo.findAll(user.organizationId)
        })

      const listByCandidate = (candidateId: CandidateId) =>
        Effect.gen(function* () {
          const user = yield* auth.getCurrentUser()
          return yield* repo.findByCandidateId(candidateId, user.organizationId)
        })

      const listByApplication = (applicationId: ApplicationId) =>
        Effect.gen(function* () {
          const user = yield* auth.getCurrentUser()
          return yield* repo.findByApplicationId(applicationId, user.organizationId)
        })

      return {
        getActivity,
        list,
        listByCandidate,
        listByApplication,
      }
    })
  )
}
