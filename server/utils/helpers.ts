export function formatTimestamp(date: string | Date) {
  return new Date(date).toISOString();
}
