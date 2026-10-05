"use client";
import { SallyTarget } from "@supportsally/react";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createSchedule } from "@/actions/reports/schedule";
import { loadConfigs } from "@/actions/reports/config";
import type { ExportFormat, ReportCategory } from "@/actions/reports/types";
import { useTranslations } from "next-intl";

const FREQUENCY_CRON: Record<string, string> = {
  daily: "0 9 * * *",
  weekly_mon: "0 9 * * 1",
  weekly_fri: "0 9 * * 5",
  monthly: "0 9 1 * *",
};

type ScheduleDialogProps = { open: boolean; onOpenChange: (open: boolean) => void };

export function ScheduleDialog({ open, onOpenChange }: ScheduleDialogProps) {
  const t = useTranslations("ReportsPage.scheduleDialog");
  const [configs, setConfigs] = useState<{ id: string; name: string; category: string }[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState("");
  const [frequency, setFrequency] = useState("weekly_mon");
  const [customCron, setCustomCron] = useState("");
  const [recipients, setRecipients] = useState("");
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const categories: ReportCategory[] = ["sales", "leads", "accounts", "activity", "campaigns", "users"];
    Promise.all(categories.map((c) => loadConfigs(c))).then((results) => {
      setConfigs(results.flat() as { id: string; name: string; category: string }[]);
    });
  }, [open]);

  async function handleCreate() {
    if (!selectedConfigId || !recipients.trim()) return;
    setLoading(true);
    const cronExpression = frequency === "custom" ? customCron : FREQUENCY_CRON[frequency];
    await createSchedule({ reportConfigId: selectedConfigId, cronExpression, recipients: recipients.split(",").map((e) => e.trim()), format });
    setLoading(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{t("title")}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t("savedReport")}</Label>
            <SallyTarget id="savedreport" label={t("savedReport")} completeWhen="savedreportFilled">
              <Select value={selectedConfigId} onValueChange={setSelectedConfigId}>
                <SelectTrigger><SelectValue placeholder={t("selectReport")} /></SelectTrigger>
                <SelectContent>
                  {configs.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name} ({c.category})</SelectItem>))}
                </SelectContent>
              </Select>
            </SallyTarget>
          </div>
          <div className="space-y-2">
            <Label>{t("frequency")}</Label>
            <SallyTarget id="frequency" label={t("frequency")} completeWhen="frequencyFilled">
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">{t("daily")}</SelectItem>
                  <SelectItem value="weekly_mon">{t("weeklyMon")}</SelectItem>
                  <SelectItem value="weekly_fri">{t("weeklyFri")}</SelectItem>
                  <SelectItem value="monthly">{t("monthly")}</SelectItem>
                  <SelectItem value="custom">{t("custom")}</SelectItem>
                </SelectContent>
              </Select>
            </SallyTarget>
          </div>
          {frequency === "custom" && (
            <div className="space-y-2">
              <Label>{t("cronExpression")}</Label>
              <Input value={customCron} onChange={(e) => setCustomCron(e.target.value)} placeholder="0 9 * * 1" />
            </div>
          )}
          <div className="space-y-2">
            <Label>{t("recipients")}</Label>
            <SallyTarget id="recipients" label={t("recipients")} completeWhen="recipientsFilled">
              <Input value={recipients} onChange={(e) => setRecipients(e.target.value)} placeholder={t("recipientsPlaceholder")} />
            </SallyTarget>
          </div>
          <div className="space-y-2">
            <Label>{t("format")}</Label>
            <SallyTarget id="format" label={t("format")} completeWhen="formatFilled">
              <Select value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="both">{t("both")}</SelectItem>
                </SelectContent>
              </Select>
            </SallyTarget>
          </div>
        </div>
        <DialogFooter>
          <SallyTarget id="cancel17" label={t("cancel")}>
            <Button variant="outline" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
          </SallyTarget>
          <SallyTarget id="create6" label={t("create")}>
            <Button onClick={handleCreate} disabled={loading || !selectedConfigId}>{t("create")}</Button>
          </SallyTarget>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
