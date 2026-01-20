import { tool } from '@opencode-ai/plugin';
import type { ToolDefinition } from '@opencode-ai/plugin';
import { runBd, formatOutput, isSuccess, handleBdError } from './utils';
import { syncTemplate } from './bd-sync.tmpl';
import type { SyncResponse } from './types';

export const bd_sync: ToolDefinition = tool({
  description: 'Sync issues with git remote',
  args: {
    format: tool.schema.enum(['markdown', 'json', 'raw']).default('markdown'),
  },
  execute: async args => {
    const result = await runBd(['sync', '--json']);

    // bd sync --json doesn't return valid JSON, so we handle the text response
    const raw = result.raw;
    const success = raw.includes('✓ Sync complete');

    const response: SyncResponse = {
      status: success ? 'success' : 'failed',
      message: success
        ? 'Sync completed successfully'
        : result.error || 'Sync failed - check output for details',
      changes: extractChanges(raw),
    };

    const format = args.format || 'markdown';
    return formatOutput(response, raw, format, syncTemplate);
  },
});

function extractChanges(raw: string): number {
  const match = raw.match(/Import complete:\s*(\d+)\s+created,\s*(\d+)\s+updated/);
  if (match && match[1] && match[2]) {
    return parseInt(match[1]) + parseInt(match[2]);
  }
  return 0;
}
