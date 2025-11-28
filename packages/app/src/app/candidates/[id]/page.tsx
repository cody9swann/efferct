"use client";

import { use, useState, useContext } from "react";
import { Result, useAtomValue, RegistryContext } from "@effect-atom/atom-react";
import { Effect } from "effect";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  Linkedin,
  FileText,
  Calendar,
  Clock,
  Edit,
  MoreHorizontal,
  Plus,
  Send,
} from "lucide-react";
import { format } from "date-fns";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  candidateAtom,
  applicationsByCandidateAtom,
  notesByCandidateAtom,
  activitiesByCandidateAtom,
  jobsAtom,
  createNote,
} from "@/atoms/api";
import type { Application, Note, Activity, Job, CandidateId, CandidateSource, ApplicationStatus, ActivityType } from "@ats/shared";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CandidateProfilePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const registry = useContext(RegistryContext);

  const candidateResult = useAtomValue(candidateAtom(id));
  const applicationsResult = useAtomValue(applicationsByCandidateAtom(id));
  const notesResult = useAtomValue(notesByCandidateAtom(id));
  const activitiesResult = useAtomValue(activitiesByCandidateAtom(id));
  const jobsResult = useAtomValue(jobsAtom);

  const [newNote, setNewNote] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  const isLoading = Result.isInitial(candidateResult);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (Result.isFailure(candidateResult)) {
    return (
      <div className="flex flex-col">
        <Header title="Candidate Not Found">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Header>
        <div className="p-6">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-lg font-medium">Candidate not found</p>
              <p className="text-sm text-muted-foreground">
                The candidate you're looking for doesn't exist or has been removed.
              </p>
              <Button className="mt-4" onClick={() => router.push("/candidates")}>
                View All Candidates
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const candidate = candidateResult.value;
  const applications = Result.isSuccess(applicationsResult) ? applicationsResult.value : [];
  const notes = Result.isSuccess(notesResult) ? notesResult.value : [];
  const activities = Result.isSuccess(activitiesResult) ? activitiesResult.value : [];
  const jobs = Result.isSuccess(jobsResult) ? jobsResult.value : [];

  const sourceColors: Record<CandidateSource, string> = {
    applied: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    sourced: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    referred: "bg-green-500/10 text-green-600 dark:text-green-400",
    agency: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    internal: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  };

  const handleSubmitNote = async () => {
    if (!newNote.trim()) return;
    setIsSubmittingNote(true);

    const result = await Effect.runPromise(
      createNote({
        candidateId: id as CandidateId,
        content: newNote,
        isPrivate: false,
      }).pipe(
        Effect.tap(() => Effect.sync(() => {
          registry.refresh(notesByCandidateAtom(id));
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
              {candidate.firstName[0]}
              {candidate.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-lg font-semibold">
              {candidate.firstName} {candidate.lastName}
            </h1>
            <p className="text-sm text-muted-foreground">{candidate.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={sourceColors[candidate.source]}>{candidate.source}</Badge>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Add to Job</DropdownMenuItem>
              <DropdownMenuItem>Send Email</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Delete Candidate</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Header>

      <div className="flex-1 p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="applications" className="space-y-6">
              <TabsList>
                <TabsTrigger value="applications">
                  Applications ({applications.length})
                </TabsTrigger>
                <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="applications" className="space-y-4">
                {applications.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-lg font-medium">No applications yet</p>
                      <p className="text-sm text-muted-foreground">
                        This candidate hasn't applied to any jobs.
                      </p>
                      <Button className="mt-4">
                        <Plus className="mr-2 h-4 w-4" />
                        Add to Job
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  applications.map((application) => {
                    const job = jobs.find((j) => j.id === application.jobId);
                    return (
                      <ApplicationCard
                        key={application.id}
                        application={application}
                        job={job}
                      />
                    );
                  })
                )}
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                {/* Add Note Form */}
                <Card>
                  <CardContent className="pt-4">
                    <Textarea
                      placeholder="Add a note about this candidate..."
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

                {/* Notes List */}
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
                      <ActivityCard key={activity.id} activity={activity} jobs={jobs} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${candidate.email}`}
                    className="text-sm hover:underline"
                  >
                    {candidate.email}
                  </a>
                </div>
                {candidate.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`tel:${candidate.phone}`}
                      className="text-sm hover:underline"
                    >
                      {candidate.phone}
                    </a>
                  </div>
                )}
                {candidate.linkedinUrl && (
                  <div className="flex items-center gap-3">
                    <Linkedin className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={candidate.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                )}
                {candidate.resumeUrl && (
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={candidate.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline"
                    >
                      View Resume
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {candidate.tags && candidate.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {candidate.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Source</span>
                  <Badge className={sourceColors[candidate.source]}>
                    {candidate.source}
                  </Badge>
                </div>
                {candidate.sourceDetails && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Source Details</span>
                    <span className="text-sm">{candidate.sourceDetails}</span>
                  </div>
                )}
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Added</span>
                  <span className="text-sm">
                    {format(new Date(candidate.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
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
          <div className="h-32 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}

function ApplicationCard({ application, job }: { application: Application; job?: Job }) {
  const statusColors: Record<ApplicationStatus, string> = {
    active: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    hired: "bg-green-500/10 text-green-600 dark:text-green-400",
    rejected: "bg-red-500/10 text-red-600 dark:text-red-400",
    withdrawn: "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400",
  };

  return (
    <Link href={`/applications/${application.id}`}>
      <Card className="transition-colors hover:bg-accent/30">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="font-medium">{job?.title || "Unknown Position"}</p>
            <p className="text-sm text-muted-foreground">
              Applied {format(new Date(application.appliedAt), "MMM d, yyyy")}
            </p>
          </div>
          <Badge className={statusColors[application.status]}>{application.status}</Badge>
        </CardContent>
      </Card>
    </Link>
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

function ActivityCard({ activity, jobs }: { activity: Activity; jobs: Job[] }) {
  const activityIcons: Record<string, React.ReactNode> = {
    application_created: <FileText className="h-4 w-4" />,
    stage_changed: <ArrowLeft className="h-4 w-4 rotate-180" />,
    interview_scheduled: <Calendar className="h-4 w-4" />,
    note_added: <FileText className="h-4 w-4" />,
  };

  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
        {activityIcons[activity.type] || <Clock className="h-4 w-4" />}
      </div>
      <div className="flex-1">
        <p className="text-sm">{formatActivityMessage(activity, jobs)}</p>
        <p className="text-xs text-muted-foreground">
          {format(new Date(activity.createdAt), "MMM d, yyyy 'at' h:mm a")}
        </p>
      </div>
    </div>
  );
}

function formatActivityMessage(activity: Activity, _jobs: Job[]): string {
  const messages: Record<ActivityType, string> = {
    application_created: "Applied for a position",
    stage_changed: "Moved to a new stage",
    interview_scheduled: "Interview scheduled",
    note_added: "Note added",
    email_sent: "Email sent",
    email_received: "Email received",
    scorecard_submitted: "Scorecard submitted",
    offer_sent: "Offer sent",
    offer_accepted: "Offer accepted",
    offer_rejected: "Offer rejected",
    status_changed: "Status changed",
    ai_screening_completed: "AI screening completed",
  };

  return messages[activity.type];
}
