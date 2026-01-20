import { tool } from '@opencode-ai/plugin';
import type { ToolDefinition } from '@opencode-ai/plugin';
import {
  runBd,
  formatOutput,
  transformBdIssue,
  isSuccess,
  handleBdError,
  syncChanges,
} from './utils';
import { updateTemplate } from './bd-update.tmpl';
import type { UpdateResponse, Issue } from './types';

export const bd_update: ToolDefinition = tool({
  description:
    "Modify an existing issue's properties. Updates are applied atomically and the modified issue is returned. Supports changing status, priority, assignee, and other metadata.",
  args: {
    id: tool.schema
      .string()
      .describe('The issue ID to update (REQUIRED - e.g., "opencode-beads-abc")'),
    status: tool.schema
      .enum(['open', 'in_progress', 'blocked', 'closed'])
      .optional()
      .describe(
        'New workflow status: open (not started), in_progress (actively being worked), blocked (waiting on dependencies), or closed (completed)'
      ),
    priority: tool.schema
      .number()
      .optional()
      .describe('New priority level 0-4 (0=highest/critical priority, 4=lowest/minor)'),
    assignee: tool.schema
      .string()
      .optional()
      .describe('Person responsible for the issue (username or email)'),
    format: tool.schema
      .enum(['markdown', 'json', 'raw'])
      .default('markdown')
      .describe('Output format for the response'),
  },
  execute: async args => {
    // Build update command arguments as array
    const commandArgs = ['update', args.id, '--json'];

    if (args.status) {
      commandArgs.push('--status', args.status);
    }

    if (args.priority !== undefined) {
      commandArgs.push('--priority', String(args.priority));
    }

    if (args.assignee) {
      commandArgs.push('--assignee', args.assignee);
    }

    const result = await runBd(commandArgs);

    if (!isSuccess(result)) {
      handleBdError(result);
    }

    // Handle both array and single object responses
    const rawData = result.data as unknown;
    const issueData = Array.isArray(rawData) ? rawData[0] : rawData;
    const issue = transformBdIssue(issueData as Parameters<typeof transformBdIssue>[0]);

    // Sync changes to persist the update
    await syncChanges();

    return formatOutput(issue as UpdateResponse, result.raw, args.format, updateTemplate);
  },
});
