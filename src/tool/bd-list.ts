import { tool } from '@opencode-ai/plugin';
import type { ToolDefinition } from '@opencode-ai/plugin';
import { runBd, formatOutput, transformBdIssues, isSuccess, handleBdError } from './utils';
import { listTemplate } from './bd-list.tmpl';
import type { ListResponse, Issue } from './types';

export const bd_list: ToolDefinition = tool({
  description:
    'List all issues filtered by status. Returns a collection of issues matching the specified status (open, in_progress, blocked, or closed).',
  args: {
    status: tool.schema
      .enum(['open', 'in_progress', 'blocked', 'closed'])
      .default('open')
      .describe(
        'Filter issues by status: open (not started), in_progress (actively being worked), blocked (cannot proceed), or closed (completed or abandoned)'
      ),
    format: tool.schema
      .enum(['markdown', 'json', 'raw'])
      .default('markdown')
      .describe(
        'Output format: markdown (formatted table), json (structured data), or raw (direct bd output)'
      ),
  },
  execute: async args => {
    const result = await runBd<Issue[]>(['list', '--status', args.status, '--json']);

    if (!isSuccess(result)) {
      handleBdError(result);
    }

    // Transform the raw data to our expected format
    const issues = transformBdIssues(result.data as unknown[]);
    const response: ListResponse = {
      issues,
      count: issues.length,
      status: args.status,
    };

    return formatOutput(response, result.raw, args.format, listTemplate);
  },
});
