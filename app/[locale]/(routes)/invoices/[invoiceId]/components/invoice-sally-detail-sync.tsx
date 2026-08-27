"use client";

import { useEffect } from "react";
import { setInvoiceDetailContext } from "@/lib/sally-app-context";

export function InvoiceSallyDetailSync({ status }: { status: string }) {
  useEffect(() => {
    setInvoiceDetailContext({
      onInvoiceDetail: true,
      invoiceIssued: status !== "DRAFT",
    });
    return () => {
      setInvoiceDetailContext({
        onInvoiceDetail: false,
        invoiceIssued: false,
      });
    };
  }, [status]);
  return null;
}
