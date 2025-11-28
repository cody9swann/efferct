import { HttpApiBuilder } from "@effect/platform"
import { Effect } from "effect"
import { Api } from "../Api.ts"
import { ActivityService } from "../../services/activity/ActivityService.ts"

export const ActivityHandlers = HttpApiBuilder.group(Api, "activities", (handlers) =>
  handlers
    .handle("list", () =>
      Effect.gen(function* () {
        const service = yield* ActivityService
        return yield* service.list()
      })
    )
    .handle("getActivity", ({ path }) =>
      Effect.gen(function* () {
        const service = yield* ActivityService
        return yield* service.getActivity(path.id)
      })
    )
    .handle("listByCandidate", ({ path }) =>
      Effect.gen(function* () {
        const service = yield* ActivityService
        return yield* service.listByCandidate(path.candidateId)
      })
    )
    .handle("listByApplication", ({ path }) =>
      Effect.gen(function* () {
        const service = yield* ActivityService
        return yield* service.listByApplication(path.applicationId)
      })
    )
)
