import { HttpApiBuilder } from "@effect/platform"
import { Effect } from "effect"
import { Api } from "../Api.ts"
import { ScorecardService } from "../../services/scorecard/ScorecardService.ts"

export const ScorecardHandlers = HttpApiBuilder.group(Api, "scorecards", (handlers) =>
  handlers
    .handle("list", () =>
      Effect.gen(function* () {
        const service = yield* ScorecardService
        return yield* service.list()
      })
    )
    .handle("getScorecard", ({ path }) =>
      Effect.gen(function* () {
        const service = yield* ScorecardService
        return yield* service.getScorecard(path.id)
      })
    )
    .handle("listByInterview", ({ path }) =>
      Effect.gen(function* () {
        const service = yield* ScorecardService
        return yield* service.listByInterview(path.interviewId)
      })
    )
    .handle("createScorecard", ({ payload }) =>
      Effect.gen(function* () {
        const service = yield* ScorecardService
        return yield* service.createScorecard(payload)
      })
    )
    .handle("updateScorecard", ({ path, payload }) =>
      Effect.gen(function* () {
        const service = yield* ScorecardService
        return yield* service.updateScorecard(path.id, payload)
      })
    )
    .handle("deleteScorecard", ({ path }) =>
      Effect.gen(function* () {
        const service = yield* ScorecardService
        return yield* service.deleteScorecard(path.id)
      })
    )
)
