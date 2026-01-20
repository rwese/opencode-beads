import type { BlockedResponse } from './types';

export function blockedTemplate(data: BlockedResponse): string {
  if (!data.issues?.length) return 'No blocked issues found.';

  let output =
    `## Blocked Issues (${data.issues.length})\n\n` +
    '| ID | Title | Priority | Type | Blocked By |\n' +
    '|----|-------|----------|------|------------|\n';

  data.issues.forEach(i => {
    const blockedBy = i.blockedBy?.join(', ') || 'unknown';
    output += `| ${i.id} | ${i.title} | P${i.priority} | ${i.type} | ${blockedBy} |\n`;
  });

  return output;
}
