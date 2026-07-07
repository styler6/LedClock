"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProjectStatusAction } from "@/lib/actions/projects";
import type { ProjectStatus } from "@handwerker/shared-types";

const STATUSES: ProjectStatus[] = ["planned", "in_progress", "on_hold", "completed", "cancelled"];
const LABELS: Record<ProjectStatus, string> = {
  planned: "Geplant",
  in_progress: "In Bearbeitung",
  on_hold: "Pausiert",
  completed: "Abgeschlossen",
  cancelled: "Storniert",
};

export function ProjectStatusControl({ projectId, status }: { projectId: string; status: ProjectStatus }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value as ProjectStatus;
        startTransition(async () => {
          await updateProjectStatusAction(projectId, next);
          router.refresh();
        });
      }}
      className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {LABELS[s]}
        </option>
      ))}
    </select>
  );
}
