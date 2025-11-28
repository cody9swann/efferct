"use client";

import { use, useState, useContext } from "react";
import { Result, useAtomValue, RegistryContext } from "@effect-atom/atom-react";
import { Effect } from "effect";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowLeft, GripVertical, Mail, Phone, MoreHorizontal } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  jobAtom,
  pipelineStagesAtom,
  applicationsByJobAtom,
  candidatesAtom,
  moveApplicationStage,
} from "@/atoms/api";
import type { Application, PipelineStage, Candidate, PipelineStageType } from "@ats/shared";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PipelinePage({ params }: PageProps) {
  const { id: jobId } = use(params);
  const router = useRouter();
  const registry = useContext(RegistryContext);

  const jobResult = useAtomValue(jobAtom(jobId));
  const stagesResult = useAtomValue(pipelineStagesAtom(jobId));
  const applicationsResult = useAtomValue(applicationsByJobAtom(jobId));
  const candidatesResult = useAtomValue(candidatesAtom);

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor)
  );

  const isLoading =
    Result.isInitial(jobResult) ||
    Result.isInitial(stagesResult) ||
    Result.isInitial(applicationsResult);

  if (isLoading) {
    return <PipelineSkeleton />;
  }

  if (Result.isFailure(jobResult)) {
    return (
      <div className="flex flex-col">
        <Header title="Pipeline Not Found">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Header>
      </div>
    );
  }

  const job = jobResult.value;
  const stages = Result.isSuccess(stagesResult)
    ? stagesResult.value.sort((a, b) => a.order - b.order)
    : [];
  const applications = Result.isSuccess(applicationsResult)
    ? applicationsResult.value.filter((a) => a.status === "active")
    : [];
  const candidates = Result.isSuccess(candidatesResult) ? candidatesResult.value : [];

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const applicationId = active.id as string;
    const newStageId = over.id as string;

    const application = applications.find((a) => a.id === applicationId);
    if (!application || application.currentStageId === newStageId) return;

    // Optimistic update would go here if we had local state
    // For now, just call the API and refresh

    const result = await Effect.runPromise(
      moveApplicationStage(applicationId, newStageId).pipe(Effect.either)
    );

    if (result._tag === "Right") {
      toast.success("Application moved successfully");
      registry.refresh(applicationsByJobAtom(jobId));
    } else {
      toast.error(`Failed to move application: ${result.left.message}`);
    }
  };

  const activeApplication = activeId
    ? applications.find((a) => a.id === activeId)
    : null;
  const activeCandidate = activeApplication
    ? candidates.find((c) => c.id === activeApplication.candidateId)
    : null;

  return (
    <div className="flex h-screen flex-col">
      <Header>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/jobs/${jobId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{job.title}</h1>
            <p className="text-sm text-muted-foreground">Pipeline View</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{applications.length} active</Badge>
        </div>
      </Header>

      <div className="flex-1 overflow-hidden p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex h-full gap-4 overflow-x-auto pb-4">
            {stages.map((stage) => (
              <PipelineColumn
                key={stage.id}
                stage={stage}
                applications={applications.filter(
                  (a) => a.currentStageId === stage.id
                )}
                candidates={candidates}
              />
            ))}
          </div>

          <DragOverlay>
            {activeApplication && activeCandidate && (
              <ApplicationCard
                application={activeApplication}
                candidate={activeCandidate}
                isDragging
              />
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}

function PipelineSkeleton() {
  return (
    <div className="flex h-screen flex-col">
      <Header>
        <div className="h-6 w-48 animate-pulse rounded bg-muted" />
      </Header>
      <div className="flex flex-1 gap-4 overflow-hidden p-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-full w-72 flex-shrink-0 animate-pulse rounded-lg bg-muted"
          />
        ))}
      </div>
    </div>
  );
}

function PipelineColumn({
  stage,
  applications,
  candidates,
}: {
  stage: PipelineStage;
  applications: Application[];
  candidates: Candidate[];
}) {
  const { setNodeRef } = useSortable({
    id: stage.id,
    data: { type: "column" },
  });

  const stageTypeColors: Record<PipelineStageType, string> = {
    sourced: "bg-purple-500",
    applied: "bg-blue-500",
    screening: "bg-cyan-500",
    interview: "bg-yellow-500",
    offer: "bg-orange-500",
    hired: "bg-green-500",
    rejected: "bg-red-500",
  };

  return (
    <div
      ref={setNodeRef}
      className="flex h-full w-72 flex-shrink-0 flex-col rounded-lg border bg-card"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between border-b p-3">
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${stageTypeColors[stage.type] || "bg-gray-500"}`}
          />
          <span className="font-medium">{stage.name}</span>
        </div>
        <Badge variant="secondary">{applications.length}</Badge>
      </div>

      {/* Column Content */}
      <ScrollArea className="flex-1">
        <SortableContext
          items={applications.map((a) => a.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 p-2">
            {applications.length === 0 ? (
              <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                No candidates
              </div>
            ) : (
              applications.map((application) => {
                const candidate = candidates.find(
                  (c) => c.id === application.candidateId
                );
                if (!candidate) return null;
                return (
                  <SortableApplicationCard
                    key={application.id}
                    application={application}
                    candidate={candidate}
                  />
                );
              })
            )}
          </div>
        </SortableContext>
      </ScrollArea>
    </div>
  );
}

function SortableApplicationCard({
  application,
  candidate,
}: {
  application: Application;
  candidate: Candidate;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: application.id,
    data: { type: "application", application, candidate },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ApplicationCard
        application={application}
        candidate={candidate}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

function ApplicationCard({
  application,
  candidate,
  isDragging,
  dragHandleProps,
}: {
  application: Application;
  candidate: Candidate;
  isDragging?: boolean;
  dragHandleProps?: Record<string, any>;
}) {
  return (
    <Card
      className={`transition-shadow ${
        isDragging ? "shadow-lg ring-2 ring-primary" : "hover:shadow-md"
      }`}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          {dragHandleProps && (
            <button
              className="mt-1 cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
              {...dragHandleProps}
            >
              <GripVertical className="h-4 w-4" />
            </button>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <Link
                href={`/candidates/${candidate.id}`}
                className="font-medium hover:underline"
              >
                {candidate.firstName} {candidate.lastName}
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/applications/${application.id}`}>
                      View Application
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/candidates/${candidate.id}`}>
                      View Profile
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {candidate.email && (
                <span className="flex items-center gap-1 truncate">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{candidate.email}</span>
                </span>
              )}
            </div>

            {candidate.tags && candidate.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {candidate.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {candidate.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{candidate.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {application.rating && (
              <div className="mt-2 flex items-center gap-1">
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
