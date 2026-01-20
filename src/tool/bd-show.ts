import { tool } from '@opencode-ai/plugin';
import type { ToolDefinition } from '@opencode-ai/plugin';
import {
  runBd,
  formatOutput,
  transformBdIssue,
  transformBdIssues,
  isSuccess,
  handleBdError,
} from './utils';
import { showTemplate } from './bd-show.tmpl';
import type { ShowResponse, Issue } from './types';

export const bd_show: ToolDefinition = tool({
  description: 'Show detailed information about an issue',
  args: {
    id: tool.schema
      .array(tool.schema.string())
      .describe('Issue ID(s) to retrieve (REQUIRED - can be single ID or array)'),
    format: tool.schema.enum(['markdown', 'json', 'raw']).default('markdown'),
  },
  execute: async args => {
    // Validate ticket IDs
    const ids = Array.isArray(args.id) ? args.id : [args.id];
    if (ids.length === 0 || ids.some(id => !id || id.trim().length === 0)) {
      throw new Error('Invalid ticket ID(s): ID(s) cannot be empty');
    }

    // Sanitize the ticket IDs to prevent command injection
    const sanitizedIds = ids.map(id => id.replace(/[;&|`$(){}[\]\\]/g, ''));

    const result = await runBd<Issue[]>(['show', ...sanitizedIds, '--json']);

    if (!isSuccess(result)) {
      handleBdError(result);
    }

    // Handle array response
    const rawData = result.data as Issue[];
    const issues = transformBdIssues(rawData);

    // Check if issues were found
    if (issues.length === 0) {
      throw new Error(
        `Issue(s) not found: ${ids.join(', ')}. The issue(s) may have been deleted or the IDs are incorrect.`
      );
    }

    // Format each issue and join them
    const formattedOutputs = issues.map((issue: Issue) => {
      const showResponse: ShowResponse = {
        ...issue,
        blockedBy: issue.blockedBy,
        blocks: issue.blocks,
        dependencies: [],
        labels: [],
        createdAt: issue.createdAt,
        updatedAt: issue.updatedAt,
      };
      return formatOutput(showResponse, result.raw, args.format, showTemplate);
    });

    // Join multiple issues with a separator
    return formattedOutputs.join('\n---\n\n');
  },
});
