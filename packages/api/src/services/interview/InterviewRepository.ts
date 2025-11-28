import { Context, Effect } from "effect"
import type {
  Interview,
  InterviewId,
  OrganizationId,
  ApplicationId,
  CreateInterviewInput,
  InterviewStatus,
} from "@ats/shared"

// Update interview input (all fields optional except what's required)
export interface UpdateInterviewInput {
  readonly scheduledAt?: string | undefined
  readonly duration?: number | undefined
  readonly location?: string | undefined
  readonly interviewerIds?: readonly string[] | undefined
  readonly meetingLink?: string | undefined
  readonly notes?: string | undefined
  readonly status?: InterviewStatus | undefined
  readonly candidateConfirmed?: boolean | undefined
  readonly interviewerConfirmed?: boolean | undefined
}

// Interview repository interface
export interface InterviewRepositoryService {
  readonly findById: (id: InterviewId, orgId: OrganizationId) => Effect.Effect<Interview | null>
  readonly findAll: (orgId: OrganizationId) => Effect.Effect<Interview[]>
  readonly findByApplicationId: (applicationId: ApplicationId, orgId: OrganizationId) => Effect.Effect<Interview[]>
  readonly create: (orgId: OrganizationId, input: CreateInterviewInput) => Effect.Effect<Interview>
  readonly update: (
    id: InterviewId,
    orgId: OrganizationId,
    input: UpdateInterviewInput
  ) => Effect.Effect<Interview | null>
  readonly delete: (id: InterviewId, orgId: OrganizationId) => Effect.Effect<boolean>
}

export class InterviewRepository extends Context.Tag("InterviewRepository")<
  InterviewRepository,
  InterviewRepositoryService
>() {}
