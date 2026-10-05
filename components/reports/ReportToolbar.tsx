"use client";
import { SallyTarget } from "@supportsally/react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Save, Clock } from "lucide-react";
import { SaveConfigDialog } from "./SaveConfigDialog";
import { ScheduleDialog } from "./ScheduleDialog";
import type { ReportCategory } from "@/actions/reports/types";
import { useTranslations } from "next-intl";

type ReportToolbarProps = { category: ReportCategory; currentFilters: string };

export function ReportToolbar({ category, currentFilters }: ReportToolbarProps) {
  const t = useTranslations("ReportsPage.toolbar");
  const [showSave, setShowSave] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  async function handleExportCSV() {
    const response = await fetch(`/api/reports/export?category=${category}&format=csv&${currentFilters}`);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${category}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleExportPDF() {
    const response = await fetch(`/api/reports/export?category=${category}&format=pdf&${currentFilters}`);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${category}-report.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex items-center gap-2">
      <SallyTarget id="exportcsv" label={t("exportCSV")}>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="mr-2 h-4 w-4" />{t("exportCSV")}
        </Button>
      </SallyTarget>
      <SallyTarget id="exportpdf" label={t("exportPDF")}>
        <Button variant="outline" size="sm" onClick={handleExportPDF}>
          <FileText className="mr-2 h-4 w-4" />{t("exportPDF")}
        </Button>
      </SallyTarget>
      <SallyTarget id="saveconfig" label={t("saveConfig")}>
        <Button variant="outline" size="sm" onClick={() => setShowSave(true)}>
          <Save className="mr-2 h-4 w-4" />{t("saveConfig")}
        </Button>
      </SallyTarget>
      <SallyTarget id="schedule" label={t("schedule")}>
        <Button variant="outline" size="sm" onClick={() => setShowSchedule(true)}>
          <Clock className="mr-2 h-4 w-4" />{t("schedule")}
        </Button>
      </SallyTarget>
      <SaveConfigDialog open={showSave} onOpenChange={setShowSave} category={category} currentFilters={currentFilters} />
      <ScheduleDialog open={showSchedule} onOpenChange={setShowSchedule} />
    </div>
  );
}
