"use client";
import { SallyTarget } from "@supportsally/react";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { UserSearchCombobox } from "@/components/ui/user-search-combobox";
import { AccountSearchCombobox } from "@/components/ui/account-search-combobox";
import { updateLead } from "@/actions/crm/leads/update-lead";

//TODO: fix all the types
type ConfigItem = { id: string; name: string };

type NewTaskFormProps = {
  initialData: any;
  setOpen: (value: boolean) => void;
  leadSources: ConfigItem[];
  leadStatuses: ConfigItem[];
  leadTypes: ConfigItem[];
};

export function UpdateLeadForm({ initialData, setOpen, leadSources, leadStatuses, leadTypes }: NewTaskFormProps) {
  const t = useTranslations("CrmLeadForm");
  const c = useTranslations("Common");

  const formSchema = z.object({
    id: z.uuid(),
    firstName: z.string().optional().nullable(),
    lastName: z.string().min(1, t("lastNameRequired")).max(30),
    company: z.string().nullable().optional(),
    jobTitle: z.string().nullable().optional(),
    email: z.string().email(t("emailInvalid")).nullable().optional().or(z.literal("")),
    phone: z.string().min(0).max(15).nullable().optional(),
    description: z.string().nullable().optional(),
    lead_source_id: z.string().nullable().optional(),
    lead_status_id: z.string().nullable().optional(),
    lead_type_id: z.string().nullable().optional(),
    refered_by: z.string().optional().nullable(),
    //TODO: add campaing schema from db as data source
    campaign: z.string().optional().nullable(),
    assigned_to: z.string().optional().nullable(),
    accountsIDs: z.string().optional().nullable(),
  });

  type NewLeadFormValues = z.infer<typeof formSchema>;

  //TODO: fix this any
  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      ...initialData,
      lead_source_id: initialData.lead_source_id ?? "",
      lead_status_id: initialData.lead_status_id ?? "",
      lead_type_id: initialData.lead_type_id ?? "",
    },
  });

  const onSubmit = async (data: NewLeadFormValues) => {
    const result = await updateLead({
      ...data,
      lead_source_id: data.lead_source_id ?? undefined,
      lead_status_id: data.lead_status_id ?? undefined,
      lead_type_id: data.lead_type_id ?? undefined,
      assigned_to: data.assigned_to ?? undefined,
      accountIDs: data.accountsIDs ?? undefined,
    });
    if (result?.error) {
      form.setError("root.serverError", { message: result.error });
    } else {
      toast.success(t("updateSuccess"));
      setOpen(false);
    }
  };

  if (!initialData)
    return <div>{c("somethingWentWrong")}</div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="h-full px-4 md:px-10">
        <div className="w-full text-sm">
          <div className="pb-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("firstName")}</FormLabel>
                    <SallyTarget id="firstname" label="firstName" completeWhen="firstnameFilled">
                      <FormControl>
                        <Input
                          disabled={form.formState.isSubmitting}
                          placeholder="Johny"
                          {...field}
                        />
                      </FormControl>
                    </SallyTarget>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("lastName")}</FormLabel>
                    <SallyTarget id="lastname" label="lastName" completeWhen="lastnameFilled">
                      <FormControl>
                        <Input
                          disabled={form.formState.isSubmitting}
                          placeholder="Walker"
                          {...field}
                        />
                      </FormControl>
                    </SallyTarget>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("company")}</FormLabel>
                    <SallyTarget id="company3" label="company" completeWhen="company3Filled">
                      <FormControl>
                        <Input
                          disabled={form.formState.isSubmitting}
                          placeholder="NextCRM Inc."
                          {...field}
                        />
                      </FormControl>
                    </SallyTarget>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("jobTitle")}</FormLabel>
                    <SallyTarget id="jobtitle2" label="jobTitle" completeWhen="jobtitle2Filled">
                      <FormControl>
                        <Input disabled={form.formState.isSubmitting} placeholder="CTO" {...field} />
                      </FormControl>
                    </SallyTarget>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("email")}</FormLabel>
                    <SallyTarget id="email2" label="email" completeWhen="email2Filled">
                      <FormControl>
                        <Input
                          disabled={form.formState.isSubmitting}
                          placeholder="johny@domain.com"
                          {...field}
                        />
                      </FormControl>
                    </SallyTarget>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("phone")}</FormLabel>
                    <SallyTarget id="phone-3" label="phone" completeWhen="phone-3Filled">
                      <FormControl>
                        <Input
                          disabled={form.formState.isSubmitting}
                          placeholder="+11 123 456 789"
                          {...field}
                        />
                      </FormControl>
                    </SallyTarget>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{c("description")}</FormLabel>
                  <SallyTarget id="description-10" label="description" completeWhen="description-10Filled">
                    <FormControl>
                      <Textarea
                        disabled={form.formState.isSubmitting}
                        placeholder="New NextCRM functionality"
                        {...field}
                      />
                    </FormControl>
                  </SallyTarget>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="lead_source_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("leadSource")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <SallyTarget id="lead-source-id2" label="lead source id" completeWhen="leadSourceId2Filled">
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select source…" /></SelectTrigger>
                        </FormControl>
                      </SallyTarget>
                      <SelectContent>
                        {leadSources.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="refered_by"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("referredBy")}</FormLabel>
                    <SallyTarget id="refered-by2" label="refered by" completeWhen="referedBy2Filled">
                      <FormControl>
                        <Input
                          disabled={form.formState.isSubmitting}
                          placeholder="Johny Walker"
                          {...field}
                        />
                      </FormControl>
                    </SallyTarget>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="campaign"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("campaign")}</FormLabel>
                    <SallyTarget id="campaign2" label="campaign" completeWhen="campaign2Filled">
                      <FormControl>
                        <Input
                          disabled={form.formState.isSubmitting}
                          placeholder="Social networks"
                          {...field}
                        />
                      </FormControl>
                    </SallyTarget>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lead_type_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead Type</FormLabel>
                    <SallyTarget id="lead-type2" label="Lead Type" completeWhen="leadType2Filled">
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select type…" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {leadTypes.map((lt) => (
                            <SelectItem key={lt.id} value={lt.id}>{lt.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </SallyTarget>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assigned_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{c("assignedTo")}</FormLabel>
                    <FormControl>
                      <UserSearchCombobox
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        placeholder={c("selectUser")}
                        disabled={form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lead_status_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead Status</FormLabel>
                    <SallyTarget id="lead-status2" label="Lead Status" completeWhen="leadStatus2Filled">
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select status…" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {leadStatuses.map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </SallyTarget>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="accountsIDs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("assignAccount")}</FormLabel>
                  <FormControl>
                    <AccountSearchCombobox
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      placeholder={t("assignAccountPlaceholder")}
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="grid gap-2 py-5">
          {form.formState.errors.root?.serverError && (
            <p className="text-sm text-destructive" aria-live="polite">
              {form.formState.errors.root.serverError.message}
            </p>
          )}
          <Button disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting ? (
              <span className="flex items-center animate-pulse">
                {c("savingData")}
              </span>
            ) : (
              t("updateButton")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
