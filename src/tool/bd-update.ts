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
  description: "Update an issue's status, priority, or assignee",
  args: {
    id: tool.schema.string().describe('The issue ID to update (REQUIRED)'),
    status: tool.schema
      .enum(['open', 'in_progress', 'blocked', 'closed'])
      .optional()
      .describe('New status for the issue (optional)'),
    priority: tool.schema
      .number()
      .optional()
      .describe('New priority level 0-4 (0=highest priority, 4=lowest, optional)'),
    assignee: tool.schema.string().optional().describe('New assignee for the issue (optional)'),
    format: tool.schema.enum(['markdown', 'json', 'raw']).default('markdown'),
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
