"use client";

import { useState } from "react";
import { Result, useAtomValue } from "@effect-atom/atom-react";
import Link from "next/link";
import { Plus, MapPin, Clock, DollarSign, MoreHorizontal, Kanban } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { jobsAtom } from "@/atoms/api";
import { CreateJobDialog } from "@/components/jobs/create-job-dialog";
import type { Job } from "@ats/shared";

export default function JobsPage() {
  const result = useAtomValue(jobsAtom);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <div className="flex flex-col">
      <Header title="Jobs">
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Job
        </Button>
      </Header>

      <div className="flex-1 p-6">
        {Result.builder(result)
          .onInitial(() => <JobsListSkeleton />)
          .onSuccess((data) => <JobsList jobs={data} />)
          .onFailure((err) => (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
              Error loading jobs: {String(err)}
            </div>
          ))
          .onDefect(() => (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
              An unexpected error occurred
            </div>
          ))
          .render()}
      </div>

      <CreateJobDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
}

function JobsListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  );
}

function JobsList({ jobs }: { jobs: Job[] }) {
  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-lg font-medium">No jobs yet</p>
          <p className="text-sm text-muted-foreground">Create your first job posting to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job: Job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
  const statusVariant: Record<Job["status"], "default" | "secondary" | "destructive" | "outline"> = {
    draft: "secondary",
    open: "default",
    paused: "outline",
    closed: "destructive",
    archived: "secondary",
  };

  const statusColors: Record<Job["status"], string> = {
    draft: "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400",
    open: "bg-green-500/10 text-green-600 dark:text-green-400",
    paused: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    closed: "bg-red-500/10 text-red-600 dark:text-red-400",
    archived: "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400",
  };

  return (
    <Card className="transition-colors hover:bg-accent/30">
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-4">
          <Link href={`/jobs/${job.id}`} className="flex-1">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold">{job.title}</h3>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {job.location.type === "remote" ? "Remote" : job.location.city || "Location TBD"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatEmploymentType(job.employmentType)}
                  </span>
                  {job.salary && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" />
                      {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Badge className={statusColors[job.status]}>{job.status}</Badge>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/jobs/${job.id}/pipeline`}>
                <Kanban className="mr-1 h-3.5 w-3.5" />
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
                <DropdownMenuItem asChild>
                  <Link href={`/jobs/${job.id}`}>View Details</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/jobs/${job.id}/pipeline`}>View Pipeline</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/jobs/${job.id}/edit`}>Edit Job</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatEmploymentType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function formatSalary(min: number, max: number, currency: string): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
  return `${formatter.format(min)} - ${formatter.format(max)}`;
}
