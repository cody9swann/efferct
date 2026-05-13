import { Effect } from "effect"
import type {
  Application,
  ApplicationId,
  JobId,
  CandidateId,
  CreateApplicationInput,
  MoveApplicationInput,
} from "@ats/shared"
import { ApplicationRepository } from "./ApplicationRepository.ts"
import { AuthService } from "../auth/AuthService.ts"
import { PipelineStageRepository } from "../job/JobRepository.ts"

// Application service errors
export class ApplicationNotFoundError {
  readonly _tag = "ApplicationNotFoundError"
  constructor(readonly applicationId: string) {}
}

export class ApplicationExistsError {
  readonly _tag = "ApplicationExistsError"
  constructor(readonly jobId: string, readonly candidateId: string) {}
}

export class InvalidStageError {
  readonly _tag = "InvalidStageError"
  constructor(readonly stageId: string, readonly jobId: string) {}
}

export class ApplicationService extends Effect.Service<ApplicationService>()("ApplicationService", {
  effect: Effect.gen(function* () {
    const repo = yield* ApplicationRepository
    const stageRepo = yield* PipelineStageRepository
    const auth = yield* AuthService

    const getApplication = (id: ApplicationId): Effect.Effect<Application, ApplicationNotFoundError> =>
      Effect.gen(function* () {
        const user = yield* auth.getCurrentUser()
        const app = yield* repo.findById(id, user.organizationId)
        if (!app) {
          return yield* Effect.fail(new ApplicationNotFoundError(id))
        }
        return app
      })

    const list = (): Effect.Effect<Application[]> =>
      Effect.gen(function* () {
        const user = yield* auth.getCurrentUser()
        return yield* repo.findAll(user.organizationId)
      })

    const listByJob = (jobId: JobId): Effect.Effect<Application[]> =>
      Effect.gen(function* () {
        const user = yield* auth.getCurrentUser()
        return yield* repo.findByJobId(jobId, user.organizationId)
      })

    const listByCandidate = (candidateId: CandidateId): Effect.Effect<Application[]> =>
      Effect.gen(function* () {
        const user = yield* auth.getCurrentUser()
        return yield* repo.findByCandidateId(candidateId, user.organizationId)
      })

    const createApplication = (
      input: CreateApplicationInput
    ): Effect.Effect<Application, ApplicationExistsError | InvalidStageError> =>
      Effect.gen(function* () {
        const user = yield* auth.getCurrentUser()

        // Check for existing application
        const existing = yield* repo.findByJobAndCandidate(
          input.jobId,
          input.candidateId,
          user.organizationId
        )
        if (existing) {
          return yield* Effect.fail(new ApplicationExistsError(input.jobId, input.candidateId))
        }

        // Get first stage if not specified
        let stageId = input.stageId
        if (!stageId) {
          const stages = yield* stageRepo.findByJobId(input.jobId)
          const firstStage = stages.sort((a, b) => a.order - b.order)[0]
          if (!firstStage) {
            return yield* Effect.fail(new InvalidStageError("none", input.jobId))
          }
          stageId = firstStage.id
        }

        return yield* repo.create(user.organizationId, input, stageId)
      })

    const moveToStage = (
      id: ApplicationId,
      input: MoveApplicationInput
    ): Effect.Effect<Application, ApplicationNotFoundError | InvalidStageError> =>
      Effect.gen(function* () {
        const user = yield* auth.getCurrentUser()

        // Verify application exists
        const app = yield* repo.findById(id, user.organizationId)
        if (!app) {
          return yield* Effect.fail(new ApplicationNotFoundError(id))
        }

        // Verify stage exists and belongs to the job
        const stage = yield* stageRepo.findById(input.stageId)
        if (!stage || stage.jobId !== app.jobId) {
          return yield* Effect.fail(new InvalidStageError(input.stageId, app.jobId))
        }

        const updated = yield* repo.updateStage(id, user.organizationId, input.stageId)
        if (!updated) {
          return yield* Effect.fail(new ApplicationNotFoundError(id))
        }
        return updated
      })

    const reject = (id: ApplicationId, reason?: string): Effect.Effect<Application, ApplicationNotFoundError> =>
      Effect.gen(function* () {
        const user = yield* auth.getCurrentUser()
        const updated = yield* repo.updateStatus(id, user.organizationId, "rejected", reason)
        if (!updated) {
          return yield* Effect.fail(new ApplicationNotFoundError(id))
        }
        return updated
      })

    const withdraw = (id: ApplicationId): Effect.Effect<Application, ApplicationNotFoundError> =>
      Effect.gen(function* () {
        const user = yield* auth.getCurrentUser()
        const updated = yield* repo.updateStatus(id, user.organizationId, "withdrawn")
        if (!updated) {
          return yield* Effect.fail(new ApplicationNotFoundError(id))
        }
        return updated
      })

    return {
      getApplication,
      list,
      listByJob,
      listByCandidate,
      createApplication,
      moveToStage,
      reject,
      withdraw,
    } as const
  })
}) {}
