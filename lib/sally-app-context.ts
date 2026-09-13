type InvoiceDraftContext = {
  accountSelected: boolean;
  lineItemCount: number;
};

type InvoiceDetailContext = {
  onInvoiceDetail: boolean;
  invoiceIssued: boolean;
};

let draft: InvoiceDraftContext = {
  accountSelected: false,
  lineItemCount: 0,
};

let detail: InvoiceDetailContext = {
  onInvoiceDetail: false,
  invoiceIssued: false,
};

const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

export function subscribeSallyAppContext(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getInvoiceDraftContext(): InvoiceDraftContext {
  return draft;
}

export function setInvoiceDraftContext(patch: Partial<InvoiceDraftContext>): void {
  draft = { ...draft, ...patch };
  emit();
}

export function getInvoiceDetailContext(): InvoiceDetailContext {
  return detail;
}

export function setInvoiceDetailContext(
  patch: Partial<InvoiceDetailContext>,
): void {
  detail = { ...detail, ...patch };
  emit();
}

export function snapshotSallyContextVersion(): string {
  return JSON.stringify(draft) + JSON.stringify(detail);
}
