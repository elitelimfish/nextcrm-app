"use client";
import { SallyTarget } from "@supportsally/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createActivity } from "@/actions/crm/activities/create-activity";
import { updateActivity } from "@/actions/crm/activities/update-activity";
import type { ActivityWithLinks } from "@/actions/crm/activities/get-activities-by-entity";

type ActivityType = "call" | "meeting" | "note" | "email";
type ActivityStatus = "scheduled" | "completed" | "cancelled";

const DEFAULT_STATUS: Record<ActivityType, ActivityStatus> = {
  call: "scheduled",
  meeting: "scheduled",
  note: "completed",
  email: "completed",
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: string;
  entityId: string;
  activity?: ActivityWithLinks; // if provided: edit mode
  onSaved: (activity: ActivityWithLinks) => void;
}

export function ActivityForm({ open, onOpenChange, entityType, entityId, activity, onSaved }: Props) {
  const isEdit = !!activity;

  const [type, setType] = useState<ActivityType>(activity?.type ?? "call");
  const [title, setTitle] = useState(activity?.title ?? "");
  const [description, setDescription] = useState(activity?.description ?? "");
  const [date, setDate] = useState(
    activity ? new Date(activity.date).toISOString().slice(0, 16) : ""
  );
  const [status, setStatus] = useState<ActivityStatus>(activity?.status ?? "scheduled");
  const [duration, setDuration] = useState(activity?.duration?.toString() ?? "");
  const [outcome, setOutcome] = useState(activity?.outcome ?? "");
  const [emailSubject, setEmailSubject] = useState(
    (activity?.metadata as Record<string, string> | null)?.subject ?? ""
  );
  const [saving, setSaving] = useState(false);

  // Auto-set status when type changes (only in create mode)
  useEffect(() => {
    if (!isEdit) {
      setStatus(DEFAULT_STATUS[type]);
    }
  }, [type, isEdit]);

  const showDuration = type === "call" || type === "meeting";
  const showOutcome = type === "call" || type === "meeting";
  const showEmailSubject = type === "email";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!date) {
      toast.error("Date is required");
      return;
    }

    setSaving(true);

    const metadata: Record<string, unknown> = {};
    if (showEmailSubject && emailSubject) metadata.subject = emailSubject;

    const payload = {
      type,
      title: title.trim(),
      description: description.trim() || undefined,
      date: new Date(date),
      duration: showDuration && duration ? parseInt(duration, 10) : undefined,
      outcome: showOutcome && outcome.trim() ? outcome.trim() : undefined,
      status,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      links: [{ entityType, entityId }],
    };

    let result: { data?: ActivityWithLinks; error?: string };

    if (isEdit) {
      result = await updateActivity({ id: activity.id, ...payload });
    } else {
      result = await createActivity(payload);
    }

    setSaving(false);

    if (result.error) {
      toast.error(result.error);
    } else if (result.data) {
      toast.success(isEdit ? "Activity updated" : "Activity logged");
      onSaved(result.data as ActivityWithLinks);
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Activity" : "Log Activity"}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1">
            <Label htmlFor="activity-type">Type</Label>
            <SallyTarget id="type2" label="Type" completeWhen="type2Filled">
              <Select value={type} onValueChange={(v) => setType(v as ActivityType)}>
                <SelectTrigger id="activity-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </SallyTarget>
          </div>

          <div className="space-y-1">
            <Label htmlFor="activity-title">Title *</Label>
            <SallyTarget id="title7" label="Title *" completeWhen="title7Filled">
              <Input
                id="activity-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief description"
                required
              />
            </SallyTarget>
          </div>

          <div className="space-y-1">
            <Label htmlFor="activity-date">Date & Time *</Label>
            <SallyTarget id="date-time" label="Date &amp; Time *" completeWhen="dateTimeFilled">
              <Input
                id="activity-date"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </SallyTarget>
          </div>

          <div className="space-y-1">
            <Label htmlFor="activity-status">Status</Label>
            <SallyTarget id="status3" label="Status" completeWhen="status3Filled">
              <Select value={status} onValueChange={(v) => setStatus(v as ActivityStatus)}>
                <SelectTrigger id="activity-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </SallyTarget>
          </div>

          {showDuration && (
            <div className="space-y-1">
              <Label htmlFor="activity-duration">Duration (minutes)</Label>
              <SallyTarget id="duration-minutes" label="Duration (minutes)" completeWhen="durationMinutesFilled">
                <Input
                  id="activity-duration"
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 30"
                />
              </SallyTarget>
            </div>
          )}

          {showOutcome && (
            <div className="space-y-1">
              <Label htmlFor="activity-outcome">Outcome</Label>
              <SallyTarget id="outcome" label="Outcome" completeWhen="outcomeFilled">
                <Input
                  id="activity-outcome"
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  placeholder="Result of the call / meeting"
                />
              </SallyTarget>
            </div>
          )}

          {showEmailSubject && (
            <div className="space-y-1">
              <Label htmlFor="activity-email-subject">Email Subject</Label>
              <SallyTarget id="email-subject" label="Email Subject" completeWhen="emailSubjectFilled">
                <Input
                  id="activity-email-subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Subject line"
                />
              </SallyTarget>
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="activity-description">Notes</Label>
            <SallyTarget id="notes" label="Notes" completeWhen="notesFilled">
              <Textarea
                id="activity-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Additional notes..."
                rows={4}
              />
            </SallyTarget>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <SallyTarget id="cancel6" label="Cancel">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </SallyTarget>
            <SallyTarget id="log-activity" label={isEdit ? "Save changes" : "Log activity"}>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : isEdit ? "Save changes" : "Log activity"}
              </Button>
            </SallyTarget>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
