"use client";

import { useRouter } from "next/navigation";
import { Result, useAtomValue } from "@effect-atom/atom-react";
import {
  Briefcase,
  Users,
  FileText,
  LayoutDashboard,
  Plus,
  Search,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { jobsAtom, candidatesAtom } from "@/atoms/api";
import type { Job, Candidate } from "@ats/shared";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const jobsResult = useAtomValue(jobsAtom);
  const candidatesResult = useAtomValue(candidatesAtom);

  const jobs = Result.isSuccess(jobsResult) ? jobsResult.value : [];
  const candidates = Result.isSuccess(candidatesResult) ? candidatesResult.value : [];

  const runCommand = (command: () => void) => {
    onOpenChange(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand(() => router.push("/jobs/new"))}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Job
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/candidates/new"))}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Candidate
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/jobs"))}>
            <Briefcase className="mr-2 h-4 w-4" />
            Jobs
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/candidates"))}>
            <Users className="mr-2 h-4 w-4" />
            Candidates
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/applications"))}>
            <FileText className="mr-2 h-4 w-4" />
            Applications
          </CommandItem>
        </CommandGroup>

        {jobs.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Jobs">
              {jobs.slice(0, 5).map((job: Job) => (
                <CommandItem
                  key={job.id}
                  onSelect={() => runCommand(() => router.push(`/jobs/${job.id}`))}
                >
                  <Briefcase className="mr-2 h-4 w-4" />
                  <span>{job.title}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {job.status}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {candidates.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Candidates">
              {candidates.slice(0, 5).map((candidate: Candidate) => (
                <CommandItem
                  key={candidate.id}
                  onSelect={() => runCommand(() => router.push(`/candidates/${candidate.id}`))}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <span>
                    {candidate.firstName} {candidate.lastName}
                  </span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {candidate.email}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
