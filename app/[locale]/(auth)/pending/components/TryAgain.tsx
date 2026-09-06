"use client";
import { SallyTarget } from "@supportsally/react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

const TryAgain = () => {
  const router = useRouter();
  return <SallyTarget id="try-again-3" label="Try again">
  <Button onClick={() => router.refresh()}>Try again</Button>
</SallyTarget>;
};

export default TryAgain;
