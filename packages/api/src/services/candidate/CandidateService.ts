import { Effect } from "effect"
import type {
  Candidate,
  CandidateId,
  CreateCandidateInput,
  UpdateCandidateInput,
} from "@ats/shared"
import { CandidateRepository } from "./CandidateRepository.ts"
import { AuthService } from "../auth/AuthService.ts"

// Candidate service errors
export class CandidateNotFoundError {
  readonly _tag = "CandidateNotFoundError"
  constructor(readonly candidateId: string) {}
}

export class CandidateExistsError {
  readonly _tag = "CandidateExistsError"
  constructor(readonly email: string) {}
}

export class CandidateService extends Effect.Service<CandidateService>()("CandidateService", {
  effect: Effect.gen(function* () {
    const repo = yield* CandidateRepository
    const auth = yield* AuthService

    const getCandidate = (id: CandidateId): Effect.Effect<Candidate, CandidateNotFoundError> =>
      Effect.gen(function* () {
        const user = yield* auth.getCurrentUser()
        const candidate = yield* repo.findById(id, user.organizationId)
        if (!candidate) {
          return yield* Effect.fail(new CandidateNotFoundError(id))
        }
        return candidate
      })

    const listCandidates = (): Effect.Effect<Candidate[]> =>
      Effect.gen(function* () {
        const user = yield* auth.getCurrentUser()
        return yield* repo.findAll(user.organizationId)
      })

    const createCandidate = (input: CreateCandidateInput): Effect.Effect<Candidate, CandidateExistsError> =>
      Effect.gen(function* () {
        const user = yield* auth.getCurrentUser()

        // Check if candidate with email already exists
        const existing = yield* repo.findByEmail(input.email, user.organizationId)
        if (existing) {
          return yield* Effect.fail(new CandidateExistsError(input.email))
        }

        return yield* repo.create(user.organizationId, input)
      })

    const updateCandidate = (
      id: CandidateId,
      input: UpdateCandidateInput
    ): Effect.Effect<Candidate, CandidateNotFoundError> =>
      Effect.gen(function* () {
        const user = yield* auth.getCurrentUser()
        const candidate = yield* repo.update(id, user.organizationId, input)
        if (!candidate) {
          return yield* Effect.fail(new CandidateNotFoundError(id))
        }
        return candidate
      })

    const deleteCandidate = (id: CandidateId): Effect.Effect<void, CandidateNotFoundError> =>
      Effect.gen(function* () {
        const user = yield* auth.getCurrentUser()
        const deleted = yield* repo.delete(id, user.organizationId)
        if (!deleted) {
          return yield* Effect.fail(new CandidateNotFoundError(id))
        }
      })

    return {
      getCandidate,
      listCandidates,
      createCandidate,
      updateCandidate,
      deleteCandidate,
    } as const
  })
}) {}
