"use client";

import { useSally } from "@supportsally/react";
import { useEffect } from "react";

/** Registered Save / submit actions for Review-then-run Do journeys. */
export function SallyActions() {
  const { registerAction } = useSally();

  useEffect(() => {
    const unsubs = [
      registerAction({
        id: "save-lead",
        label: "Save lead",
        risk: "high",
        run: () => {
          const btn = document.querySelector<HTMLButtonElement>(
            '[data-testid="lead-submit-btn"]',
          );
          const form = btn?.closest("form");
          if (form instanceof HTMLFormElement) form.requestSubmit();
        },
      }),
    ];
    return () => {
      for (const unsub of unsubs) unsub();
    };
  }, [registerAction]);

  return null;
}
