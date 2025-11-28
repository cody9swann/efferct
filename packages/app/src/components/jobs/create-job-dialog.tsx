"use client";

import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createJob, jobsAtom } from "@/atoms/api";
import type { CreateJobInput, EmploymentType, LocationType } from "@ats/shared";

interface CreateJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateJobDialog({ open, onOpenChange }: CreateJobDialogProps) {
  const router = useRouter();
  const registry = useContext(RegistryContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    employmentType: "full_time" as EmploymentType,
    locationType: "remote" as LocationType,
    city: "",
    country: "",
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "USD",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const input: CreateJobInput = {
      title: formData.title,
      description: formData.description,
      requirements: formData.requirements || undefined,
      employmentType: formData.employmentType,
      location: {
        type: formData.locationType,
        city: formData.city || undefined,
        country: formData.country || undefined,
      },
      salary: formData.salaryMin && formData.salaryMax
        ? {
            min: Number(formData.salaryMin),
            max: Number(formData.salaryMax),
            currency: formData.salaryCurrency,
            period: "yearly" as const,
          }
        : undefined,
    };

    const result = await Effect.runPromise(
      createJob(input).pipe(
        Effect.tap(() => Effect.sync(() => {
          // Refresh the jobs list to refetch
          registry.refresh(jobsAtom);
        })),
        Effect.either
      )
    );

    setIsSubmitting(false);

    if (result._tag === "Right") {
      toast.success("Job created successfully");
      onOpenChange(false);
      router.push(`/jobs/${result.right.id}`);
    } else {
      toast.error(`Failed to create job: ${result.left.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      requirements: "",
      employmentType: "full_time",
      locationType: "remote",
      city: "",
      country: "",
      salaryMin: "",
      salaryMax: "",
      salaryCurrency: "USD",
    });
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new job posting.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              placeholder="e.g. Senior Software Engineer"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the role, responsibilities, and what makes it exciting..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea
              id="requirements"
              placeholder="List the required skills, experience, and qualifications..."
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              rows={3}
            />
          </div>

          {/* Employment Type & Location Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Employment Type *</Label>
              <Select
                value={formData.employmentType}
                onValueChange={(value: EmploymentType) =>
                  setFormData({ ...formData, employmentType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full Time</SelectItem>
                  <SelectItem value="part_time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Location Type *</Label>
              <Select
                value={formData.locationType}
                onValueChange={(value: LocationType) =>
                  setFormData({ ...formData, locationType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="onsite">On-site</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location Details (only show if not remote) */}
          {formData.locationType !== "remote" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="e.g. San Francisco"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="e.g. United States"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Salary Range */}
          <div className="space-y-2">
            <Label>Salary Range (Optional)</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={formData.salaryMin}
                  onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Max"
                  value={formData.salaryMax}
                  onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Select
                  value={formData.salaryCurrency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, salaryCurrency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
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
              {isSubmitting ? "Creating..." : "Create Job"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
