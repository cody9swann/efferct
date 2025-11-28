"use client";

import { useState, useContext } from "react";
import { Effect } from "effect";
import { RegistryContext } from "@effect-atom/atom-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { scheduleInterview, interviewsByApplicationAtom } from "@/atoms/api";
import type { ApplicationId } from "@ats/shared";

type InterviewType = "phone_screen" | "video" | "onsite" | "technical" | "cultural" | "executive";

interface ScheduleInterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
}

export function ScheduleInterviewDialog({
  open,
  onOpenChange,
  applicationId,
}: ScheduleInterviewDialogProps) {
  const registry = useContext(RegistryContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    type: "video" as InterviewType,
    date: "",
    time: "",
    duration: "60",
    meetingLink: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const scheduledAt = new Date(`${formData.date}T${formData.time}`).toISOString();

    const result = await Effect.runPromise(
      scheduleInterview({
        applicationId: applicationId as ApplicationId,
        type: formData.type,
        scheduledAt,
        duration: Number(formData.duration),
        meetingLink: formData.meetingLink || undefined,
        interviewerIds: [],
      }).pipe(
        Effect.tap(() => Effect.sync(() => {
          registry.refresh(interviewsByApplicationAtom(applicationId));
        })),
        Effect.either
      )
    );

    setIsSubmitting(false);

    if (result._tag === "Right") {
      toast.success("Interview scheduled successfully");
      onOpenChange(false);
      resetForm();
    } else {
      toast.error(`Failed to schedule interview: ${result.left.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      type: "video",
      date: "",
      time: "",
      duration: "60",
      meetingLink: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Interview</DialogTitle>
          <DialogDescription>
            Schedule a new interview for this candidate.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Interview Type */}
          <div className="space-y-2">
            <Label>Interview Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: InterviewType) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phone_screen">Phone Screen</SelectItem>
                <SelectItem value="video">Video Interview</SelectItem>
                <SelectItem value="onsite">On-site Interview</SelectItem>
                <SelectItem value="technical">Technical Interview</SelectItem>
                <SelectItem value="cultural">Cultural Interview</SelectItem>
                <SelectItem value="executive">Executive Interview</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Duration</Label>
            <Select
              value={formData.duration}
              onValueChange={(value) => setFormData({ ...formData, duration: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Meeting Link */}
          <div className="space-y-2">
            <Label htmlFor="meetingLink">Meeting Link</Label>
            <Input
              id="meetingLink"
              type="url"
              placeholder="https://zoom.us/j/..."
              value={formData.meetingLink}
              onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Scheduling..." : "Schedule Interview"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
