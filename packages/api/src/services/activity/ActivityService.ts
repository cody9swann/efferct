import { Effect } from "effect"
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

export class ActivityService extends Effect.Service<ActivityService>()("ActivityService", {
  effect: Effect.gen(function* () {
    const repo = yield* ActivityRepository
    const auth = yield* AuthService

    const getActivity = (id: ActivityId): Effect.Effect<Activity, ActivityNotFoundError> =>
      Effect.gen(function* () {
        const user = yield* auth.getCurrentUser()
        const activity = yield* repo.findById(id, user.organizationId)
        if (!activity) {
          return yield* Effect.fail(new ActivityNotFoundError(id))
        }
        return activity
      })

    const list = (): Effect.Effect<Activity[]> =>
      Effect.gen(function* () {
        const user = yield* auth.getCurrentUser()
        return yield* repo.findAll(user.organizationId)
      })

    const listByCandidate = (candidateId: CandidateId): Effect.Effect<Activity[]> =>
      Effect.gen(function* () {
        const user = yield* auth.getCurrentUser()
        return yield* repo.findByCandidateId(candidateId, user.organizationId)
      })

    const listByApplication = (applicationId: ApplicationId): Effect.Effect<Activity[]> =>
      Effect.gen(function* () {
        const user = yield* auth.getCurrentUser()
        return yield* repo.findByApplicationId(applicationId, user.organizationId)
      })

    return {
      getActivity,
      list,
      listByCandidate,
      listByApplication,
    } as const
  })
}) {}
