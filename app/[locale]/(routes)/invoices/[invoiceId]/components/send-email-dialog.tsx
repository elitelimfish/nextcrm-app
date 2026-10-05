"use client";
import { SallyTarget } from "@supportsally/react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Send } from "lucide-react";
import { sendInvoiceEmail } from "@/actions/invoices/send-invoice-email";

interface SendEmailDialogProps {
  invoiceId: string;
  defaultEmail?: string;
}

export function SendEmailDialog({
  invoiceId,
  defaultEmail,
}: SendEmailDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [to, setTo] = useState(defaultEmail ?? "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = async () => {
    if (!to) {
      toast.error("Email address is required");
      return;
    }
    setSending(true);
    try {
      await sendInvoiceEmail({
        invoiceId,
        to,
        subject: subject || undefined,
        message: message || undefined,
      });
      toast.success("Invoice sent by email");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to send email");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <SallyTarget id="send-by-email" label="Send by Email">
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Send className="mr-2 h-4 w-4" />
            Send by Email
          </Button>
        </DialogTrigger>
      </SallyTarget>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Invoice by Email</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>To</Label>
            <SallyTarget id="to2" label="To" completeWhen="to2Filled">
              <Input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="recipient@example.com"
              />
            </SallyTarget>
          </div>
          <div className="space-y-2">
            <Label>Subject (optional)</Label>
            <SallyTarget id="subject-optional" label="Subject (optional)" completeWhen="subjectOptionalFilled">
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Custom subject line"
              />
            </SallyTarget>
          </div>
          <div className="space-y-2">
            <Label>Message (optional)</Label>
            <SallyTarget id="message-optional" label="Message (optional)" completeWhen="messageOptionalFilled">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Optional message to include"
                rows={3}
              />
            </SallyTarget>
          </div>
          <SallyTarget id="send3" label={sending ? "Sending..." : "Send"}>
            <Button onClick={handleSend} disabled={sending || !to}>
              {sending ? "Sending..." : "Send"}
            </Button>
          </SallyTarget>
        </div>
      </DialogContent>
    </Dialog>
  );
}
