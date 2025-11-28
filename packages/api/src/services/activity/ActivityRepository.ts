import { Context, Effect } from "effect"
import type {
  Activity,
  ActivityId,
  OrganizationId,
  CandidateId,
  ApplicationId,
} from "@ats/shared"

// Activity repository interface (read-only - activities are system-generated)
export interface ActivityRepositoryService {
  readonly findById: (id: ActivityId, orgId: OrganizationId) => Effect.Effect<Activity | null>
  readonly findAll: (orgId: OrganizationId) => Effect.Effect<Activity[]>
  readonly findByCandidateId: (candidateId: CandidateId, orgId: OrganizationId) => Effect.Effect<Activity[]>
  readonly findByApplicationId: (applicationId: ApplicationId, orgId: OrganizationId) => Effect.Effect<Activity[]>
  // Create is internal - used by other services when events occur
  readonly create: (activity: Activity) => Effect.Effect<Activity>
}

export class ActivityRepository extends Context.Tag("ActivityRepository")<
  ActivityRepository,
  ActivityRepositoryService
>() {}
