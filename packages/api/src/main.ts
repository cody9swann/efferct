import { HttpApiBuilder, HttpApiSwagger, HttpMiddleware, HttpServer } from "@effect/platform"
import { BunHttpServer, BunRuntime } from "@effect/platform-bun"
import { Layer } from "effect"
import { Api } from "./api/Api.ts"
import { JobHandlers } from "./api/handlers/JobHandlers.ts"
import { CandidateHandlers } from "./api/handlers/CandidateHandlers.ts"
import { ApplicationHandlers } from "./api/handlers/ApplicationHandlers.ts"
import { InterviewHandlers } from "./api/handlers/InterviewHandlers.ts"
import { ScorecardHandlers } from "./api/handlers/ScorecardHandlers.ts"
import { NoteHandlers } from "./api/handlers/NoteHandlers.ts"
import { ActivityHandlers } from "./api/handlers/ActivityHandlers.ts"
import { UserHandlers } from "./api/handlers/UserHandlers.ts"
import { OrganizationHandlers } from "./api/handlers/OrganizationHandlers.ts"
import { MockLayers } from "./layers/MockLayers.ts"
import { JobService } from "./services/job/JobService.ts"
import { CandidateService } from "./services/candidate/CandidateService.ts"
import { ApplicationService } from "./services/application/ApplicationService.ts"
import { InterviewService } from "./services/interview/InterviewService.ts"
import { ScorecardService } from "./services/scorecard/ScorecardService.ts"
import { NoteService } from "./services/note/NoteService.ts"
import { ActivityService } from "./services/activity/ActivityService.ts"
import { UserService } from "./services/user/UserService.ts"
import { OrganizationService } from "./services/organization/OrganizationService.ts"

// Combine all handlers
const ApiLive = HttpApiBuilder.api(Api).pipe(
  Layer.provide(JobHandlers),
  Layer.provide(CandidateHandlers),
  Layer.provide(ApplicationHandlers),
  Layer.provide(InterviewHandlers),
  Layer.provide(ScorecardHandlers),
  Layer.provide(NoteHandlers),
  Layer.provide(ActivityHandlers),
  Layer.provide(UserHandlers),
  Layer.provide(OrganizationHandlers)
)

// Service layer combining all services with their mock dependencies
const ServicesLive = Layer.mergeAll(
  JobService.Default,
  CandidateService.Default,
  ApplicationService.Default,
  InterviewService.Default,
  ScorecardService.Default,
  NoteService.Default,
  ActivityService.Default,
  UserService.Default,
  OrganizationService.Default
).pipe(Layer.provide(MockLayers))

// Create the HTTP server with logging, CORS, and Swagger middleware
const HttpLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(HttpApiBuilder.middlewareCors({ allowedOrigins: ["http://localhost:3000", "http://localhost:3002"] })),
  Layer.provide(HttpApiSwagger.layer({ path: "/docs" })),
  Layer.provide(HttpApiBuilder.middlewareOpenApi()),
  Layer.provide(ApiLive),
  Layer.provide(ServicesLive),
  HttpServer.withLogAddress,
  Layer.provide(BunHttpServer.layer({ port: 3001 }))
)

// Run the server
BunRuntime.runMain(Layer.launch(HttpLive))
