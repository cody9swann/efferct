"use client";

import { Result, useAtomValue } from "@effect-atom/atom-react";
import Link from "next/link";
import { Briefcase, Users, FileText, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { jobsAtom, candidatesAtom, applicationsAtom } from "@/atoms/api";
import type { Job, Application, JobStatus, ApplicationStatus } from "@ats/shared";

export default function Dashboard() {
  const jobsResult = useAtomValue(jobsAtom);
  const candidatesResult = useAtomValue(candidatesAtom);
  const applicationsResult = useAtomValue(applicationsAtom);

  const jobs = Result.isSuccess(jobsResult) ? jobsResult.value : [];
  const candidates = Result.isSuccess(candidatesResult) ? candidatesResult.value : [];
  const applications = Result.isSuccess(applicationsResult) ? applicationsResult.value : [];

  const openJobs = jobs.filter((j: Job) => j.status === "open").length;
  const totalCandidates = candidates.length;
  const activeApplications = applications.filter((a: Application) => a.status === "active").length;
  const hiredThisMonth = applications.filter((a: Application) => a.status === "hired").length;

  const isLoading = Result.isInitial(jobsResult) || Result.isInitial(candidatesResult) || Result.isInitial(applicationsResult);

  return (
    <div className="flex flex-col">
      <Header title="Dashboard">
        <Button asChild>
          <Link href="/jobs/new">Post New Job</Link>
        </Button>
      </Header>

      <div className="flex-1 space-y-6 p-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Open Jobs"
            value={isLoading ? "..." : String(openJobs)}
            icon={Briefcase}
            description="Active job postings"
            href="/jobs"
          />
          <StatCard
            title="Total Candidates"
            value={isLoading ? "..." : String(totalCandidates)}
            icon={Users}
            description="In your talent pool"
            href="/candidates"
          />
          <StatCard
            title="Active Applications"
            value={isLoading ? "..." : String(activeApplications)}
            icon={FileText}
            description="Currently in pipeline"
            href="/applications"
          />
          <StatCard
            title="Hired"
            value={isLoading ? "..." : String(hiredThisMonth)}
            icon={CheckCircle}
            description="This month"
            href="/applications?status=hired"
          />
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Jobs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium">Recent Jobs</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/jobs">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No jobs yet</p>
              ) : (
                <div className="space-y-3">
                  {jobs.slice(0, 5).map((job: Job) => (
                    <Link
                      key={job.id}
                      href={`/jobs/${job.id}`}
                      className="flex items-center justify-between rounded-md p-3 transition-colors hover:bg-accent/50"
                    >
                      <div>
                        <p className="font-medium">{job.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {job.location.type === "remote" ? "Remote" : job.location.city || "Location TBD"}
                        </p>
                      </div>
                      <StatusBadge status={job.status} />
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium">Recent Applications</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/applications">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              ) : applications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No applications yet</p>
              ) : (
                <div className="space-y-3">
                  {applications.slice(0, 5).map((app: Application) => {
                    const candidate = candidates.find((c) => c.id === app.candidateId);
                    const job = jobs.find((j) => j.id === app.jobId);
                    return (
                      <Link
                        key={app.id}
                        href={`/applications/${app.id}`}
                        className="flex items-center justify-between rounded-md p-3 transition-colors hover:bg-accent/50"
                      >
                        <div>
                          <p className="font-medium">
                            {candidate ? `${candidate.firstName} ${candidate.lastName}` : "Unknown"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {job?.title || "Unknown position"}
                          </p>
                        </div>
                        <ApplicationStatusBadge status={app.status} />
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  href,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="transition-colors hover:bg-accent/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function StatusBadge({ status }: { status: JobStatus }) {
  const colors: Record<JobStatus, string> = {
    open: "bg-green-500/10 text-green-600 dark:text-green-400",
    draft: "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400",
    paused: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    closed: "bg-red-500/10 text-red-600 dark:text-red-400",
    archived: "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400",
  };

  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium ${colors[status]}`}>
      {status}
    </span>
  );
}

function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const colors: Record<ApplicationStatus, string> = {
    active: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    hired: "bg-green-500/10 text-green-600 dark:text-green-400",
    rejected: "bg-red-500/10 text-red-600 dark:text-red-400",
    withdrawn: "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400",
  };

  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium ${colors[status]}`}>
      {status}
    </span>
  );
}
