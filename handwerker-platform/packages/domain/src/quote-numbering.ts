/**
 * Pure formatting/parsing helpers for document numbers. The actual atomic
 * generation happens server-side via the `next_document_number` Postgres
 * function (supabase/migrations/20260101000300_quotes.sql) — this module
 * exists so the web/mobile UI can parse and display numbers consistently
 * without duplicating the sequence logic.
 */

export interface DocumentNumberParts {
  prefix: string;
  year: number;
  sequence: number;
}

export function formatDocumentNumber({ prefix, year, sequence }: DocumentNumberParts): string {
  return `${prefix}-${year}-${String(sequence).padStart(4, "0")}`;
}

const DOCUMENT_NUMBER_PATTERN = /^([A-Za-z]+)-(\d{4})-(\d+)$/;

export function parseDocumentNumber(value: string): DocumentNumberParts | null {
  const match = DOCUMENT_NUMBER_PATTERN.exec(value);
  if (!match) return null;
  const [, prefix, year, sequence] = match as unknown as [string, string, string, string];
  return { prefix, year: Number(year), sequence: Number(sequence) };
}
