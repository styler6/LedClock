"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { checkInEquipmentAction, checkOutEquipmentAction } from "@/lib/actions/equipment";

export function BookingActions({ bookingId, status }: { bookingId: string; status: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function checkOut() {
    startTransition(async () => {
      await checkOutEquipmentAction(bookingId);
      router.refresh();
    });
  }

  function checkIn() {
    startTransition(async () => {
      await checkInEquipmentAction(bookingId);
      router.refresh();
    });
  }

  if (status === "reserved") {
    return (
      <button disabled={isPending} onClick={checkOut} className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium hover:bg-gray-50">
        Ausgeben
      </button>
    );
  }
  if (status === "checked_out") {
    return (
      <button disabled={isPending} onClick={checkIn} className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium hover:bg-gray-50">
        Rückgabe erfassen
      </button>
    );
  }
  return null;
}
