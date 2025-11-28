import { HttpApiBuilder } from "@effect/platform"
import { Effect } from "effect"
import { Api } from "../Api.ts"
import { UserService } from "../../services/user/UserService.ts"

export const UserHandlers = HttpApiBuilder.group(Api, "users", (handlers) =>
  handlers
    .handle("list", () =>
      Effect.gen(function* () {
        const service = yield* UserService
        return yield* service.list()
      })
    )
    .handle("getCurrentUser", () =>
      Effect.gen(function* () {
        const service = yield* UserService
        return yield* service.getCurrentUser()
      })
    )
    .handle("getUser", ({ path }) =>
      Effect.gen(function* () {
        const service = yield* UserService
        return yield* service.getUser(path.id)
      })
    )
    .handle("createUser", ({ payload }) =>
      Effect.gen(function* () {
        const service = yield* UserService
        return yield* service.createUser(payload)
      })
    )
    .handle("updateUser", ({ path, payload }) =>
      Effect.gen(function* () {
        const service = yield* UserService
        return yield* service.updateUser(path.id, payload)
      })
    )
    .handle("deactivateUser", ({ path }) =>
      Effect.gen(function* () {
        const service = yield* UserService
        return yield* service.deactivateUser(path.id)
      })
    )
)
