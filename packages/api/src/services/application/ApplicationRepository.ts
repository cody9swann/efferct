import { Context, Effect } from "effect"
import type {
  Application,
  ApplicationId,
  OrganizationId,
  JobId,
  CandidateId,
  PipelineStageId,
  CreateApplicationInput,
} from "@ats/shared"

// Application repository interface
export interface ApplicationRepositoryService {
  readonly findById: (id: ApplicationId, orgId: OrganizationId) => Effect.Effect<Application | null>
  readonly findAll: (orgId: OrganizationId) => Effect.Effect<Application[]>
  readonly findByJobId: (jobId: JobId, orgId: OrganizationId) => Effect.Effect<Application[]>
  readonly findByCandidateId: (candidateId: CandidateId, orgId: OrganizationId) => Effect.Effect<Application[]>
  readonly findByJobAndCandidate: (
    jobId: JobId,
    candidateId: CandidateId,
    orgId: OrganizationId
  ) => Effect.Effect<Application | null>
  readonly create: (orgId: OrganizationId, input: CreateApplicationInput, stageId: PipelineStageId) => Effect.Effect<Application>
  readonly updateStage: (
    id: ApplicationId,
    orgId: OrganizationId,
    stageId: PipelineStageId
  ) => Effect.Effect<Application | null>
  readonly updateStatus: (
    id: ApplicationId,
    orgId: OrganizationId,
    status: Application["status"],
    rejectionReason?: string
  ) => Effect.Effect<Application | null>
  readonly delete: (id: ApplicationId, orgId: OrganizationId) => Effect.Effect<boolean>
}

export class ApplicationRepository extends Context.Tag("ApplicationRepository")<
  ApplicationRepository,
  ApplicationRepositoryService
>() {}
