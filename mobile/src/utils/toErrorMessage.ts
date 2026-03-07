/**
 * Safely extract a human-readable message from an unknown thrown value.
 */
export function toErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}
