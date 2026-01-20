import type { DepAddResponse } from "./types"

export function depTemplate(data: DepAddResponse): string {
  if (!data.from || !data.to) return "Failed to add dependency."
  
  const typeDescription = data.type === "discovered-from" 
    ? `${data.to} was discovered while working on ${data.from}`
    : `${data.from} is blocked by ${data.to}`
  
  return `## Dependency Added\n\n` +
    `| Field | Value |\n` +
    `|-------|-------|\n` +
    `| From | ${data.from} |\n` +
    `| To | ${data.to} |\n` +
    `| Type | ${data.type} |\n` +
    `| Timestamp | ${data.timestamp || "N/A"} |\n` +
    `\n**Relationship:** ${typeDescription}\n`
}