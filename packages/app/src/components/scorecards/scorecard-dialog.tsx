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
import { submitScorecard, scorecardsByInterviewAtom } from "@/atoms/api";
import type { InterviewId } from "@ats/shared";

type Recommendation = "strong_yes" | "yes" | "neutral" | "no" | "strong_no";

interface ScorecardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interviewId: string;
}

const CRITERIA = [
  { name: "Technical Skills", key: "technical" },
  { name: "Problem Solving", key: "problem_solving" },
  { name: "Communication", key: "communication" },
  { name: "Culture Fit", key: "culture" },
];

export function ScorecardDialog({
  open,
  onOpenChange,
  interviewId,
}: ScorecardDialogProps) {
  const registry = useContext(RegistryContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    overallRating: 3,
    recommendation: "neutral" as Recommendation,
    criteria: CRITERIA.reduce((acc, c) => ({ ...acc, [c.key]: { score: 3, notes: "" } }), {} as Record<string, { score: number; notes: string }>),
    strengths: "",
    concerns: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await Effect.runPromise(
      submitScorecard({
        interviewId: interviewId as InterviewId,
        overallRating: formData.overallRating,
        recommendation: formData.recommendation,
        criteria: CRITERIA.map((c) => ({
          name: c.name,
          score: formData.criteria[c.key].score,
          notes: formData.criteria[c.key].notes || undefined,
        })),
        strengths: formData.strengths || "",
        concerns: formData.concerns || "",
        additionalNotes: formData.notes || undefined,
      }).pipe(
        Effect.tap(() => Effect.sync(() => {
          registry.refresh(scorecardsByInterviewAtom(interviewId));
        })),
        Effect.either
      )
    );

    setIsSubmitting(false);

    if (result._tag === "Right") {
      toast.success("Scorecard submitted successfully");
      onOpenChange(false);
      resetForm();
    } else {
      toast.error(`Failed to submit scorecard: ${result.left.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      overallRating: 3,
      recommendation: "neutral",
      criteria: CRITERIA.reduce((acc, c) => ({ ...acc, [c.key]: { score: 3, notes: "" } }), {} as Record<string, { score: number; notes: string }>),
      strengths: "",
      concerns: "",
      notes: "",
    });
  };

  const updateCriteriaScore = (key: string, score: number) => {
    setFormData({
      ...formData,
      criteria: {
        ...formData.criteria,
        [key]: { ...formData.criteria[key], score },
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit Scorecard</DialogTitle>
          <DialogDescription>
            Rate the candidate based on this interview.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <div className="space-y-2">
            <Label>Overall Rating *</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setFormData({ ...formData, overallRating: rating })}
                  className={`text-2xl transition-colors ${
                    rating <= formData.overallRating
                      ? "text-yellow-500"
                      : "text-muted-foreground hover:text-yellow-500/50"
                  }`}
                >
                  ★
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {formData.overallRating}/5
              </span>
            </div>
          </div>

          {/* Recommendation */}
          <div className="space-y-2">
            <Label>Recommendation *</Label>
            <Select
              value={formData.recommendation}
              onValueChange={(value: Recommendation) =>
                setFormData({ ...formData, recommendation: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strong_yes">Strong Yes - Definitely hire</SelectItem>
                <SelectItem value="yes">Yes - Would hire</SelectItem>
                <SelectItem value="neutral">Neutral - Need more info</SelectItem>
                <SelectItem value="no">No - Would not hire</SelectItem>
                <SelectItem value="strong_no">Strong No - Definitely do not hire</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Criteria Ratings */}
          <div className="space-y-4">
            <Label>Criteria Ratings</Label>
            {CRITERIA.map((criterion) => (
              <div key={criterion.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{criterion.name}</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => updateCriteriaScore(criterion.key, score)}
                        className={`h-6 w-6 rounded-full text-xs transition-colors ${
                          score <= formData.criteria[criterion.key].score
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Strengths */}
          <div className="space-y-2">
            <Label htmlFor="strengths">Strengths</Label>
            <Textarea
              id="strengths"
              placeholder="List key strengths (one per line)..."
              value={formData.strengths}
              onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
              rows={3}
            />
          </div>

          {/* Concerns */}
          <div className="space-y-2">
            <Label htmlFor="concerns">Concerns</Label>
            <Textarea
              id="concerns"
              placeholder="List any concerns (one per line)..."
              value={formData.concerns}
              onChange={(e) => setFormData({ ...formData, concerns: e.target.value })}
              rows={3}
            />
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any other observations or comments..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
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
              {isSubmitting ? "Submitting..." : "Submit Scorecard"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
