"use client";
import { SallyTarget } from "@supportsally/react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTargetList } from "@/actions/crm/target-lists/create-target-list";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const CreateTargetListModal = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }

    setIsLoading(true);
    const result = await createTargetList({ name, description });
    setIsLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Target list created successfully");
    setOpen(false);
    setName("");
    setDescription("");
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <SallyTarget id="new-list" label="+ New List">
        <DialogTrigger asChild>
          <Button size="sm">+ New List</Button>
        </DialogTrigger>
      </SallyTarget>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Target List</DialogTitle>
          <DialogDescription>
            Create a new list to group your targets for campaigns or outreach.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <SallyTarget id="name8" label="Name *" completeWhen="name8Filled">
              <Input
                id="name"
                placeholder="Q1 Outreach List"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </SallyTarget>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <SallyTarget id="description6" label="Description" completeWhen="description6Filled">
              <Textarea
                id="description"
                placeholder="A list of targets for Q1 outreach campaign"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
              />
            </SallyTarget>
          </div>
        </div>
        <DialogFooter>
          <SallyTarget id="cancel19" label="Cancel">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
          </SallyTarget>
          <SallyTarget id="create7" label={isLoading ? "Creating..." : "Create"}>
            <Button onClick={handleCreate} disabled={isLoading || !name.trim()}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </SallyTarget>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTargetListModal;
