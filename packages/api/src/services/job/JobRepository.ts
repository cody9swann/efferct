import { Context, Effect } from "effect"
import type {
  Job,
  JobId,
  OrganizationId,
  CreateJobInput,
  UpdateJobInput,
  PipelineStage,
  PipelineStageId,
  CreatePipelineStageInput,
} from "@ats/shared"

// Job repository interface
export interface JobRepositoryService {
  readonly findById: (id: JobId, orgId: OrganizationId) => Effect.Effect<Job | null>
  readonly findAll: (orgId: OrganizationId) => Effect.Effect<Job[]>
  readonly create: (orgId: OrganizationId, input: CreateJobInput) => Effect.Effect<Job>
  readonly update: (id: JobId, orgId: OrganizationId, input: UpdateJobInput) => Effect.Effect<Job | null>
  readonly delete: (id: JobId, orgId: OrganizationId) => Effect.Effect<boolean>
}

export class JobRepository extends Context.Tag("JobRepository")<JobRepository, JobRepositoryService>() {}

// Pipeline stage repository interface
export interface PipelineStageRepositoryService {
  readonly findByJobId: (jobId: JobId) => Effect.Effect<PipelineStage[]>
  readonly findById: (id: PipelineStageId) => Effect.Effect<PipelineStage | null>
  readonly create: (input: CreatePipelineStageInput & { id?: PipelineStageId }) => Effect.Effect<PipelineStage>
  readonly createMany: (inputs: Array<CreatePipelineStageInput>) => Effect.Effect<PipelineStage[]>
  readonly update: (id: PipelineStageId, input: Partial<PipelineStage>) => Effect.Effect<PipelineStage | null>
  readonly delete: (id: PipelineStageId) => Effect.Effect<boolean>
  readonly deleteByJobId: (jobId: JobId) => Effect.Effect<number>
}

export class PipelineStageRepository extends Context.Tag("PipelineStageRepository")<
  PipelineStageRepository,
  PipelineStageRepositoryService
>() {}
