import { Context, Effect } from "effect"
import type {
  Scorecard,
  ScorecardId,
  OrganizationId,
  InterviewId,
  CreateScorecardInput,
} from "@ats/shared"

// Update scorecard input
export interface UpdateScorecardInput {
  readonly overallRating?: number | undefined
  readonly recommendation?: "strong_yes" | "yes" | "neutral" | "no" | "strong_no" | undefined
  readonly criteria?: readonly { readonly name: string; readonly score: number; readonly notes?: string | undefined }[] | undefined
  readonly strengths?: string | undefined
  readonly concerns?: string | undefined
  readonly additionalNotes?: string | undefined
}

// Scorecard repository interface
export interface ScorecardRepositoryService {
  readonly findById: (id: ScorecardId, orgId: OrganizationId) => Effect.Effect<Scorecard | null>
  readonly findAll: (orgId: OrganizationId) => Effect.Effect<Scorecard[]>
  readonly findByInterviewId: (interviewId: InterviewId, orgId: OrganizationId) => Effect.Effect<Scorecard[]>
  readonly create: (orgId: OrganizationId, input: CreateScorecardInput) => Effect.Effect<Scorecard>
  readonly update: (
    id: ScorecardId,
    orgId: OrganizationId,
    input: UpdateScorecardInput
  ) => Effect.Effect<Scorecard | null>
  readonly delete: (id: ScorecardId, orgId: OrganizationId) => Effect.Effect<boolean>
}

export class ScorecardRepository extends Context.Tag("ScorecardRepository")<
  ScorecardRepository,
  ScorecardRepositoryService
>() {}
