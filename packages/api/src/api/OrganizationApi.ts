import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Schema } from "effect"
import {
  Organization,
  User,
  OrganizationSettings,
} from "@ats/shared"

// Error schemas
const OrganizationNotFoundErrorSchema = Schema.Struct({
  _tag: Schema.Literal("OrganizationNotFoundError"),
  organizationId: Schema.String,
})

// Update organization input schema
const UpdateOrganizationInput = Schema.Struct({
  name: Schema.optional(Schema.String),
  settings: Schema.optional(Schema.partial(OrganizationSettings)),
})

// Organization API Group
export class OrganizationApi extends HttpApiGroup.make("organizations")
  .add(
    HttpApiEndpoint.get("getCurrentOrganization", "/current")
      .addSuccess(Organization)
      .addError(OrganizationNotFoundErrorSchema, { status: 404 })
  )
  .add(
    HttpApiEndpoint.patch("updateCurrentOrganization", "/current")
      .addSuccess(Organization)
      .addError(OrganizationNotFoundErrorSchema, { status: 404 })
      .setPayload(UpdateOrganizationInput)
  )
  .add(
    HttpApiEndpoint.get("listOrganizationUsers", "/current/users")
      .addSuccess(Schema.Array(User))
  )
  .prefix("/api/organizations") {}
