import { tool } from '@opencode-ai/plugin';
import type { ToolDefinition } from '@opencode-ai/plugin';
import { runBd, formatOutput, isSuccess, handleBdError, syncChanges } from './utils';
import { closeTemplate } from './bd-close.tmpl';
import type { CloseResponse } from './types';

export const bd_close: ToolDefinition = tool({
  description:
    'Close an issue and mark it as completed or abandoned. The issue status changes to "closed" and a close reason is recorded for tracking and audit purposes.',
  args: {
    id: tool.schema
      .string()
      .describe('The issue ID to close (REQUIRED - e.g., "opencode-beads-abc")'),
    reason: tool.schema
      .string()
      .default('Completed')
      .describe(
        "Rationale for closing: Completed (work finished), Won't Do (intentional rejection), Duplicate (merged with another), or Deleting (removal requested)"
      ),
    format: tool.schema
      .enum(['markdown', 'json', 'raw'])
      .default('markdown')
      .describe('Output format for the closed issue details'),
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
