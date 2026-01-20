import { tool } from '@opencode-ai/plugin';
import type { ToolDefinition } from '@opencode-ai/plugin';
import { runBd, formatOutput, transformBdIssues, isSuccess, handleBdError } from './utils';
import { blockedTemplate } from './bd-blocked.tmpl';
import type { BlockedResponse, Issue } from './types';

export const bd_blocked: ToolDefinition = tool({
  description:
    'Identify issues that cannot proceed due to blocking dependencies. Returns issues with "blocked" status along with information about what is blocking them. Essential for understanding workflow bottlenecks.',
  args: {
    format: tool.schema
      .enum(['markdown', 'json', 'raw'])
      .default('markdown')
      .describe('Output format for the blocked issues list'),
  },
  execute: async args => {
    const result = await runBd<Issue[]>(['blocked', '--json']);

    if (!isSuccess(result)) {
      handleBdError(result);
    }

    const issues = transformBdIssues(result.data as unknown[]);
    const response: BlockedResponse = {
      issues,
      count: issues.length,
    };

    return formatOutput(response, result.raw, args.format, blockedTemplate);
  },
});
