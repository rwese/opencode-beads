import { tool } from '@opencode-ai/plugin';
import type { ToolDefinition } from '@opencode-ai/plugin';
import { runBd, formatOutput, transformBdIssues, isSuccess, handleBdError } from './utils';
import { readyTemplate } from './bd-ready.tmpl';
import type { ReadyResponse, Issue } from './types';

export const bd_ready: ToolDefinition = tool({
  description:
    'Discover issues that are ready to be worked on. Returns issues with "open" status that have no blocking dependencies and are not deferred. Perfect for finding immediate work items.',
  args: {
    format: tool.schema
      .enum(['markdown', 'json', 'raw'])
      .default('markdown')
      .describe('Output format for the ready issues list'),
    limit: tool.schema
      .number()
      .default(100)
      .describe(
        'Maximum number of ready issues to return (default: 100, set lower for focused lists)'
      ),
  },
  execute: async args => {
    const result = await runBd<Issue[]>(['ready', '--json']);

    if (!isSuccess(result)) {
      handleBdError(result);
    }

    const issues = transformBdIssues(result.data as unknown[]);
    const limitedIssues = issues.slice(0, args.limit);
    const response: ReadyResponse = {
      issues: limitedIssues,
      count: limitedIssues.length,
      limit: args.limit,
    };

    return formatOutput(response, result.raw, args.format, readyTemplate);
  },
});
