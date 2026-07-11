export function normalizeQuotes(quotesField: any): any[] {
  if (!quotesField) return [];

  if (Array.isArray(quotesField)) {
    return quotesField.map((q: any) => {
      if (typeof q === "string") {
        return { text: q, context: "" };
      }
      if (q && typeof q === "object") {
        return {
          text: q.text || q.quote || q.content || "",
          context: q.context || q.chapter || q.speaker || ""
        };
      }
      return q;
    }).filter((q: any) => q && q.text);
  }

  if (typeof quotesField === "string") {
    try {
      const parsed = JSON.parse(quotesField);
      if (Array.isArray(parsed)) {
        return normalizeQuotes(parsed);
      }
    } catch (_) {
      // It's a standard string with line breaks
      return quotesField.split("\n").map((line: string) => {
        const trimmed = line.trim();
        if (!trimmed) return null;
        // Check if there is speaker / chapter context separated by - or —
        const parts = trimmed.split(/[-—]/);
        if (parts.length > 1) {
          return {
            text: parts[0].trim().replace(/^["']|["']$/g, ""),
            context: parts.slice(1).join("-").trim()
          };
        }
        return { text: trimmed.replace(/^["']|["']$/g, ""), context: "" };
      }).filter(Boolean);
    }
  }

  return [];
}
