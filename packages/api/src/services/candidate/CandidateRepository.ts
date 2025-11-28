import { Context, Effect } from "effect"
import type {
  Candidate,
  CandidateId,
  OrganizationId,
  CreateCandidateInput,
  UpdateCandidateInput,
} from "@ats/shared"

// Candidate repository interface
export interface CandidateRepositoryService {
  readonly findById: (id: CandidateId, orgId: OrganizationId) => Effect.Effect<Candidate | null>
  readonly findByEmail: (email: string, orgId: OrganizationId) => Effect.Effect<Candidate | null>
  readonly findAll: (orgId: OrganizationId) => Effect.Effect<Candidate[]>
  readonly create: (orgId: OrganizationId, input: CreateCandidateInput) => Effect.Effect<Candidate>
  readonly update: (id: CandidateId, orgId: OrganizationId, input: UpdateCandidateInput) => Effect.Effect<Candidate | null>
  readonly delete: (id: CandidateId, orgId: OrganizationId) => Effect.Effect<boolean>
}

export class CandidateRepository extends Context.Tag("CandidateRepository")<
  CandidateRepository,
  CandidateRepositoryService
>() {}
