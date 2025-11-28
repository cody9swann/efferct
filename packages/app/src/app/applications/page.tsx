"use client";

import { Result, useAtomValue } from "@effect-atom/atom-react";
import Link from "next/link";
import { format } from "date-fns";
import { FileText, Filter } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { applicationsAtom, jobsAtom, candidatesAtom } from "@/atoms/api";
import type { Application, Job, Candidate } from "@ats/shared";

export default function ApplicationsPage() {
  const applicationsResult = useAtomValue(applicationsAtom);
  const jobsResult = useAtomValue(jobsAtom);
  const candidatesResult = useAtomValue(candidatesAtom);

  const jobs = Result.isSuccess(jobsResult) ? jobsResult.value : [];
  const candidates = Result.isSuccess(candidatesResult) ? candidatesResult.value : [];

  return (
    <div className="flex flex-col">
      <Header title="Applications">
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </Header>

      <div className="flex-1 p-6">
        {Result.builder(applicationsResult)
          .onInitial(() => <ApplicationsListSkeleton />)
          .onSuccess((data) => (
            <ApplicationsList applications={data} jobs={jobs} candidates={candidates} />
          ))
          .onFailure((err) => (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
              Error loading applications: {String(err)}
            </div>
          ))
          .onDefect(() => (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
              An unexpected error occurred
            </div>
          ))
          .render()}
      </div>
    </div>
  );
}

function ApplicationsListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  );
}

function ApplicationsList({
  applications,
  jobs,
  candidates,
}: {
  applications: Application[];
  jobs: Job[];
  candidates: Candidate[];
}) {
  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium">No applications yet</p>
          <p className="text-sm text-muted-foreground">
            Applications will appear here when candidates apply to jobs.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getJob = (jobId: string) => jobs.find((j) => j.id === jobId);
  const getCandidate = (candidateId: string) => candidates.find((c) => c.id === candidateId);

  // Group by status
  const activeApps = applications.filter((a) => a.status === "active");
  const hiredApps = applications.filter((a) => a.status === "hired");
  const rejectedApps = applications.filter((a) => a.status === "rejected");
  const withdrawnApps = applications.filter((a) => a.status === "withdrawn");

  return (
    <div className="space-y-8">
      {activeApps.length > 0 && (
        <ApplicationGroup
          title="Active"
          count={activeApps.length}
          applications={activeApps}
          getJob={getJob}
          getCandidate={getCandidate}
        />
      )}
      {hiredApps.length > 0 && (
        <ApplicationGroup
          title="Hired"
          count={hiredApps.length}
          applications={hiredApps}
          getJob={getJob}
          getCandidate={getCandidate}
        />
      )}
      {rejectedApps.length > 0 && (
        <ApplicationGroup
          title="Rejected"
          count={rejectedApps.length}
          applications={rejectedApps}
          getJob={getJob}
          getCandidate={getCandidate}
        />
      )}
      {withdrawnApps.length > 0 && (
        <ApplicationGroup
          title="Withdrawn"
          count={withdrawnApps.length}
          applications={withdrawnApps}
          getJob={getJob}
          getCandidate={getCandidate}
        />
      )}
    </div>
  );
}

function ApplicationGroup({
  title,
  count,
  applications,
  getJob,
  getCandidate,
}: {
  title: string;
  count: number;
  applications: Application[];
  getJob: (id: string) => Job | undefined;
  getCandidate: (id: string) => Candidate | undefined;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Badge variant="secondary">{count}</Badge>
      </div>
      <div className="space-y-3">
        {applications.map((app) => (
          <ApplicationCard
            key={app.id}
            application={app}
            job={getJob(app.jobId)}
            candidate={getCandidate(app.candidateId)}
          />
        ))}
      </div>
    </div>
  );
}

function ApplicationCard({
  application,
  job,
  candidate,
}: {
  application: Application;
  job?: Job;
  candidate?: Candidate;
}) {
  const statusColors: Record<Application["status"], string> = {
    active: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    hired: "bg-green-500/10 text-green-600 dark:text-green-400",
    rejected: "bg-red-500/10 text-red-600 dark:text-red-400",
    withdrawn: "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400",
  };

  return (
    <Link href={`/applications/${application.id}`}>
      <Card className="transition-colors hover:bg-accent/30">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {candidate
                  ? `${candidate.firstName[0]}${candidate.lastName[0]}`
                  : "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {candidate
                  ? `${candidate.firstName} ${candidate.lastName}`
                  : "Unknown Candidate"}
              </p>
              <p className="text-sm text-muted-foreground">
                {job?.title || "Unknown Position"} •{" "}
                {format(new Date(application.appliedAt), "MMM d, yyyy")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {application.rating && (
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-xs ${
                      star <= application.rating!
                        ? "text-yellow-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            )}
            <Badge className={statusColors[application.status]}>
              {application.status}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
