import { SallyTarget } from "@supportsally/react";
import React from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth-server";

import { getBoards } from "@/actions/projects/get-boards";

import NewTaskDialog from "../dialogs/NewTask";
import NewProjectDialog from "../dialogs/NewProject";

import { Button } from "@/components/ui/button";
import H2Title from "@/components/typography/h2";

import { ProjectsDataTable } from "../table-components/data-table";
import { columns } from "../table-components/columns";
import { getTranslations } from "next-intl/server";

const ProjectsView = async () => {
  const session = await getSession();
  const t = await getTranslations("ProjectsPage");

  if (!session) return null;

  const userId = session.user.id;

  const boards: any = await getBoards(userId!);

  return (
    <>
      <div className="flex gap-2 py-10">
        <NewProjectDialog />
        <NewTaskDialog boards={boards} />
        <SallyTarget id="alltasks" label={t("allTasks")}>
          <Button asChild>
            <Link href="/projects/tasks">{t("allTasks")}</Link>
          </Button>
        </SallyTarget>
        <SallyTarget id="mytasks" label={t("myTasks")}>
          <Button asChild>
            <Link href={`/projects/tasks/${userId}`}>{t("myTasks")}</Link>
          </Button>
        </SallyTarget>
        <SallyTarget id="dashboard" label={t("dashboard")}>
          <Button asChild>
            <Link href="/projects/dashboard">{t("dashboard")}</Link>
          </Button>
        </SallyTarget>
      </div>
      <div className="pt-2 space-y-3">
        <H2Title>{t("projects")}</H2Title>
        <ProjectsDataTable data={boards} columns={columns} />
      </div>
    </>
  );
};

export default ProjectsView;
