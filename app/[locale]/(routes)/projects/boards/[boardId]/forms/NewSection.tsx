"use client";
import { SallyTarget } from "@supportsally/react";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DialogClose } from "@radix-ui/react-dialog";
import { createSection } from "@/actions/projects/create-section";

type NewSectionFormProps = {
  boardId: string;
  onClose: () => void;
};

const NewSectionForm = ({ boardId, onClose }: NewSectionFormProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();

  const formSchema = z.object({
    title: z.string().min(3).max(255),
  });

  type NewAccountFormValues = z.infer<typeof formSchema>;

  const form = useForm<NewAccountFormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  //Actions

  const onSubmit = async (data: NewAccountFormValues) => {
    setIsLoading(true);
    try {
      const result = await createSection({ boardId, title: data.title });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`New section: ${data.title}, created successfully`);
      }
    } catch (error: any) {
      toast.error(error?.message);
    } finally {
      form.reset({
        title: "",
      });
      setIsLoading(false);
      router.refresh();
      onClose();
    }
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="h-full w-full space-y-3"
      >
        <div className="flex flex-col space-y-3">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <SallyTarget id="title4" label="title" completeWhen="title4Filled">
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Enter section name"
                      {...field}
                    />
                  </FormControl>
                </SallyTarget>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex w-full justify-end space-x-2 pt-2">
          <SallyTarget id="cancel5" label="Cancel">
            <DialogClose asChild>
              <Button variant={"destructive"}>Cancel</Button>
            </DialogClose>
          </SallyTarget>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <div className="flex space-x-5">
                <Icons.spinner className="animate-spin" />
              </div>
            ) : (
              <span>Create</span>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default NewSectionForm;
