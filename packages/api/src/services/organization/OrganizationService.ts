import { Effect } from "effect"
import type { Organization, User } from "@ats/shared"
import { OrganizationRepository, type UpdateOrganizationInput } from "./OrganizationRepository.ts"
import { UserRepository } from "../user/UserRepository.ts"
import { AuthService } from "../auth/AuthService.ts"

// Organization service errors
export class OrganizationNotFoundError {
  readonly _tag = "OrganizationNotFoundError"
  constructor(readonly organizationId: string) {}
}

export class OrganizationService extends Effect.Service<OrganizationService>()("OrganizationService", {
  effect: Effect.gen(function* () {
    const repo = yield* OrganizationRepository
    const userRepo = yield* UserRepository
    const auth = yield* AuthService

    const getCurrentOrganization = (): Effect.Effect<Organization, OrganizationNotFoundError> =>
      Effect.gen(function* () {
        const currentUser = yield* auth.getCurrentUser()
        const org = yield* repo.findById(currentUser.organizationId)
        if (!org) {
          return yield* Effect.fail(new OrganizationNotFoundError(currentUser.organizationId))
        }
        return org
      })

    const updateCurrentOrganization = (
      input: UpdateOrganizationInput
    ): Effect.Effect<Organization, OrganizationNotFoundError> =>
      Effect.gen(function* () {
        const currentUser = yield* auth.getCurrentUser()
        const updated = yield* repo.update(currentUser.organizationId, input)
        if (!updated) {
          return yield* Effect.fail(new OrganizationNotFoundError(currentUser.organizationId))
        }
        return updated
      })

    const listOrganizationUsers = (): Effect.Effect<User[]> =>
      Effect.gen(function* () {
        const currentUser = yield* auth.getCurrentUser()
        return yield* userRepo.findAll(currentUser.organizationId)
      })

    return {
      getCurrentOrganization,
      updateCurrentOrganization,
      listOrganizationUsers,
    } as const
  })
}) {}
