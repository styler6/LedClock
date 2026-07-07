"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setEmployeeRoleAction } from "@/lib/actions/admin";
import type { Role } from "@handwerker/shared-types";

export function RoleSelect({ profileId, role }: { profileId: string; role: Role }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={role}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value as Role;
        startTransition(async () => {
          await setEmployeeRoleAction(profileId, next);
          router.refresh();
        });
      }}
      className="rounded-md border border-gray-300 px-2 py-1 text-sm"
    >
      <option value="owner">Owner</option>
      <option value="admin">Admin</option>
      <option value="employee">Mitarbeiter</option>
    </select>
  );
}
