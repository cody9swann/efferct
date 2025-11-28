import { Context, Effect, Layer } from "effect"
import type {
  User,
  UserId,
  CreateUserInput,
} from "@ats/shared"
import { UserRepository, type UpdateUserInput } from "./UserRepository.ts"
import { AuthService } from "../auth/AuthService.ts"

// User service errors
export class UserNotFoundError {
  readonly _tag = "UserNotFoundError"
  constructor(readonly userId: string) {}
}

export class UserEmailExistsError {
  readonly _tag = "UserEmailExistsError"
  constructor(readonly email: string) {}
}

// User service interface
export interface UserServiceShape {
  readonly getUser: (id: UserId) => Effect.Effect<User, UserNotFoundError>
  readonly getCurrentUser: () => Effect.Effect<User, UserNotFoundError>
  readonly list: () => Effect.Effect<User[]>
  readonly createUser: (input: CreateUserInput) => Effect.Effect<User, UserEmailExistsError>
  readonly updateUser: (
    id: UserId,
    input: UpdateUserInput
  ) => Effect.Effect<User, UserNotFoundError>
  readonly deactivateUser: (id: UserId) => Effect.Effect<void, UserNotFoundError>
}

export class UserService extends Context.Tag("UserService")<
  UserService,
  UserServiceShape
>() {
  static readonly Live = Layer.effect(
    UserService,
    Effect.gen(function* () {
      const repo = yield* UserRepository
      const auth = yield* AuthService

      const getUser = (id: UserId) =>
        Effect.gen(function* () {
          const currentUser = yield* auth.getCurrentUser()
          const user = yield* repo.findById(id, currentUser.organizationId)
          if (!user) {
            return yield* Effect.fail(new UserNotFoundError(id))
          }
          return user
        })

      const getCurrentUser = () =>
        Effect.gen(function* () {
          const currentUser = yield* auth.getCurrentUser()
          const user = yield* repo.findById(currentUser.id, currentUser.organizationId)
          if (!user) {
            return yield* Effect.fail(new UserNotFoundError(currentUser.id))
          }
          return user
        })

      const list = () =>
        Effect.gen(function* () {
          const currentUser = yield* auth.getCurrentUser()
          return yield* repo.findAll(currentUser.organizationId)
        })

      const createUser = (input: CreateUserInput) =>
        Effect.gen(function* () {
          const currentUser = yield* auth.getCurrentUser()

          // Check if email already exists
          const existing = yield* repo.findByEmail(input.email, currentUser.organizationId)
          if (existing) {
            return yield* Effect.fail(new UserEmailExistsError(input.email))
          }

          return yield* repo.create(currentUser.organizationId, input)
        })

      const updateUser = (id: UserId, input: UpdateUserInput) =>
        Effect.gen(function* () {
          const currentUser = yield* auth.getCurrentUser()
          const updated = yield* repo.update(id, currentUser.organizationId, input)
          if (!updated) {
            return yield* Effect.fail(new UserNotFoundError(id))
          }
          return updated
        })

      const deactivateUser = (id: UserId) =>
        Effect.gen(function* () {
          const currentUser = yield* auth.getCurrentUser()
          const updated = yield* repo.update(id, currentUser.organizationId, { isActive: false })
          if (!updated) {
            return yield* Effect.fail(new UserNotFoundError(id))
          }
        })

      return {
        getUser,
        getCurrentUser,
        list,
        createUser,
        updateUser,
        deactivateUser,
      }
    })
  )
}
