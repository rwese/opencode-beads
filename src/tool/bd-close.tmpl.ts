import type { CloseResponse } from "./types"

export function closeTemplate(data: CloseResponse): string {
  if (!data.id || data.status !== "closed") return "Failed to close issue."
  
  return `## Issue Closed\n\n` +
    `| Field | Value |\n` +
    `|-------|-------|\n` +
    `| ID | ${data.id} |\n` +
    `| Title | ${data.title} |\n` +
    `| Status | ${data.status} |\n` +
    `| Type | ${data.type} |\n` +
    `| Priority | P${data.priority} |\n` +
    `| Closed Reason | ${data.closedReason} |\n`
}