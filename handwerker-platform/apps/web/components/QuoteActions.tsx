"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateQuoteStatusAction } from "@/lib/actions/quotes";
import { convertQuoteToInvoiceAction } from "@/lib/actions/invoices";
import type { QuoteStatus } from "@handwerker/shared-types";

export function QuoteActions({ id, status }: { id: string; status: QuoteStatus }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function setStatus(next: QuoteStatus) {
    startTransition(async () => {
      await updateQuoteStatusAction(id, next);
      router.refresh();
    });
  }

  function convertToInvoice() {
    startTransition(async () => {
      const result = await convertQuoteToInvoiceAction(id);
      if (result.id) router.push(`/invoices/${result.id}`);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={`/api/pdf/quote/${id}`}
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
      {status === "sent" ? (
        <>
          <button disabled={isPending} onClick={() => setStatus("accepted")} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50">
            Als angenommen markieren
          </button>
          <button disabled={isPending} onClick={() => setStatus("rejected")} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50">
            Als abgelehnt markieren
          </button>
        </>
      ) : null}
      {status === "accepted" ? (
        <button
          disabled={isPending}
          onClick={convertToInvoice}
          className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          In Rechnung umwandeln
        </button>
      ) : null}
    </div>
  );
}
