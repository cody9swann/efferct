import { Context, Effect, Layer } from "effect"
import type { Job, JobId, CreateJobInput, UpdateJobInput, PipelineStage } from "@ats/shared"
import { JobRepository, PipelineStageRepository } from "./JobRepository.ts"
import { AuthService } from "../auth/AuthService.ts"

// Job service errors
export class JobNotFoundError {
  readonly _tag = "JobNotFoundError"
  constructor(readonly jobId: string) {}
}

// Job service interface
export interface JobServiceShape {
  readonly getJob: (id: JobId) => Effect.Effect<Job, JobNotFoundError>
  readonly listJobs: () => Effect.Effect<Job[]>
  readonly createJob: (input: CreateJobInput) => Effect.Effect<Job>
  readonly updateJob: (id: JobId, input: UpdateJobInput) => Effect.Effect<Job, JobNotFoundError>
  readonly deleteJob: (id: JobId) => Effect.Effect<void, JobNotFoundError>
  readonly getJobPipeline: (id: JobId) => Effect.Effect<PipelineStage[], JobNotFoundError>
}

export class JobService extends Context.Tag("@ats/JobService")<JobService, JobServiceShape>() {
  static readonly Live = Layer.effect(
    JobService,
    Effect.gen(function* () {
      const repo = yield* JobRepository
      const stageRepo = yield* PipelineStageRepository
      const auth = yield* AuthService

      const getJob = (id: JobId) =>
        Effect.gen(function* () {
          const user = yield* auth.getCurrentUser()
          const job = yield* repo.findById(id, user.organizationId)
          if (!job) {
            return yield* Effect.fail(new JobNotFoundError(id))
          }
          return job
        })

      const listJobs = () =>
        Effect.gen(function* () {
          const user = yield* auth.getCurrentUser()
          return yield* repo.findAll(user.organizationId)
        })

      const createJob = (input: CreateJobInput) =>
        Effect.gen(function* () {
          const user = yield* auth.getCurrentUser()
          const job = yield* repo.create(user.organizationId, input)

          // Create default pipeline stages
          const { DEFAULT_PIPELINE_STAGES } = yield* Effect.promise(() =>
            import("@ats/shared").then((m) => ({
              DEFAULT_PIPELINE_STAGES: m.DEFAULT_PIPELINE_STAGES,
            }))
          )

          yield* stageRepo.createMany(
            DEFAULT_PIPELINE_STAGES.map((stage) => ({
              ...stage,
              jobId: job.id,
            }))
          )

          return job
        })

      const updateJob = (id: JobId, input: UpdateJobInput) =>
        Effect.gen(function* () {
          const user = yield* auth.getCurrentUser()
          const job = yield* repo.update(id, user.organizationId, input)
          if (!job) {
            return yield* Effect.fail(new JobNotFoundError(id))
          }
          return job
        })

      const deleteJob = (id: JobId) =>
        Effect.gen(function* () {
          const user = yield* auth.getCurrentUser()
          const deleted = yield* repo.delete(id, user.organizationId)
          if (!deleted) {
            return yield* Effect.fail(new JobNotFoundError(id))
          }
          // Also delete pipeline stages
          yield* stageRepo.deleteByJobId(id)
        })

      const getJobPipeline = (id: JobId) =>
        Effect.gen(function* () {
          // Verify job exists
          const user = yield* auth.getCurrentUser()
          const job = yield* repo.findById(id, user.organizationId)
          if (!job) {
            return yield* Effect.fail(new JobNotFoundError(id))
          }
          return yield* stageRepo.findByJobId(id)
        })

      return {
        getJob,
        listJobs,
        createJob,
        updateJob,
        deleteJob,
        getJobPipeline,
      }
    })
  )
}
