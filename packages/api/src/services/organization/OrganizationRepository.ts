import { Context, Effect } from "effect"
import type {
  Organization,
  OrganizationId,
} from "@ats/shared"

// Update organization input
export interface UpdateOrganizationInput {
  readonly name?: string | undefined
  readonly settings?: {
    readonly timezone?: string | undefined
    readonly dateFormat?: string | undefined
    readonly brandingColor?: string | undefined
  } | undefined
}

// Organization repository interface
export interface OrganizationRepositoryService {
  readonly findById: (id: OrganizationId) => Effect.Effect<Organization | null>
  readonly update: (
    id: OrganizationId,
    input: UpdateOrganizationInput
  ) => Effect.Effect<Organization | null>
}

export class OrganizationRepository extends Context.Tag("OrganizationRepository")<
  OrganizationRepository,
  OrganizationRepositoryService
>() {}
