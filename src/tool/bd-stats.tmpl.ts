import type { StatsResponse } from "./types"

export function statsTemplate(data: StatsResponse): string {
  return `## Project Statistics\n\n` +
    `| Metric | Count |\n` +
    `|--------|-------|\n` +
    `| **Total Issues** | ${data.total} |\n` +
    `| Open | ${data.open} |\n` +
    `| In Progress | ${data.inProgress} |\n` +
    `| Blocked | ${data.blocked} |\n` +
    `| Closed | ${data.closed} |\n` +
    `\n### By Priority\n\n` +
    `| Priority | Count |\n` +
    `|----------|-------|\n` +
    Object.entries(data.byPriority || {}).map(([priority, count]) => 
      `| P${priority} | ${count} |`
    ).join("\n")
}