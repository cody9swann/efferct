"use client";

import { use } from "react";
import { Result, useAtomValue } from "@effect-atom/atom-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Calendar,
  Edit,
  Kanban,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  jobAtom,
  pipelineStagesAtom,
  applicationsByJobAtom,
  candidatesAtom,
} from "@/atoms/api";
import type { Job, Application, PipelineStage, Candidate } from "@ats/shared";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function JobDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const jobResult = useAtomValue(jobAtom(id));
  const stagesResult = useAtomValue(pipelineStagesAtom(id));
  const applicationsResult = useAtomValue(applicationsByJobAtom(id));
  const candidatesResult = useAtomValue(candidatesAtom);

  const isLoading = Result.isInitial(jobResult);

  if (isLoading) {
    return <JobDetailSkeleton />;
  }

  if (Result.isFailure(jobResult)) {
    return (
      <div className="flex flex-col">
        <Header title="Job Not Found">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Header>
        <div className="p-6">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-lg font-medium">Job not found</p>
              <p className="text-sm text-muted-foreground">
                The job you're looking for doesn't exist or has been removed.
              </p>
              <Button className="mt-4" onClick={() => router.push("/jobs")}>
                View All Jobs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const job = jobResult.value;
  const stages = Result.isSuccess(stagesResult) ? stagesResult.value : [];
  const applications = Result.isSuccess(applicationsResult) ? applicationsResult.value : [];
  const candidates = Result.isSuccess(candidatesResult) ? candidatesResult.value : [];

  return (
    <div className="flex flex-col">
      <Header>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{job.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{formatLocation(job)}</span>
              <span>•</span>
              <span>{formatEmploymentType(job.employmentType)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={job.status} />
          <Button variant="outline" asChild>
            <Link href={`/jobs/${id}/pipeline`}>
              <Kanban className="mr-2 h-4 w-4" />
              Pipeline
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit Job
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Job
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Header>

      <div className="flex-1 p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="applications">
              Applications ({applications.length})
            </TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard
                title="Total Applications"
                value={applications.length}
                icon={Users}
              />
              <StatCard
                title="Active"
                value={applications.filter((a) => a.status === "active").length}
                icon={Clock}
              />
              <StatCard
                title="Interviews"
                value={stages.find((s) => s.type === "interview")
                  ? applications.filter((a) =>
                      stages.find((s) => s.id === a.currentStageId)?.type === "interview"
                    ).length
                  : 0}
                icon={Calendar}
              />
              <StatCard
                title="Hired"
                value={applications.filter((a) => a.status === "hired").length}
                icon={Users}
              />
            </div>

            {/* Job Details */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{job.description}</p>
                  </CardContent>
                </Card>

                {job.requirements && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Requirements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap">{job.requirements}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Job Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">
                          {formatLocation(job)}
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Employment Type</p>
                        <p className="text-sm text-muted-foreground">
                          {formatEmploymentType(job.employmentType)}
                        </p>
                      </div>
                    </div>
                    {job.salary && (
                      <>
                        <Separator />
                        <div className="flex items-center gap-3">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Salary Range</p>
                            <p className="text-sm text-muted-foreground">
                              {formatSalary(job.salary)}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Pipeline Stages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stages
                        .sort((a, b) => a.order - b.order)
                        .map((stage) => {
                          const count = applications.filter(
                            (a) => a.currentStageId === stage.id && a.status === "active"
                          ).length;
                          return (
                            <div
                              key={stage.id}
                              className="flex items-center justify-between rounded-lg border p-2"
                            >
                              <span className="text-sm">{stage.name}</span>
                              <Badge variant="secondary">{count}</Badge>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            {applications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-lg font-medium">No applications yet</p>
                  <p className="text-sm text-muted-foreground">
                    Applications will appear here when candidates apply.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {applications.map((application) => {
                  const candidate = candidates.find(
                    (c) => c.id === application.candidateId
                  );
                  const stage = stages.find((s) => s.id === application.currentStageId);
                  return (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      candidate={candidate}
                      stage={stage}
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pipeline">
            <Card>
              <CardContent className="py-12 text-center">
                <Kanban className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium">Pipeline View</p>
                <p className="text-sm text-muted-foreground">
                  View and manage candidates in a kanban-style board.
                </p>
                <Button className="mt-4" asChild>
                  <Link href={`/jobs/${id}/pipeline`}>Open Pipeline</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function JobDetailSkeleton() {
  return (
    <div className="flex flex-col">
      <Header>
        <div className="h-6 w-48 animate-pulse rounded bg-muted" />
      </Header>
      <div className="flex-1 space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function ApplicationCard({
  application,
  candidate,
  stage,
}: {
  application: Application;
  candidate?: Candidate;
  stage?: PipelineStage;
}) {
  return (
    <Link href={`/applications/${application.id}`}>
      <Card className="transition-colors hover:bg-accent/30">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
              {candidate
                ? `${candidate.firstName[0]}${candidate.lastName[0]}`
                : "?"}
            </div>
            <div>
              <p className="font-medium">
                {candidate
                  ? `${candidate.firstName} ${candidate.lastName}`
                  : "Unknown Candidate"}
              </p>
              <p className="text-sm text-muted-foreground">
                {candidate?.email || "No email"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {stage && (
              <Badge variant="outline">{stage.name}</Badge>
            )}
            <ApplicationStatusBadge status={application.status} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function StatusBadge({ status }: { status: Job["status"] }) {
  const colors: Record<Job["status"], string> = {
    draft: "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400",
    open: "bg-green-500/10 text-green-600 dark:text-green-400",
    paused: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    closed: "bg-red-500/10 text-red-600 dark:text-red-400",
    archived: "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400",
  };

  return (
    <Badge className={colors[status]}>{status}</Badge>
  );
}

function ApplicationStatusBadge({ status }: { status: Application["status"] }) {
  const colors: Record<Application["status"], string> = {
    active: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    hired: "bg-green-500/10 text-green-600 dark:text-green-400",
    rejected: "bg-red-500/10 text-red-600 dark:text-red-400",
    withdrawn: "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400",
  };

  return (
    <Badge className={colors[status]}>{status}</Badge>
  );
}

function formatLocation(job: Job): string {
  if (job.location.type === "remote") return "Remote";
  const parts = [job.location.city, job.location.country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : job.location.type;
}

function formatEmploymentType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function formatSalary(salary: NonNullable<Job["salary"]>): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: salary.currency,
    maximumFractionDigits: 0,
  });
  return `${formatter.format(salary.min)} - ${formatter.format(salary.max)} / ${salary.period}`;
}
