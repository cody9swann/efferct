import { HttpApi, OpenApi } from "@effect/platform"
import { JobApi } from "./JobApi.ts"
import { CandidateApi } from "./CandidateApi.ts"
import { ApplicationApi } from "./ApplicationApi.ts"
import { InterviewApi } from "./InterviewApi.ts"
import { ScorecardApi } from "./ScorecardApi.ts"
import { NoteApi } from "./NoteApi.ts"
import { ActivityApi } from "./ActivityApi.ts"
import { UserApi } from "./UserApi.ts"
import { OrganizationApi } from "./OrganizationApi.ts"

// Main API definition combining all groups
export class Api extends HttpApi.make("ats")
  .add(JobApi)
  .add(CandidateApi)
  .add(ApplicationApi)
  .add(InterviewApi)
  .add(ScorecardApi)
  .add(NoteApi)
  .add(ActivityApi)
  .add(UserApi)
  .add(OrganizationApi)
  .annotate(OpenApi.Title, "ATS API")
  .annotate(OpenApi.Version, "1.0.0")
  .annotate(OpenApi.Description, "Applicant Tracking System API") {}
