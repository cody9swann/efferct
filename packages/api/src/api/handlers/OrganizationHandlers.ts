import { HttpApiBuilder } from "@effect/platform"
import { Effect } from "effect"
import { Api } from "../Api.ts"
import { OrganizationService } from "../../services/organization/OrganizationService.ts"

export const OrganizationHandlers = HttpApiBuilder.group(Api, "organizations", (handlers) =>
  handlers
    .handle("getCurrentOrganization", () =>
      Effect.gen(function* () {
        const service = yield* OrganizationService
        return yield* service.getCurrentOrganization()
      })
    )
    .handle("updateCurrentOrganization", ({ payload }) =>
      Effect.gen(function* () {
        const service = yield* OrganizationService
        return yield* service.updateCurrentOrganization(payload)
      })
    )
    .handle("listOrganizationUsers", () =>
      Effect.gen(function* () {
        const service = yield* OrganizationService
        return yield* service.listOrganizationUsers()
      })
    )
)
