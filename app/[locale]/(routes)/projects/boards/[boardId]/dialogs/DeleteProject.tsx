"use client";
import { SallyTarget } from "@supportsally/react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import React, { useEffect, useState } from "react";
import { deleteProject } from "@/actions/projects/delete-project";

type Props = {
  boardId: string;
  boardName: string;
};

const DeleteProjectDialog = ({ boardId, boardName }: Props) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  //Actions

  const onDelete = async () => {
    setIsLoading(true);
    try {
      const result = await deleteProject(boardId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Project: ${boardName} deleted successfully`);
      }
    } catch (error) {
      toast.error("Something went wrong while deleting project. Please try again.");
    } finally {
      setOpen(false);
      setIsLoading(false);
      router.refresh();
      router.push("/projects");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <SallyTarget id="delete-project" label="Delete project">
          <Button className="px-2" variant={"destructive"} asChild>
            <div className="px-3 gap-2">
              Delete project
              <TrashIcon size={15} />
            </div>
          </Button>
        </SallyTarget>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete project</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this project? You will not be able
            to recover it. All tasks will be deleted as well.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <SallyTarget id="cancel14" label="Cancel">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </SallyTarget>
          <SallyTarget id="delete3" label={isLoading ? "Deleting..." : "Delete"}>
            <Button variant="destructive" onClick={onDelete}>
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </SallyTarget>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteProjectDialog;
