"use client";
import { SallyTarget } from "@supportsally/react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SimilarRecordsDrawer } from "@/components/crm/similar-records-drawer";

type EntityType = "account" | "contact" | "lead" | "opportunity";

interface FindSimilarButtonProps {
  entityType: EntityType;
  recordId: string;
}

export function FindSimilarButton({ entityType, recordId }: FindSimilarButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <SallyTarget id="find-similar" label="Find Similar">
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          Find Similar
        </Button>
      </SallyTarget>
      <SimilarRecordsDrawer
        entityType={entityType}
        recordId={recordId}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
