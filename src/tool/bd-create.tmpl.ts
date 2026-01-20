import type { CreateResponse } from "./types"

export function createTemplate(data: CreateResponse): string {
  if (!data.id) return "Failed to create issue."
  
  return `## Issue Created\n\n` +
    `| Field | Value |\n` +
    `|-------|-------|\n` +
    `| ID | ${data.id} |\n` +
    `| Title | ${data.title} |\n` +
    `| Type | ${data.type} |\n` +
    `| Priority | P${data.priority} |\n` +
    `| Status | ${data.status} |\n` +
    (data.assignee ? `| Assignee | ${data.assignee} |\n` : "") +
    (data.description ? `\n### Description\n\n${data.description}\n` : "") +
    (data.acceptance ? `\n### Acceptance Criteria\n\n${data.acceptance}\n` : "")
}