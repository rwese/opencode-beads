import type { ReadyResponse } from "./types"

export function readyTemplate(data: ReadyResponse): string {
  if (!data.issues?.length) return "No ready tasks found."
  
  return `## Ready Tasks (${data.issues.length})\n\n` +
    `| ID | Title | Priority | Type |\n` +
    `|----|-------|----------|------|\n` +
    data.issues.map(i => 
      `| ${i.id} | ${i.title} | P${i.priority} | ${i.type} |${i.acceptance ? ' ✓' : ''}`
    ).join("\n")
}