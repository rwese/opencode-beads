import type { UpdateResponse } from './types';

export function updateTemplate(data: UpdateResponse): string {
  if (!data.id) return 'Failed to update issue.';

  let output =
    '## Issue Updated\n\n' +
    '| Field | Value |\n' +
    '|-------|-------|\n' +
    `| ID | ${data.id} |\n` +
    `| Title | ${data.title} |\n` +
    `| Status | ${data.status} |\n` +
    `| Priority | P${data.priority} |\n`;

  if (data.assignee) {
    output += `| Assignee | ${data.assignee} |\n`;
  }

  if (data.previousStatus && data.previousStatus !== data.status) {
    output += `\n**Status changed:** ${data.previousStatus} → ${data.status}\n`;
  }

  return output;
}
