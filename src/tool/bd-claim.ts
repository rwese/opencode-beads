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
import { claimTemplate } from './bd-claim.tmpl';
import type { UpdateResponse } from './types';

/**
 * Claim an issue for the current user.
 * This is an alias for: bd update <issue-id> --claim
 * Uses the --claim flag which atomically assigns the issue to the current user
 * and sets status to in_progress.
 */
export const bd_claim: ToolDefinition = tool({
  description:
    'Claim an issue for yourself. Atomically assigns the issue to the current user and sets status to in_progress.',
  args: {
    id: tool.schema.string().describe('The issue ID to claim (REQUIRED)'),
    format: tool.schema.enum(['markdown', 'json', 'raw']).default('markdown'),
  },
  execute: async args => {
    // Build claim command as: bd update <id> --claim --json
    const commandArgs = ['update', args.id, '--claim', '--json'];

    const result = await runBd(commandArgs);

    if (!isSuccess(result)) {
      handleBdError(result);
    }

    // Handle both array and single object responses
    const rawData = result.data as unknown;
    const issueData = Array.isArray(rawData) ? rawData[0] : rawData;
    const issue = transformBdIssue(issueData as Parameters<typeof transformBdIssue>[0]);

    // Sync changes to persist the claim
    await syncChanges();

    return formatOutput(issue as UpdateResponse, result.raw, args.format, claimTemplate);
  },
});
