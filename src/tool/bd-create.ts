import { tool } from '@opencode-ai/plugin';
import type { ToolDefinition } from '@opencode-ai/plugin';
import { runBd, formatOutput, transformBdIssue, isSuccess, handleBdError } from './utils';
import { createTemplate } from './bd-create.tmpl';
import type { CreateResponse } from './types';

export const bd_create: ToolDefinition = tool({
  description: 'Create a new issue with optional acceptance criteria and dependencies',
  args: {
    title: tool.schema.string().describe('The title of the issue (REQUIRED)'),
    type: tool.schema
      .enum(['bug', 'feature', 'task', 'epic', 'chore'])
      .default('task')
      .describe('Issue type (default: task)'),
    priority: tool.schema
      .string()
      .default('2')
      .describe('Priority as number (0-4) or letter (P0-P4, 0=highest, defaults to 2)'),
    acceptance: tool.schema
      .string()
      .optional()
      .describe('Acceptance criteria for the issue (optional)'),
    description: tool.schema
      .string()
      .optional()
      .describe('Detailed description of the issue (optional)'),
    depends_on: tool.schema
      .array(tool.schema.string())
      .optional()
      .describe('Array of ticket IDs this issue depends on (optional)'),
    format: tool.schema.enum(['markdown', 'json', 'raw']).default('markdown'),
  },
  execute: async args => {
    // Validate required fields
    if (!args.title || args.title.trim().length === 0) {
      throw new Error('Invalid issue title: title cannot be empty');
    }

    // Validate priority format (0-4 or P0-P4)
    const priorityNum = parseInt(args.priority);
    if (isNaN(priorityNum) || priorityNum < 0 || priorityNum > 4) {
      throw new Error(
        `Invalid priority: ${args.priority}. Priority must be 0-4 or P0-P4 (0=highest).`
      );
    }

    // Validate depends_on references
    if (args.depends_on && args.depends_on.length > 0) {
      const missingTickets: string[] = [];

      for (const ticketId of args.depends_on) {
        const result = await runBd(['show', ticketId, '--json']);
        if (!isSuccess(result)) {
          missingTickets.push(ticketId);
        }
      }

      if (missingTickets.length > 0) {
        throw new Error(
          `Cannot create issue: the following referenced tickets do not exist: ${missingTickets.join(', ')}`
        );
      }
    }

    // Build command with all available flags
    // Build arguments array directly to avoid shell quoting issues
    const commandArgs = ['create', args.title, '-t', args.type, '-p', args.priority];

    if (args.acceptance) {
      commandArgs.push('--acceptance', args.acceptance);
    }

    if (args.description) {
      commandArgs.push('-d', args.description);
    }

    if (args.depends_on && args.depends_on.length > 0) {
      commandArgs.push('--deps', args.depends_on.join(','));
    }

    commandArgs.push('--json');

    const result = await runBd(commandArgs);

    if (!isSuccess(result)) {
      handleBdError(result);
    }

    // Handle both array and single object responses
    const rawData = result.data as unknown;
    const issueData = Array.isArray(rawData) ? rawData[0] : rawData;

    // Validate that we got valid issue data back
    if (!issueData || typeof issueData !== 'object') {
      throw new Error('Failed to create issue: unexpected response format from bd command');
    }

    const issue = transformBdIssue(issueData as Parameters<typeof transformBdIssue>[0]);

    return formatOutput(issue as CreateResponse, result.raw, args.format, createTemplate);
  },
});
