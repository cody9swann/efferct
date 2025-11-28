import { Schema } from "effect"
import { OrganizationId, UserId } from "./ids.js"

// Organization (tenant)
export const OrganizationPlan = Schema.Literal("free", "startup", "growth", "enterprise")
export type OrganizationPlan = typeof OrganizationPlan.Type

export const OrganizationSettings = Schema.Struct({
  timezone: Schema.String,
  dateFormat: Schema.String,
  brandingColor: Schema.optional(Schema.String),
})

export const Organization = Schema.Struct({
  id: OrganizationId,
  name: Schema.String,
  slug: Schema.String,
  plan: OrganizationPlan,
  settings: OrganizationSettings,
  createdAt: Schema.String,
  updatedAt: Schema.String,
})
export type Organization = typeof Organization.Type

export const CreateOrganizationInput = Schema.Struct({
  name: Schema.String,
  slug: Schema.String,
})
export type CreateOrganizationInput = typeof CreateOrganizationInput.Type

// User roles
export const UserRole = Schema.Literal(
  "owner",
  "admin",
  "recruiter",
  "hiring_manager",
  "interviewer",
  "viewer"
)
export type UserRole = typeof UserRole.Type

// User
export const User = Schema.Struct({
  id: UserId,
  organizationId: OrganizationId,
  email: Schema.String,
  name: Schema.String,
  role: UserRole,
  avatarUrl: Schema.optional(Schema.String),
  isActive: Schema.Boolean,
  lastLoginAt: Schema.optional(Schema.String),
  createdAt: Schema.String,
})
export type User = typeof User.Type

export const CreateUserInput = Schema.Struct({
  email: Schema.String,
  name: Schema.String,
  role: UserRole,
})
export type CreateUserInput = typeof CreateUserInput.Type
