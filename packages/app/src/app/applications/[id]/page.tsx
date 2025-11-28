"use client";

import { use, useState, useContext } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Result, useAtomValue, RegistryContext, Registry } from "@effect-atom/atom-react";
import { Effect } from "effect";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  Phone,
  Building,
  Code,
  Users,
  Award,
  MoreHorizontal,
  Plus,
  CheckCircle,
  XCircle,
  Send,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  applicationAtom,
  candidateAtom,
  jobAtom,
  pipelineStagesAtom,
  interviewsByApplicationAtom,
  notesByApplicationAtom,
  activitiesByApplicationAtom,
  createNote,
  rejectApplication,
} from "@/atoms/api";
import { ScheduleInterviewDialog } from "@/components/interviews/schedule-interview-dialog";
import { ScorecardDialog } from "@/components/scorecards/scorecard-dialog";
import type { Interview, Note, Activity, PipelineStage, CandidateId, ApplicationId, Application, ApplicationStatus, InterviewStatus } from "@ats/shared";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface ApplicationContentProps {
  applicationId: string;
  application: Application;
  router: AppRouterInstance;
  registry: Registry.Registry;
  scheduleDialogOpen: boolean;
  setScheduleDialogOpen: Dispatch<SetStateAction<boolean>>;
  scorecardDialogOpen: boolean;
  setScorecardDialogOpen: Dispatch<SetStateAction<boolean>>;
  selectedInterview: Interview | null;
  setSelectedInterview: Dispatch<SetStateAction<Interview | null>>;
  newNote: string;
  setNewNote: Dispatch<SetStateAction<string>>;
  isSubmittingNote: boolean;
  setIsSubmittingNote: Dispatch<SetStateAction<boolean>>;
}

export default function ApplicationDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const registry = useContext(RegistryContext);

  const applicationResult = useAtomValue(applicationAtom(id));

  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scorecardDialogOpen, setScorecardDialogOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [newNote, setNewNote] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  const isLoading = Result.isInitial(applicationResult);

  if (isLoading) {
    return <ApplicationDetailSkeleton />;
  }

  if (Result.isFailure(applicationResult)) {
    return (
      <div className="flex flex-col">
        <Header title="Application Not Found">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Header>
      </div>
    );
  }

  const application = applicationResult.value;

  return (
    <ApplicationContent
      applicationId={id}
      application={application}
      router={router}
      registry={registry}
      scheduleDialogOpen={scheduleDialogOpen}
      setScheduleDialogOpen={setScheduleDialogOpen}
      scorecardDialogOpen={scorecardDialogOpen}
      setScorecardDialogOpen={setScorecardDialogOpen}
      selectedInterview={selectedInterview}
      setSelectedInterview={setSelectedInterview}
      newNote={newNote}
      setNewNote={setNewNote}
      isSubmittingNote={isSubmittingNote}
      setIsSubmittingNote={setIsSubmittingNote}
    />
  );
}

function ApplicationContent({
  applicationId,
  application,
  router,
  registry,
  scheduleDialogOpen,
  setScheduleDialogOpen,
  scorecardDialogOpen,
  setScorecardDialogOpen,
  selectedInterview,
  setSelectedInterview,
  newNote,
  setNewNote,
  isSubmittingNote,
  setIsSubmittingNote,
}: ApplicationContentProps) {
  const candidateResult = useAtomValue(candidateAtom(application.candidateId));
  const jobResult = useAtomValue(jobAtom(application.jobId));
  const stagesResult = useAtomValue(pipelineStagesAtom(application.jobId));
  const interviewsResult = useAtomValue(interviewsByApplicationAtom(applicationId));
  const notesResult = useAtomValue(notesByApplicationAtom(applicationId));
  const activitiesResult = useAtomValue(activitiesByApplicationAtom(applicationId));

  const candidate = Result.isSuccess(candidateResult) ? candidateResult.value : null;
  const job = Result.isSuccess(jobResult) ? jobResult.value : null;
  const stages = Result.isSuccess(stagesResult) ? stagesResult.value : [];
  const interviews = Result.isSuccess(interviewsResult) ? interviewsResult.value : [];
  const notes = Result.isSuccess(notesResult) ? notesResult.value : [];
  const activities = Result.isSuccess(activitiesResult) ? activitiesResult.value : [];

  const currentStage = stages.find((s) => s.id === application.currentStageId);

  const statusColors: Record<ApplicationStatus, string> = {
    active: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    hired: "bg-green-500/10 text-green-600 dark:text-green-400",
    rejected: "bg-red-500/10 text-red-600 dark:text-red-400",
    withdrawn: "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400",
  };

  const handleReject = async () => {
    const result = await Effect.runPromise(
      rejectApplication(applicationId).pipe(
        Effect.tap(() => Effect.sync(() => {
          registry.refresh(applicationAtom(applicationId));
        })),
        Effect.either
      )
    );

    if (result._tag === "Right") {
      toast.success("Application rejected");
    } else {
      toast.error(`Failed to reject: ${result.left.message}`);
    }
  };

  const handleSubmitNote = async () => {
    if (!newNote.trim()) return;
    setIsSubmittingNote(true);

    const result = await Effect.runPromise(
      createNote({
        candidateId: application.candidateId as CandidateId,
        applicationId: applicationId as ApplicationId,
        content: newNote,
        isPrivate: false,
      }).pipe(
        Effect.tap(() => Effect.sync(() => {
          registry.refresh(notesByApplicationAtom(applicationId));
        })),
        Effect.either
      )
    );

    setIsSubmittingNote(false);

    if (result._tag === "Right") {
      toast.success("Note added");
      setNewNote("");
    } else {
      toast.error(`Failed to add note: ${result.left.message}`);
    }
  };

  return (
    <div className="flex flex-col">
      <Header>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {candidate ? `${candidate.firstName[0]}${candidate.lastName[0]}` : "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-lg font-semibold">
              {candidate ? `${candidate.firstName} ${candidate.lastName}` : "Loading..."}
            </h1>
            <p className="text-sm text-muted-foreground">
              {job?.title || "Loading..."} • Applied {format(new Date(application.appliedAt), "MMM d, yyyy")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusColors[application.status]}>{application.status}</Badge>
          {currentStage && <Badge variant="outline">{currentStage.name}</Badge>}
          <Button onClick={() => setScheduleDialogOpen(true)}>
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Interview
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/candidates/${application.candidateId}`}>View Candidate</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/jobs/${application.jobId}`}>View Job</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-green-500">
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Hired
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={handleReject}>
                <XCircle className="mr-2 h-4 w-4" />
                Reject Application
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Header>

      <div className="flex-1 p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="interviews" className="space-y-6">
              <TabsList>
                <TabsTrigger value="interviews">
                  Interviews ({interviews.length})
                </TabsTrigger>
                <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="interviews" className="space-y-4">
                {interviews.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-4 text-lg font-medium">No interviews scheduled</p>
                      <p className="text-sm text-muted-foreground">
                        Schedule an interview to move this candidate forward.
                      </p>
                      <Button className="mt-4" onClick={() => setScheduleDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Schedule Interview
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  interviews.map((interview) => (
                    <InterviewCard
                      key={interview.id}
                      interview={interview}
                      onAddScorecard={() => {
                        setSelectedInterview(interview);
                        setScorecardDialogOpen(true);
                      }}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                <Card>
                  <CardContent className="pt-4">
                    <Textarea
                      placeholder="Add a note about this application..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={3}
                    />
                    <div className="mt-2 flex justify-end">
                      <Button
                        onClick={handleSubmitNote}
                        disabled={isSubmittingNote || !newNote.trim()}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        {isSubmittingNote ? "Adding..." : "Add Note"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {notes.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No notes yet
                    </CardContent>
                  </Card>
                ) : (
                  notes.map((note) => <NoteCard key={note.id} note={note} />)
                )}
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                {activities.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No activity yet
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <ActivityCard key={activity.id} activity={activity} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pipeline Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stages
                    .sort((a, b) => a.order - b.order)
                    .map((stage) => {
                      const isCurrent = stage.id === application.currentStageId;
                      const isPast = stage.order < (currentStage?.order || 0);
                      return (
                        <div
                          key={stage.id}
                          className={`flex items-center gap-3 rounded-lg border p-2 ${
                            isCurrent ? "border-primary bg-primary/10" : ""
                          }`}
                        >
                          <div
                            className={`h-2 w-2 rounded-full ${
                              isCurrent
                                ? "bg-primary"
                                : isPast
                                ? "bg-green-500"
                                : "bg-muted"
                            }`}
                          />
                          <span
                            className={`text-sm ${
                              isCurrent ? "font-medium" : "text-muted-foreground"
                            }`}
                          >
                            {stage.name}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

            {/* Rating */}
            {application.rating != null && (
              <RatingCard rating={application.rating} />
            )}

            {/* AI Score */}
            {application.aiScore && (
              <Card>
                <CardHeader>
                  <CardTitle>AI Screening Score</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ScoreBar label="Overall" score={application.aiScore.overall} />
                  <ScoreBar label="Skills" score={application.aiScore.skills} />
                  <ScoreBar label="Experience" score={application.aiScore.experience} />
                  <ScoreBar label="Culture" score={application.aiScore.culture} />
                  {application.aiScore.reasoning && (
                    <>
                      <Separator />
                      <p className="text-sm text-muted-foreground">
                        {application.aiScore.reasoning}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <ScheduleInterviewDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        applicationId={applicationId}
      />

      {selectedInterview && (
        <ScorecardDialog
          open={scorecardDialogOpen}
          onOpenChange={setScorecardDialogOpen}
          interviewId={selectedInterview.id}
        />
      )}
    </div>
  );
}

function ApplicationDetailSkeleton() {
  return (
    <div className="flex flex-col">
      <Header>
        <div className="h-6 w-48 animate-pulse rounded bg-muted" />
      </Header>
      <div className="grid flex-1 gap-6 p-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="space-y-6">
          <div className="h-48 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}

function InterviewCard({
  interview,
  onAddScorecard,
}: {
  interview: Interview;
  onAddScorecard: () => void;
}) {
  const interviewTypeIcons: Record<string, React.ReactNode> = {
    phone_screen: <Phone className="h-4 w-4" />,
    video: <Video className="h-4 w-4" />,
    onsite: <Building className="h-4 w-4" />,
    technical: <Code className="h-4 w-4" />,
    cultural: <Users className="h-4 w-4" />,
    executive: <Award className="h-4 w-4" />,
  };

  const statusColors: Record<InterviewStatus, string> = {
    scheduled: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    completed: "bg-green-500/10 text-green-600 dark:text-green-400",
    cancelled: "bg-red-500/10 text-red-600 dark:text-red-400",
    no_show: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              {interviewTypeIcons[interview.type] || <Calendar className="h-4 w-4" />}
            </div>
            <div>
              <p className="font-medium">
                {interview.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(interview.scheduledAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
              {interview.meetingLink && (
                <a
                  href={interview.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-sm text-primary hover:underline"
                >
                  Join Meeting
                </a>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={statusColors[interview.status]}>{interview.status}</Badge>
            {interview.status === "completed" && (
              <Button variant="outline" size="sm" onClick={onAddScorecard}>
                Add Scorecard
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NoteCard({ note }: { note: Note }) {
  return (
    <Card>
      <CardContent className="pt-4">
        <p className="text-sm whitespace-pre-wrap">{note.content}</p>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {format(new Date(note.createdAt), "MMM d, yyyy 'at' h:mm a")}
          {note.isPrivate && <Badge variant="outline">Private</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
        <Clock className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm">{activity.type.replace(/_/g, " ")}</p>
        <p className="text-xs text-muted-foreground">
          {format(new Date(activity.createdAt), "MMM d, yyyy 'at' h:mm a")}
        </p>
      </div>
    </div>
  );
}

function RatingCard({ rating }: { rating: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Overall Rating</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`text-2xl ${
                star <= rating ? "text-yellow-500" : "text-muted-foreground"
              }`}
            >
              ★
            </span>
          ))}
          <span className="ml-2 text-lg font-medium">{rating}/5</span>
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const percentage = (score / 100) * 100;
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{score}%</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
