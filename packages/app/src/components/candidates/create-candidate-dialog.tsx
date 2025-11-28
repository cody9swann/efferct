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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createCandidate, candidatesAtom } from "@/atoms/api";
import type { CreateCandidateInput, CandidateSource } from "@ats/shared";

interface CreateCandidateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCandidateDialog({ open, onOpenChange }: CreateCandidateDialogProps) {
  const router = useRouter();
  const registry = useContext(RegistryContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    linkedinUrl: "",
    source: "applied" as CandidateSource,
    sourceDetails: "",
    tags: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const input: CreateCandidateInput = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone || undefined,
      linkedinUrl: formData.linkedinUrl || undefined,
      source: formData.source,
      sourceDetails: formData.sourceDetails || undefined,
      tags: formData.tags
        ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : undefined,
    };

    const result = await Effect.runPromise(
      createCandidate(input).pipe(
        Effect.tap(() => Effect.sync(() => {
          registry.refresh(candidatesAtom);
        })),
        Effect.either
      )
    );

    setIsSubmitting(false);

    if (result._tag === "Right") {
      toast.success("Candidate added successfully");
      onOpenChange(false);
      router.push(`/candidates/${result.right.id}`);
    } else {
      toast.error(`Failed to add candidate: ${result.left.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      linkedinUrl: "",
      source: "applied",
      sourceDetails: "",
      tags: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Candidate</DialogTitle>
          <DialogDescription>
            Enter the candidate's information to add them to your talent pool.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          {/* LinkedIn */}
          <div className="space-y-2">
            <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
            <Input
              id="linkedinUrl"
              type="url"
              placeholder="https://linkedin.com/in/johndoe"
              value={formData.linkedinUrl}
              onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
            />
          </div>

          {/* Source */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Source *</Label>
              <Select
                value={formData.source}
                onValueChange={(value: CandidateSource) =>
                  setFormData({ ...formData, source: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="sourced">Sourced</SelectItem>
                  <SelectItem value="referred">Referred</SelectItem>
                  <SelectItem value="agency">Agency</SelectItem>
                  <SelectItem value="internal">Internal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sourceDetails">Source Details</Label>
              <Input
                id="sourceDetails"
                placeholder="e.g. LinkedIn, Referral name"
                value={formData.sourceDetails}
                onChange={(e) => setFormData({ ...formData, sourceDetails: e.target.value })}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="React, TypeScript, Senior (comma-separated)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Separate tags with commas
            </p>
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
              {isSubmitting ? "Adding..." : "Add Candidate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
