import type { ListResponse } from "./types"

export function listTemplate(data: ListResponse): string {
  if (!data.issues?.length) return `No ${data.status} issues found.`
  
  let output = `## ${data.status.charAt(0).toUpperCase() + data.status.slice(1).replace("_", " ")} Issues (${data.issues.length})\n\n` +
    `| ID | Title | Priority | Type |\n` +
    `|----|-------|----------|------|\n`
  
  data.issues.forEach(i => {
    output += `| ${i.id} | ${i.title} | P${i.priority} | ${i.type} |`
    if (i.assignee) {
      output += ` @${i.assignee}`
    }
    if (i.acceptance) {
      output += ` ✓`
    }
    output += "\n"
  })
  
  return output
}