"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { calculateDocumentTotals } from "@handwerker/domain";
import type { Customer, Project } from "@handwerker/shared-types";
import { createQuoteAction } from "@/lib/actions/quotes";

interface LineItemDraft {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  taxRate: number;
}

const EMPTY_ITEM: LineItemDraft = { description: "", quantity: 1, unit: "Stk", unitPrice: 0, taxRate: 19 };

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);
}

export function QuoteForm({ customers, projects }: { customers: Customer[]; projects: Project[] }) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [projectId, setProjectId] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItemDraft[]>([{ ...EMPTY_ITEM }]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const totals = calculateDocumentTotals(items.map((i) => ({ quantity: i.quantity, unitPrice: i.unitPrice, taxRate: i.taxRate })));

  function updateItem(index: number, patch: Partial<LineItemDraft>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function addItem() {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createQuoteAction({
        customerId,
        projectId: projectId || undefined,
        validUntil: validUntil || undefined,
        notes: notes || undefined,
        lineItems: items,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push(`/quotes/${result.id}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Kunde</label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Projekt (optional)</label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">— Kein Projekt —</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Gültig bis</label>
          <input
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-sm font-medium">Positionen</label>
          <button type="button" onClick={addItem} className="text-sm font-medium text-gray-900 underline">
            + Position hinzufügen
          </button>
        </div>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 rounded-md border border-gray-200 p-2">
              <input
                className="col-span-5 rounded-md border border-gray-300 px-2 py-1 text-sm"
                placeholder="Beschreibung"
                value={item.description}
                onChange={(e) => updateItem(index, { description: e.target.value })}
                required
              />
              <input
                className="col-span-1 rounded-md border border-gray-300 px-2 py-1 text-sm"
                type="number"
                min={0}
                step="0.01"
                value={item.quantity}
                onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
              />
              <input
                className="col-span-2 rounded-md border border-gray-300 px-2 py-1 text-sm"
                placeholder="Einheit"
                value={item.unit}
                onChange={(e) => updateItem(index, { unit: e.target.value })}
              />
              <input
                className="col-span-2 rounded-md border border-gray-300 px-2 py-1 text-sm"
                type="number"
                min={0}
                step="0.01"
                placeholder="Einzelpreis"
                value={item.unitPrice}
                onChange={(e) => updateItem(index, { unitPrice: Number(e.target.value) })}
              />
              <input
                className="col-span-1 rounded-md border border-gray-300 px-2 py-1 text-sm"
                type="number"
                min={0}
                max={100}
                value={item.taxRate}
                onChange={(e) => updateItem(index, { taxRate: Number(e.target.value) })}
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
                className="col-span-1 text-sm text-red-600 disabled:opacity-30"
              >
                Entfernen
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Notizen</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          rows={3}
        />
      </div>

      <div className="ml-auto w-64 space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Zwischensumme</span>
          <span>{formatCurrency(totals.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>MwSt.</span>
          <span>{formatCurrency(totals.taxTotal)}</span>
        </div>
        <div className="flex justify-between border-t border-gray-900 pt-1 font-semibold">
          <span>Gesamt</span>
          <span>{formatCurrency(totals.total)}</span>
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {isPending ? "Wird erstellt…" : "Angebot erstellen"}
      </button>
    </form>
  );
}
