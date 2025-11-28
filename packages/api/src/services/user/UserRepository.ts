import { Context, Effect } from "effect"
import type {
  User,
  UserId,
  OrganizationId,
  CreateUserInput,
  UserRole,
} from "@ats/shared"

// Update user input
export interface UpdateUserInput {
  readonly name?: string | undefined
  readonly role?: UserRole | undefined
  readonly avatarUrl?: string | undefined
  readonly isActive?: boolean | undefined
}

// User repository interface
export interface UserRepositoryService {
  readonly findById: (id: UserId, orgId: OrganizationId) => Effect.Effect<User | null>
  readonly findByEmail: (email: string, orgId: OrganizationId) => Effect.Effect<User | null>
  readonly findAll: (orgId: OrganizationId) => Effect.Effect<User[]>
  readonly create: (orgId: OrganizationId, input: CreateUserInput) => Effect.Effect<User>
  readonly update: (
    id: UserId,
    orgId: OrganizationId,
    input: UpdateUserInput
  ) => Effect.Effect<User | null>
  readonly delete: (id: UserId, orgId: OrganizationId) => Effect.Effect<boolean>
}

export class UserRepository extends Context.Tag("UserRepository")<
  UserRepository,
  UserRepositoryService
>() {}
