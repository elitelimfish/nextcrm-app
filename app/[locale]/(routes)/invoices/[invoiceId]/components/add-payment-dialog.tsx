"use client";
import { SallyTarget } from "@supportsally/react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addPayment } from "@/actions/invoices/add-payment";

const PAYMENT_METHODS = [
  "Bank Transfer",
  "Cash",
  "Card",
  "Check",
  "PayPal",
  "Other",
];

interface AddPaymentDialogProps {
  invoiceId: string;
  balanceDue: string;
  currency: string;
}

export function AddPaymentDialog({
  invoiceId,
  balanceDue,
  currency,
}: AddPaymentDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [amount, setAmount] = useState(balanceDue);
  const [paidAt, setPaidAt] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [method, setMethod] = useState("Bank Transfer");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await addPayment({
        invoiceId,
        amount: parseFloat(amount),
        paidAt: new Date(paidAt).toISOString(),
        method,
        reference: reference || null,
        note: note || null,
      });
      toast.success("Payment recorded");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to add payment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <SallyTarget id="add-payment" label="Add Payment">
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Add Payment
          </Button>
        </DialogTrigger>
      </SallyTarget>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Add Payment ({currency} {balanceDue} due)
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Amount</Label>
            <SallyTarget id="amount" label="Amount" completeWhen="amountFilled">
              <Input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </SallyTarget>
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <SallyTarget id="date" label="Date" completeWhen="dateFilled">
              <Input
                type="date"
                value={paidAt}
                onChange={(e) => setPaidAt(e.target.value)}
              />
            </SallyTarget>
          </div>
          <div className="space-y-2">
            <Label>Method</Label>
            <SallyTarget id="method" label="Method" completeWhen="methodFilled">
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SallyTarget>
          </div>
          <div className="space-y-2">
            <Label>Reference</Label>
            <SallyTarget id="reference" label="Reference" completeWhen="referenceFilled">
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Transaction reference"
              />
            </SallyTarget>
          </div>
          <div className="space-y-2">
            <Label>Note</Label>
            <SallyTarget id="note" label="Note" completeWhen="noteFilled">
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note"
              />
            </SallyTarget>
          </div>
          <SallyTarget id="record-payment" label={"Record Payment"}>
            <Button
              onClick={handleSubmit}
              disabled={saving || !amount || parseFloat(amount) <= 0}
            >
              {saving ? "Saving..." : "Record Payment"}
            </Button>
          </SallyTarget>
        </div>
      </DialogContent>
    </Dialog>
  );
}
