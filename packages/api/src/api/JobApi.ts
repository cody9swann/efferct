import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Schema } from "effect"
import { Job, JobId, CreateJobInput, UpdateJobInput, PipelineStage } from "@ats/shared"

// Error schemas
const JobNotFoundErrorSchema = Schema.Struct({
  _tag: Schema.Literal("JobNotFoundError"),
  jobId: Schema.String,
})

// Job API Group
export class JobApi extends HttpApiGroup.make("jobs")
  .add(
    HttpApiEndpoint.get("getJob", "/:id")
      .addSuccess(Job)
      .addError(JobNotFoundErrorSchema, { status: 404 })
      .setPath(Schema.Struct({ id: JobId }))
  )
  .add(
    HttpApiEndpoint.get("listJobs", "/")
      .addSuccess(Schema.Array(Job))
  )
  .add(
    HttpApiEndpoint.post("createJob", "/")
      .addSuccess(Job, { status: 201 })
      .setPayload(CreateJobInput)
  )
  .add(
    HttpApiEndpoint.patch("updateJob", "/:id")
      .addSuccess(Job)
      .addError(JobNotFoundErrorSchema, { status: 404 })
      .setPath(Schema.Struct({ id: JobId }))
      .setPayload(UpdateJobInput)
  )
  .add(
    HttpApiEndpoint.del("deleteJob", "/:id")
      .addSuccess(Schema.Void)
      .addError(JobNotFoundErrorSchema, { status: 404 })
      .setPath(Schema.Struct({ id: JobId }))
  )
  .add(
    HttpApiEndpoint.get("getJobPipeline", "/:id/pipeline")
      .addSuccess(Schema.Array(PipelineStage))
      .addError(JobNotFoundErrorSchema, { status: 404 })
      .setPath(Schema.Struct({ id: JobId }))
  )
  .prefix("/api/jobs") {}
