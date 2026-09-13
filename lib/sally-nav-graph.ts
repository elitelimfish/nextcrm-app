import type { NavGraph } from "@supportsally/core";

/** Hand nav graph for invoice Pareto (AB locate; not Studio graph UI). */
export const nextcrmInvoiceNavGraph: NavGraph = {
  routes: [
    {
      id: "/invoices",
      title: "Invoices",
      aliases: ["invoices", "bills", "invoice list"],
      landingTargetId: "new-invoice",
      say: "Your invoices are listed here.",
      targets: ["nav-invoices", "new-invoice"],
    },
    {
      id: "/invoices/new",
      title: "New invoice",
      aliases: ["create invoice", "new invoice form"],
      landingTargetId: "invoice-account",
      say: "Fill in the new invoice form.",
      targets: [
        "invoice-account",
        "invoice-line-description",
        "invoice-save-draft",
      ],
    },
  ],
  edges: [
    {
      targetId: "nav-invoices",
      toRoute: "/invoices",
      say: "Open Invoices in the sidebar.",
    },
    {
      targetId: "new-invoice",
      toRoute: "/invoices/new",
      say: "Use New invoice to open the form.",
    },
  ],
};
