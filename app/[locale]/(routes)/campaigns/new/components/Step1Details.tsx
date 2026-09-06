"use client";
import { SallyTarget } from "@supportsally/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Props = {
  initialData: {
    name?: string;
    description?: string;
    from_name?: string;
    reply_to?: string;
  };
  onNext: (data: {
    name: string;
    description?: string;
    from_name?: string;
    reply_to?: string;
  }) => void;
};

export function Step1Details({ initialData, onNext }: Props) {
  const [name, setName] = useState(initialData.name ?? "");
  const [description, setDescription] = useState(
    initialData.description ?? ""
  );
  const [fromName, setFromName] = useState(initialData.from_name ?? "");
  const [replyTo, setReplyTo] = useState(initialData.reply_to ?? "");
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!name.trim()) {
      setError("Campaign name is required");
      return;
    }
    onNext({
      name: name.trim(),
      description: description || undefined,
      from_name: fromName || undefined,
      reply_to: replyTo || undefined,
    });
  };

  return (
    <div className="flex flex-col gap-4 max-w-lg">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Campaign Name *</Label>
        <SallyTarget id="campaign-name" label="Campaign Name *" completeWhen="campaignNameFilled">
  <Input
          id="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          placeholder="e.g. Q2 Product Outreach"
        />
</SallyTarget>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description</Label>
        <SallyTarget id="description" label="Description" completeWhen="descriptionFilled">
  <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description..."
        />
</SallyTarget>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fromName">From Name</Label>
        <SallyTarget id="from-name" label="From Name" completeWhen="fromNameFilled">
  <Input
          id="fromName"
          value={fromName}
          onChange={(e) => setFromName(e.target.value)}
          placeholder="e.g. Jane from Acme"
        />
</SallyTarget>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="replyTo">Reply-to Email</Label>
        <SallyTarget id="reply-to-email" label="Reply-to Email" completeWhen="replyToEmailFilled">
  <Input
          id="replyTo"
          value={replyTo}
          onChange={(e) => setReplyTo(e.target.value)}
          placeholder="reply@yourcompany.com"
        />
</SallyTarget>
      </div>
      <div className="flex justify-end">
        <SallyTarget id="next" label="Next →">
  <Button onClick={handleNext}>Next →</Button>
</SallyTarget>
      </div>
    </div>
  );
}
