import { tool } from '@opencode-ai/plugin';
import type { ToolDefinition } from '@opencode-ai/plugin';

/**
 * Mock bd_stats tool that provides helpful information when beads is not initialized.
 * This tool is only used when beads is not enabled for the repository.
 */
export const bd_stats_mock: ToolDefinition = tool({
  description: 'Show project statistics (mock tool when beads is not initialized)',
  args: {
    format: tool.schema.enum(['markdown', 'json', 'raw']).default('markdown'),
  },
  execute: async args => {
    const mockData = {
      total: 0,
      open: 0,
      inProgress: 0,
      closed: 0,
      blocked: 0,
      byPriority: {},
      message: 'Beads is not initialized for this repository',
    };

    if (args.format === 'json') {
      return JSON.stringify(mockData, null, 2);
    }

    if (args.format === 'raw') {
      return 'Beads is not initialized for this repository.\n\nTo enable beads, run:\nbd init';
    }

    // Default markdown format
    return `## Project Statistics

> ⚠️ **Beads Not Initialized**
> 
> Beads issue tracking is not initialized for this repository.

### Current Status

| Metric | Count |
|--------|-------|
| **Total Issues** | 0 |
| Open | 0 |
| In Progress | 0 |
| Blocked | 0 |
| Closed | 0 |

### Getting Started

To enable beads for this repository, run:

\`\`\`bash
bd init
\`\`\`

This will initialize beads tracking and allow you to:
- Create and manage issues
- Track dependencies between tasks
- Sync with git for automatic state management

### Available Commands (when initialized)

Once beads is initialized, you'll have access to:
- \`bd stats\` - View project statistics
- \`bd list\` - List issues by status
- \`bd ready\` - Find unblocked tasks
- \`bd create "title"\` - Create new issues
- \`bd show <id>\` - View issue details
- And more...
`;
  },
});
