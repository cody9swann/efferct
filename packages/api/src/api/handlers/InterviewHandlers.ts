import { HttpApiBuilder } from "@effect/platform"
import { Effect } from "effect"
import { Api } from "../Api.ts"
import { InterviewService } from "../../services/interview/InterviewService.ts"
import { ScorecardService } from "../../services/scorecard/ScorecardService.ts"

export const InterviewHandlers = HttpApiBuilder.group(Api, "interviews", (handlers) =>
  handlers
    .handle("list", () =>
      Effect.gen(function* () {
        const service = yield* InterviewService
        return yield* service.list()
      })
    )
    .handle("getInterview", ({ path }) =>
      Effect.gen(function* () {
        const service = yield* InterviewService
        return yield* service.getInterview(path.id)
      })
    )
    .handle("listByApplication", ({ path }) =>
      Effect.gen(function* () {
        const service = yield* InterviewService
        return yield* service.listByApplication(path.applicationId)
      })
    )
    .handle("createInterview", ({ payload }) =>
      Effect.gen(function* () {
        const service = yield* InterviewService
        return yield* service.createInterview(payload)
      })
    )
    .handle("updateInterview", ({ path, payload }) =>
      Effect.gen(function* () {
        const service = yield* InterviewService
        return yield* service.updateInterview(path.id, payload)
      })
    )
    .handle("deleteInterview", ({ path }) =>
      Effect.gen(function* () {
        const service = yield* InterviewService
        return yield* service.deleteInterview(path.id)
      })
    )
    .handle("listScorecards", ({ path }) =>
      Effect.gen(function* () {
        // First verify the interview exists
        const interviewService = yield* InterviewService
        yield* interviewService.getInterview(path.id)
        // Then get the scorecards
        const scorecardService = yield* ScorecardService
        return yield* scorecardService.listByInterview(path.id)
      })
    )
)
