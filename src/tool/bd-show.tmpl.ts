import type { ShowResponse } from "./types"

export function showTemplate(data: ShowResponse): string {
  if (!data.id) return "Issue not found."
  
  let output = `## ${data.id}: ${data.title}\n\n` +
    `| Field | Value |\n` +
    `|-------|-------|\n` +
    `| ID | ${data.id} |\n` +
    `| Title | ${data.title} |\n` +
    `| Type | ${data.type} |\n` +
    `| Priority | P${data.priority} |\n` +
    `| Status | ${data.status} |\n`
  
  if (data.assignee) {
    output += `| Assignee | ${data.assignee} |\n`
  }
  
  if (data.description) {
    output += `\n### Description\n\n${data.description}\n`
  }
  
  if (data.acceptance) {
    output += `\n### Acceptance Criteria\n\n${data.acceptance}\n`
  }
  
  if (data.blockedBy && data.blockedBy.length > 0) {
    output += `\n### Blocked By\n\n${data.blockedBy.map(id => `- ${id}`).join("\n")}\n`
  }
  
  if (data.blocks && data.blocks.length > 0) {
    output += `\n### Blocks\n\n${data.blocks.map(id => `- ${id}`).join("\n")}\n`
  }
  
  if (data.createdAt) {
    output += `\n**Created:** ${data.createdAt}\n`
  }
  
  if (data.updatedAt) {
    output += `**Updated:** ${data.updatedAt}\n`
  }
  
  return output
}