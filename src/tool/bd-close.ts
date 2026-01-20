import { tool } from '@opencode-ai/plugin';
import type { ToolDefinition } from '@opencode-ai/plugin';
import { runBd, formatOutput, isSuccess, handleBdError, syncChanges } from './utils';
import { closeTemplate } from './bd-close.tmpl';
import type { CloseResponse } from './types';

export const bd_close: ToolDefinition = tool({
  description: 'Close an issue with a reason',
  args: {
    id: tool.schema.string().describe('The issue ID to close (REQUIRED)'),
    reason: tool.schema.string().default('Completed').describe('Reason for closing the issue'),
    format: tool.schema.enum(['markdown', 'json', 'raw']).default('markdown'),
  },
  execute: async args => {
    const result = await runBd(['close', args.id, '--reason', args.reason, '--json']);

    if (!isSuccess(result)) {
      handleBdError(result);
    }

    // Handle both array and single object responses
    const rawData = result.data as unknown;
    const issueData = Array.isArray(rawData) ? rawData[0] : rawData;
    const issue = issueData as Record<string, unknown>;

    const response: CloseResponse = {
      id: String(issue.id || ''),
      title: String(issue.title || ''),
      type: (issue.issue_type as CloseResponse['type']) || 'task',
      priority: Number(issue.priority) || 2,
      status: 'closed',
      description: issue.description as string | undefined,
      assignee: issue.owner as string | undefined,
      closedReason: issue.close_reason as string | undefined,
      closedAt: issue.closed_at as string | undefined,
      createdAt: issue.created_at as string | undefined,
      updatedAt: issue.updated_at as string | undefined,
    };

    // Sync changes to persist the closure
    await syncChanges();

    return formatOutput(response, result.raw, args.format, closeTemplate);
  },
});
