"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markInvoicePaidAction, updateInvoiceStatusAction } from "@/lib/actions/invoices";
import type { InvoiceStatus } from "@handwerker/shared-types";

export function InvoiceActions({ id, status }: { id: string; status: InvoiceStatus }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function setStatus(next: InvoiceStatus) {
    startTransition(async () => {
      await updateInvoiceStatusAction(id, next);
      router.refresh();
    });
  }

  function markPaid() {
    startTransition(async () => {
      await markInvoicePaidAction(id);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={`/api/pdf/invoice/${id}`}
        target="_blank"
        rel="noreferrer"
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
      >
        Als PDF exportieren
      </a>
      {status === "draft" ? (
        <button disabled={isPending} onClick={() => setStatus("sent")} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50">
          Als versendet markieren
        </button>
      ) : null}
      {(status === "sent" || status === "overdue") ? (
        <button disabled={isPending} onClick={markPaid} className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800">
          Zahlungseingang markieren
        </button>
      ) : null}
    </div>
  );
}
