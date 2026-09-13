"use client";

import { SallyProvider } from "@supportsally/react";
import "@supportsally/react/styles.css";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  getInvoiceDetailContext,
  getInvoiceDraftContext,
  snapshotSallyContextVersion,
  subscribeSallyAppContext,
} from "@/lib/sally-app-context";
import { nextcrmInvoiceNavGraph } from "@/lib/sally-nav-graph";

const LOCALE_PREFIX = /^\/(en|cs|de|uk)(?=\/|$)/;

export function appRouteFromPathname(pathname: string): string {
  const stripped = pathname.replace(LOCALE_PREFIX, "");
  return stripped || "/";
}

function buildAppContext(pathname: string) {
  const draft = getInvoiceDraftContext();
  const detail = getInvoiceDetailContext();
  return {
    route: appRouteFromPathname(pathname),
    state: {
      accountSelected: draft.accountSelected,
      lineItemCount: draft.lineItemCount,
      onInvoiceDetail: detail.onInvoiceDetail,
      invoiceIssued: detail.invoiceIssued,
    },
  };
}

const studioUrl = (process.env.NEXT_PUBLIC_SALLY_STUDIO_URL ?? "").trim();
const apiKey = (process.env.NEXT_PUBLIC_SALLY_EMBED_KEY ?? "").trim();
const hosted =
  studioUrl && apiKey ? { studioUrl, apiKey } : undefined;

export function SallyHost({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const locale = useLocale();
  const contextVersion = useSyncExternalStore(
    subscribeSallyAppContext,
    snapshotSallyContextVersion,
    () => "",
  );

  const getAppContext = useCallback(
    () => buildAppContext(pathname),
    [pathname, contextVersion],
  );

  const contextKey = `${pathname}|${contextVersion}`;

  const onNavigate = useCallback(
    (route: string) => {
      if (LOCALE_PREFIX.test(route)) {
        router.push(route);
        return;
      }
      router.push(`/${locale}${route.startsWith("/") ? route : `/${route}`}`);
    },
    [locale, router],
  );

  return (
    <SallyProvider
      hosted={hosted}
      getAppContext={getAppContext}
      contextKey={contextKey}
      navGraph={nextcrmInvoiceNavGraph}
      onNavigate={onNavigate}
    >
      {children}
    </SallyProvider>
  );
}
