import { HttpApiBuilder } from "@effect/platform"
import { Effect } from "effect"
import { Api } from "../Api.ts"
import { ApplicationService } from "../../services/application/ApplicationService.ts"
import { InterviewService } from "../../services/interview/InterviewService.ts"
import { NoteService } from "../../services/note/NoteService.ts"
import { ActivityService } from "../../services/activity/ActivityService.ts"

export const ApplicationHandlers = HttpApiBuilder.group(Api, "applications", (handlers) =>
  handlers
    .handle("list", () =>
      Effect.gen(function* () {
        const service = yield* ApplicationService
        return yield* service.list()
      })
    )
    .handle("getApplication", ({ path }) =>
      Effect.gen(function* () {
        const service = yield* ApplicationService
        return yield* service.getApplication(path.id)
      })
    )
    .handle("listByJob", ({ path }) =>
      Effect.gen(function* () {
        const service = yield* ApplicationService
        return yield* service.listByJob(path.jobId)
      })
    )
    .handle("listByCandidate", ({ path }) =>
      Effect.gen(function* () {
        const service = yield* ApplicationService
        return yield* service.listByCandidate(path.candidateId)
      })
    )
    .handle("createApplication", ({ payload }) =>
      Effect.gen(function* () {
        const service = yield* ApplicationService
        return yield* service.createApplication(payload)
      })
    )
    .handle("moveToStage", ({ path, payload }) =>
      Effect.gen(function* () {
        const service = yield* ApplicationService
        return yield* service.moveToStage(path.id, payload)
      })
    )
    .handle("reject", ({ path, payload }) =>
      Effect.gen(function* () {
        const service = yield* ApplicationService
        return yield* service.reject(path.id, payload.reason)
      })
    )
    .handle("withdraw", ({ path }) =>
      Effect.gen(function* () {
        const service = yield* ApplicationService
        return yield* service.withdraw(path.id)
      })
    )
    .handle("listInterviews", ({ path }) =>
      Effect.gen(function* () {
        // First verify the application exists
        const appService = yield* ApplicationService
        yield* appService.getApplication(path.id)
        // Then get the interviews
        const interviewService = yield* InterviewService
        return yield* interviewService.listByApplication(path.id)
      })
    )
    .handle("listApplicationNotes", ({ path }) =>
      Effect.gen(function* () {
        // First verify the application exists
        const appService = yield* ApplicationService
        yield* appService.getApplication(path.id)
        // Then get the notes
        const noteService = yield* NoteService
        return yield* noteService.listByApplication(path.id)
      })
    )
    .handle("listApplicationActivities", ({ path }) =>
      Effect.gen(function* () {
        // First verify the application exists
        const appService = yield* ApplicationService
        yield* appService.getApplication(path.id)
        // Then get the activities
        const activityService = yield* ActivityService
        return yield* activityService.listByApplication(path.id)
      })
    )
)
