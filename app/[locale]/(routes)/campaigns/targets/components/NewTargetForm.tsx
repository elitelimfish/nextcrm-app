"use client";
import { SallyTarget } from "@supportsally/react";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createTarget } from "@/actions/crm/targets/create-target";

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
import { Switch } from "@/components/ui/switch";

type NewTargetFormProps = {
  onFinish: () => void;
};

export function NewTargetForm({ onFinish }: NewTargetFormProps) {
  const formSchema = z.object({
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().optional(),
    mobile_phone: z.string().optional(),
    office_phone: z.string().optional(),
    company: z.string().optional(),
    company_website: z.string().optional(),
    personal_website: z.string().optional(),
    position: z.string().optional(),
    social_x: z.string().optional(),
    social_linkedin: z.string().optional(),
    social_instagram: z.string().optional(),
    social_facebook: z.string().optional(),
    personal_email: z.string().optional(),
    company_email:  z.string().optional(),
    company_phone:  z.string().optional(),
    city:           z.string().optional(),
    country:        z.string().optional(),
    industry:       z.string().optional(),
    employees:      z.string().optional(),
    description:    z.string().optional(),
    status: z.boolean(),
  });

  type NewTargetFormValues = z.infer<typeof formSchema>;

  const form = useForm<NewTargetFormValues>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      status: true,
      personal_email: "",
      company_email: "",
      company_phone: "",
      city: "",
      country: "",
      industry: "",
      employees: "",
      description: "",
    },
  });

  const onSubmit = async (data: NewTargetFormValues) => {
    if (!data.last_name && !data.company) {
      form.setError("root.serverError", {
        message: "Please provide either last name or company.",
      });
      return;
    }
    const result = await createTarget(data);
    if (result?.error) {
      form.setError("root.serverError", { message: result.error });
    } else {
      toast.success("Target created successfully");
      form.reset({ status: true });
      onFinish();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-2">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First name</FormLabel>
                <SallyTarget id="first-name-4" label="first name" completeWhen="firstName-4Filled">
                  <FormControl>
                    <Input disabled={form.formState.isSubmitting} placeholder="John" {...field} />
                  </FormControl>
                </SallyTarget>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last name</FormLabel>
                <SallyTarget id="last-name-4" label="last name" completeWhen="lastName-4Filled">
                  <FormControl>
                    <Input disabled={form.formState.isSubmitting} placeholder="Doe" {...field} />
                  </FormControl>
                </SallyTarget>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <SallyTarget id="email-6" label="email" completeWhen="email-6Filled">
                  <FormControl>
                    <Input disabled={form.formState.isSubmitting} placeholder="john@example.com" {...field} />
                  </FormControl>
                </SallyTarget>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mobile_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile phone</FormLabel>
                <SallyTarget id="mobile-phone-3" label="mobile phone" completeWhen="mobilePhone-3Filled">
                  <FormControl>
                    <Input disabled={form.formState.isSubmitting} placeholder="+1 234 567 890" {...field} />
                  </FormControl>
                </SallyTarget>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="office_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Office phone</FormLabel>
                <SallyTarget id="office-phone-3" label="office phone" completeWhen="officePhone-3Filled">
                  <FormControl>
                    <Input disabled={form.formState.isSubmitting} placeholder="+1 234 567 891" {...field} />
                  </FormControl>
                </SallyTarget>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position</FormLabel>
                <SallyTarget id="position" label="position" completeWhen="positionFilled">
                  <FormControl>
                    <Input disabled={form.formState.isSubmitting} placeholder="CEO" {...field} />
                  </FormControl>
                </SallyTarget>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <SallyTarget id="company2" label="company" completeWhen="company2Filled">
                  <FormControl>
                    <Input disabled={form.formState.isSubmitting} placeholder="Acme Corp" {...field} />
                  </FormControl>
                </SallyTarget>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="company_website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company website</FormLabel>
                <SallyTarget id="company-website" label="company website" completeWhen="companyWebsiteFilled">
                  <FormControl>
                    <Input disabled={form.formState.isSubmitting} placeholder="https://acme.com" {...field} />
                  </FormControl>
                </SallyTarget>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="personal_website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Personal website</FormLabel>
              <SallyTarget id="personal-website" label="personal website" completeWhen="personalWebsiteFilled">
                <FormControl>
                  <Input disabled={form.formState.isSubmitting} placeholder="https://johndoe.com" {...field} />
                </FormControl>
              </SallyTarget>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="social_linkedin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LinkedIn</FormLabel>
                <SallyTarget id="social-linkedin" label="social linkedin" completeWhen="socialLinkedinFilled">
                  <FormControl>
                    <Input disabled={form.formState.isSubmitting} placeholder="https://linkedin.com/in/john" {...field} />
                  </FormControl>
                </SallyTarget>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="social_x"
            render={({ field }) => (
              <FormItem>
                <FormLabel>X (Twitter)</FormLabel>
                <SallyTarget id="social-x" label="social x" completeWhen="socialXFilled">
                  <FormControl>
                    <Input disabled={form.formState.isSubmitting} placeholder="https://x.com/john" {...field} />
                  </FormControl>
                </SallyTarget>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="social_instagram"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instagram</FormLabel>
                <SallyTarget id="social-instagram" label="social instagram" completeWhen="socialInstagramFilled">
                  <FormControl>
                    <Input disabled={form.formState.isSubmitting} placeholder="https://instagram.com/john" {...field} />
                  </FormControl>
                </SallyTarget>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="social_facebook"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Facebook</FormLabel>
                <SallyTarget id="social-facebook" label="social facebook" completeWhen="socialFacebookFilled">
                  <FormControl>
                    <Input disabled={form.formState.isSubmitting} placeholder="https://facebook.com/john" {...field} />
                  </FormControl>
                </SallyTarget>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="personal_email" render={({ field }) => (
            <FormItem><FormLabel>Personal Email</FormLabel>
              <SallyTarget id="personal-email2" label="personal email" completeWhen="personalEmail2Filled">
                <FormControl><Input placeholder="john@personal.com" {...field} value={field.value ?? ''} /></FormControl>
              </SallyTarget>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="company_email" render={({ field }) => (
            <FormItem><FormLabel>Company Email</FormLabel>
              <SallyTarget id="company-email" label="company email" completeWhen="companyEmailFilled">
                <FormControl><Input placeholder="info@company.com" {...field} value={field.value ?? ''} /></FormControl>
              </SallyTarget>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="company_phone" render={({ field }) => (
          <FormItem><FormLabel>Company Phone</FormLabel>
            <SallyTarget id="company-phone" label="company phone" completeWhen="companyPhoneFilled">
              <FormControl><Input placeholder="+1 800 000 0000" {...field} value={field.value ?? ''} /></FormControl>
            </SallyTarget>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="city" render={({ field }) => (
            <FormItem><FormLabel>City</FormLabel>
              <SallyTarget id="city" label="city" completeWhen="cityFilled">
                <FormControl><Input placeholder="Prague" {...field} value={field.value ?? ''} /></FormControl>
              </SallyTarget>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="country" render={({ field }) => (
            <FormItem><FormLabel>Country</FormLabel>
              <SallyTarget id="country" label="country" completeWhen="countryFilled">
                <FormControl><Input placeholder="Czech Republic" {...field} value={field.value ?? ''} /></FormControl>
              </SallyTarget>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="industry" render={({ field }) => (
            <FormItem><FormLabel>Industry</FormLabel>
              <SallyTarget id="industry" label="industry" completeWhen="industryFilled">
                <FormControl><Input placeholder="SaaS" {...field} value={field.value ?? ''} /></FormControl>
              </SallyTarget>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="employees" render={({ field }) => (
            <FormItem><FormLabel>Employees</FormLabel>
              <SallyTarget id="employees" label="employees" completeWhen="employeesFilled">
                <FormControl><Input placeholder="50-200" {...field} value={field.value ?? ''} /></FormControl>
              </SallyTarget>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Description</FormLabel>
            <SallyTarget id="description2" label="description" completeWhen="description2Filled">
              <FormControl><Input placeholder="Short company description" {...field} value={field.value ?? ''} /></FormControl>
            </SallyTarget>
            <FormMessage />
          </FormItem>
        )} />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Is target active?</FormLabel>
              </div>
              <SallyTarget id="status" label="status" completeWhen="statusFilled">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </SallyTarget>
            </FormItem>
          )}
        />
        {form.formState.errors.root?.serverError && (
          <p className="text-sm text-destructive" aria-live="polite">
            {form.formState.errors.root.serverError.message}
          </p>
        )}
        <Button disabled={form.formState.isSubmitting} type="submit" className="w-full">
          {form.formState.isSubmitting ? (
            <span className="flex items-center animate-pulse">Saving data ...</span>
          ) : (
            "Create target"
          )}
        </Button>
      </form>
    </Form>
  );
}
