import { Context, Effect } from "effect"
import type {
  Note,
  NoteId,
  OrganizationId,
  CandidateId,
  ApplicationId,
  CreateNoteInput,
} from "@ats/shared"

// Update note input
export interface UpdateNoteInput {
  readonly content?: string | undefined
  readonly isPrivate?: boolean | undefined
  readonly mentionedUserIds?: readonly string[] | undefined
}

// Note repository interface
export interface NoteRepositoryService {
  readonly findById: (id: NoteId, orgId: OrganizationId) => Effect.Effect<Note | null>
  readonly findAll: (orgId: OrganizationId) => Effect.Effect<Note[]>
  readonly findByCandidateId: (candidateId: CandidateId, orgId: OrganizationId) => Effect.Effect<Note[]>
  readonly findByApplicationId: (applicationId: ApplicationId, orgId: OrganizationId) => Effect.Effect<Note[]>
  readonly create: (orgId: OrganizationId, authorId: string, input: CreateNoteInput) => Effect.Effect<Note>
  readonly update: (
    id: NoteId,
    orgId: OrganizationId,
    input: UpdateNoteInput
  ) => Effect.Effect<Note | null>
  readonly delete: (id: NoteId, orgId: OrganizationId) => Effect.Effect<boolean>
}

export class NoteRepository extends Context.Tag("NoteRepository")<
  NoteRepository,
  NoteRepositoryService
>() {}
