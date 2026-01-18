import type { UpdateResponse } from "./types"

/**
 * Format claim response for display
 */
export function claimTemplate(data: UpdateResponse): string {
  if (!data.id) return "Failed to claim issue."
  
  return `## Issue Claimed\n\n` +
    `| Field | Value |\n` +
    `|-------|-------|\n` +
    `| ID | ${data.id} |\n` +
    `| Title | ${data.title} |\n` +
    `| Status | ${data.status} |\n` +
    `| Priority | P${data.priority} |\n` +
    `| Assignee | ${data.assignee || "you"} |\n\n` +
    `✅ Issue claimed successfully and set to in_progress.\n`
}
