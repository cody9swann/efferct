"use client";

import { useState } from "react";
import { Result, useAtomValue } from "@effect-atom/atom-react";
import Link from "next/link";
import { Plus, Mail, Phone, Linkedin, MoreHorizontal } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { candidatesAtom } from "@/atoms/api";
import { CreateCandidateDialog } from "@/components/candidates/create-candidate-dialog";
import type { Candidate } from "@ats/shared";

export default function CandidatesPage() {
  const result = useAtomValue(candidatesAtom);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <div className="flex flex-col">
      <Header title="Candidates">
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Candidate
        </Button>
      </Header>

      <div className="flex-1 p-6">
        {Result.builder(result)
          .onInitial(() => <CandidatesListSkeleton />)
          .onSuccess((data) => <CandidatesList candidates={data} />)
          .onFailure((err) => (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
              Error loading candidates: {String(err)}
            </div>
          ))
          .onDefect(() => (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
              An unexpected error occurred
            </div>
          ))
          .render()}
      </div>

      <CreateCandidateDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
}

function CandidatesListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  );
}

function CandidatesList({ candidates }: { candidates: Candidate[] }) {
  if (candidates.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-lg font-medium">No candidates yet</p>
          <p className="text-sm text-muted-foreground">
            Add your first candidate to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {candidates.map((candidate: Candidate) => (
        <CandidateCard key={candidate.id} candidate={candidate} />
      ))}
    </div>
  );
}

function CandidateCard({ candidate }: { candidate: Candidate }) {
  const sourceColors: Record<Candidate["source"], string> = {
    applied: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    sourced: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    referred: "bg-green-500/10 text-green-600 dark:text-green-400",
    agency: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    internal: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  };

  return (
    <Card className="transition-colors hover:bg-accent/30">
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-4">
          <Link href={`/candidates/${candidate.id}`} className="flex flex-1 items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {candidate.firstName[0]}
                {candidate.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">
                  {candidate.firstName} {candidate.lastName}
                </h3>
                <Badge className={sourceColors[candidate.source]}>
                  {candidate.source}
                </Badge>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {candidate.email}
                </span>
                {candidate.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {candidate.phone}
                  </span>
                )}
                {candidate.linkedinUrl && (
                  <span className="flex items-center gap-1">
                    <Linkedin className="h-3.5 w-3.5" />
                    LinkedIn
                  </span>
                )}
              </div>
              {candidate.tags && candidate.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {candidate.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/candidates/${candidate.id}`}>View Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Edit Candidate</DropdownMenuItem>
              <DropdownMenuItem>Add to Job</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
