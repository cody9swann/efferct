import { describe, it, expect } from "bun:test"
import { Effect, Layer } from "effect"
import { makeTestLayer } from "@ats/shared"
import { JobService, JobNotFoundError } from "../src/services/job/JobService.ts"
import { JobRepository, PipelineStageRepository } from "../src/services/job/JobRepository.ts"
import { AuthService } from "../src/services/auth/AuthService.ts"
import type { Job, JobId, OrganizationId, UserId, PipelineStage, PipelineStageId } from "@ats/shared"

// Mock data
const mockOrganizationId = "org-1" as OrganizationId
const mockUserId = "user-1" as UserId
const mockJobId = "job-1" as JobId

const mockJob: Job = {
  id: mockJobId,
  organizationId: mockOrganizationId,
  title: "Senior Full Stack Engineer",
  description: "Build amazing products",
  department: "Engineering",
  location: "Remote",
  locationType: "remote",
  employmentType: "full_time",
  status: "open",
  salaryRange: {
    min: 150000,
    max: 200000,
    currency: "USD",
    period: "yearly"
  },
  requirements: ["5+ years experience"],
  benefits: ["Health insurance"],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

const mockPipelineStages: PipelineStage[] = [
  {
    id: "stage-1" as PipelineStageId,
    jobId: mockJobId,
    name: "Applied",
    type: "applied",
    order: 0,
    color: "#gray"
  },
  {
    id: "stage-2" as PipelineStageId,
    jobId: mockJobId,
    name: "Screening",
    type: "screening",
    order: 1,
    color: "#blue"
  }
]

// Mock auth service that returns a test user
const AuthServiceMock = makeTestLayer(AuthService)({
  getCurrentUser: () =>
    Effect.succeed({
      id: mockUserId,
      organizationId: mockOrganizationId,
      email: "test@example.com",
      name: "Test User",
      role: "admin" as const
    })
})

describe("JobService", () => {
  describe("getJob", () => {
    it("returns job when found", async () => {
      const result = await Effect.runPromise(
        Effect.gen(function* () {
          const service = yield* JobService
          return yield* service.getJob(mockJobId)
        }).pipe(
          Effect.provide(
            JobService.Default.pipe(
              Layer.provide(
                makeTestLayer(JobRepository)({
                  findById: (_id, _orgId) => Effect.succeed(mockJob)
                })
              ),
              Layer.provide(
                makeTestLayer(PipelineStageRepository)({})
              ),
              Layer.provide(AuthServiceMock)
            )
          )
        )
      )

      expect(result.id).toBe(mockJobId)
      expect(result.title).toBe("Senior Full Stack Engineer")
    })

    it("fails with JobNotFoundError when job not found", async () => {
      const result = await Effect.runPromise(
        Effect.gen(function* () {
          const service = yield* JobService
          return yield* Effect.either(service.getJob(mockJobId))
        }).pipe(
          Effect.provide(
            JobService.Default.pipe(
              Layer.provide(
                makeTestLayer(JobRepository)({
                  findById: () => Effect.succeed(null)
                })
              ),
              Layer.provide(
                makeTestLayer(PipelineStageRepository)({})
              ),
              Layer.provide(AuthServiceMock)
            )
          )
        )
      )

      expect(result._tag).toBe("Left")
      if (result._tag === "Left") {
        expect(result.left).toBeInstanceOf(JobNotFoundError)
        expect((result.left as JobNotFoundError).jobId).toBe(mockJobId)
      }
    })
  })

  describe("listJobs", () => {
    it("returns all jobs for organization", async () => {
      const result = await Effect.runPromise(
        Effect.gen(function* () {
          const service = yield* JobService
          return yield* service.listJobs()
        }).pipe(
          Effect.provide(
            JobService.Default.pipe(
              Layer.provide(
                makeTestLayer(JobRepository)({
                  findAll: () => Effect.succeed([mockJob])
                })
              ),
              Layer.provide(
                makeTestLayer(PipelineStageRepository)({})
              ),
              Layer.provide(AuthServiceMock)
            )
          )
        )
      )

      expect(result).toHaveLength(1)
      expect(result[0]?.id).toBe(mockJobId)
    })
  })

  describe("getJobPipeline", () => {
    it("returns pipeline stages for job", async () => {
      const result = await Effect.runPromise(
        Effect.gen(function* () {
          const service = yield* JobService
          return yield* service.getJobPipeline(mockJobId)
        }).pipe(
          Effect.provide(
            JobService.Default.pipe(
              Layer.provide(
                makeTestLayer(JobRepository)({
                  findById: () => Effect.succeed(mockJob)
                })
              ),
              Layer.provide(
                makeTestLayer(PipelineStageRepository)({
                  findByJobId: () => Effect.succeed(mockPipelineStages)
                })
              ),
              Layer.provide(AuthServiceMock)
            )
          )
        )
      )

      expect(result).toHaveLength(2)
      expect(result[0]?.name).toBe("Applied")
      expect(result[1]?.name).toBe("Screening")
    })
  })
})
