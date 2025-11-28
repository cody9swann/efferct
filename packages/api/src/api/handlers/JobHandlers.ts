import { HttpApiBuilder } from "@effect/platform"
import { Effect } from "effect"
import { Api } from "../Api.ts"
import { JobService } from "../../services/job/JobService.ts"

export const JobHandlers = HttpApiBuilder.group(Api, "jobs", (handlers) =>
  handlers
    .handle("getJob", ({ path }) =>
      Effect.gen(function* () {
        const service = yield* JobService
        return yield* service.getJob(path.id)
      })
    )
    .handle("listJobs", () =>
      Effect.gen(function* () {
        const service = yield* JobService
        return yield* service.listJobs()
      })
    )
    .handle("createJob", ({ payload }) =>
      Effect.gen(function* () {
        const service = yield* JobService
        return yield* service.createJob(payload)
      })
    )
    .handle("updateJob", ({ path, payload }) =>
      Effect.gen(function* () {
        const service = yield* JobService
        return yield* service.updateJob(path.id, payload)
      })
    )
    .handle("deleteJob", ({ path }) =>
      Effect.gen(function* () {
        const service = yield* JobService
        return yield* service.deleteJob(path.id)
      })
    )
    .handle("getJobPipeline", ({ path }) =>
      Effect.gen(function* () {
        const service = yield* JobService
        return yield* service.getJobPipeline(path.id)
      })
    )
)
