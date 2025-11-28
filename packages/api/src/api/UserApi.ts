import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Schema } from "effect"
import {
  User,
  UserId,
  CreateUserInput,
  UserRole,
} from "@ats/shared"

// Error schemas
const UserNotFoundErrorSchema = Schema.Struct({
  _tag: Schema.Literal("UserNotFoundError"),
  userId: Schema.String,
})

const UserEmailExistsErrorSchema = Schema.Struct({
  _tag: Schema.Literal("UserEmailExistsError"),
  email: Schema.String,
})

// Update user input schema
const UpdateUserInput = Schema.Struct({
  name: Schema.optional(Schema.String),
  role: Schema.optional(UserRole),
  avatarUrl: Schema.optional(Schema.String),
  isActive: Schema.optional(Schema.Boolean),
})

// User API Group
export class UserApi extends HttpApiGroup.make("users")
  .add(
    HttpApiEndpoint.get("list", "/")
      .addSuccess(Schema.Array(User))
  )
  .add(
    HttpApiEndpoint.get("getCurrentUser", "/me")
      .addSuccess(User)
      .addError(UserNotFoundErrorSchema, { status: 404 })
  )
  .add(
    HttpApiEndpoint.get("getUser", "/:id")
      .addSuccess(User)
      .addError(UserNotFoundErrorSchema, { status: 404 })
      .setPath(Schema.Struct({ id: UserId }))
  )
  .add(
    HttpApiEndpoint.post("createUser", "/")
      .addSuccess(User, { status: 201 })
      .addError(UserEmailExistsErrorSchema, { status: 409 })
      .setPayload(CreateUserInput)
  )
  .add(
    HttpApiEndpoint.patch("updateUser", "/:id")
      .addSuccess(User)
      .addError(UserNotFoundErrorSchema, { status: 404 })
      .setPath(Schema.Struct({ id: UserId }))
      .setPayload(UpdateUserInput)
  )
  .add(
    HttpApiEndpoint.del("deactivateUser", "/:id")
      .addSuccess(Schema.Void)
      .addError(UserNotFoundErrorSchema, { status: 404 })
      .setPath(Schema.Struct({ id: UserId }))
  )
  .prefix("/api/users") {}
