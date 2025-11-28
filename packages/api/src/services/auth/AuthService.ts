import { Context, Effect } from "effect"
import type { OrganizationId, UserId, UserRole } from "@ats/shared"

// Current user context (set per request)
export interface CurrentUser {
  readonly id: UserId
  readonly organizationId: OrganizationId
  readonly email: string
  readonly name: string
  readonly role: UserRole
}

// Auth service interface
export interface AuthServiceShape {
  readonly getCurrentUser: () => Effect.Effect<CurrentUser>
  readonly requireRole: (...roles: UserRole[]) => Effect.Effect<void, UnauthorizedError>
}

export class AuthService extends Context.Tag("AuthService")<AuthService, AuthServiceShape>() {}

// Errors
export class UnauthorizedError {
  readonly _tag = "UnauthorizedError"
  constructor(readonly message: string = "Unauthorized") {}
}

export class ForbiddenError {
  readonly _tag = "ForbiddenError"
  constructor(readonly message: string = "Forbidden") {}
}
