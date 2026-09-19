import type { Workflow } from "@supportsally/workflows";

/** Published Studio id for the New Lead form journey. */
export const CREATE_LEAD_WORKFLOW_ID =
  "crm_leads_components_NewLeadForm.tsx_draft";

/**
 * Dogfood overlay: Studio publishes allowExecute:false and no Save step yet.
 * Review-then-run needs execute + registered save-lead on the live form.
 */
export function patchSallyWorkflows(workflows: Workflow[]): Workflow[] {
  return workflows.map((workflow) => {
    if (workflow.id !== CREATE_LEAD_WORKFLOW_ID) return workflow;
    const hasSave = workflow.steps.some((step) => step.action === "save-lead");
    return {
      ...workflow,
      allowExecute: true,
      steps: hasSave
        ? workflow.steps
        : [
            ...workflow.steps,
            {
              id: "save_lead",
              target: "save-lead",
              action: "save-lead",
              say: "Save the lead to your workspace.",
              risk: "high",
              requiresConfirmation: true,
              completion: { route: "/crm/leads" },
            },
          ],
    };
  });
}
