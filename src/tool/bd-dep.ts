import { tool } from '@opencode-ai/plugin';
import type { ToolDefinition } from '@opencode-ai/plugin';
import { runBd, formatOutput, isSuccess, handleBdError, syncChanges } from './utils';
import { depTemplate } from './bd-dep.tmpl';
import type { DepAddResponse } from './types';

export const bd_dep: ToolDefinition = tool({
  description:
    'Create dependency relationships between issues to establish workflow order and blocking. Returns confirmation of the added dependency with relationship type and timestamp.',
  args: {
    issue_id: tool.schema
      .string()
      .describe(
        'The issue that will have the dependency added (REQUIRED - e.g., "opencode-beads-abc" which depends on another issue)'
      ),
    depends_on: tool.schema
      .string()
      .describe(
        'The issue that is the dependency (REQUIRED - e.g., "opencode-beads-xyz" which blocks the first issue)'
      ),
    type: tool.schema
      .enum([
        'blocks',
        'tracks',
        'related',
        'parent-child',
        'discovered-from',
        'until',
        'caused-by',
        'validates',
        'relates-to',
        'supersedes',
      ])
      .default('blocks')
      .describe('How the issues are related'),
    format: tool.schema.enum(['markdown', 'json', 'raw']).default('markdown'),
  },
  execute: async args => {
    const result = await runBd<DepAddResponse>([
      'dep',
      'add',
      args.issue_id,
      args.depends_on,
      '--type',
      args.type,
      '--json',
    ]);

    if (!isSuccess(result)) {
      handleBdError(result);
    }

    // Sync changes to persist the dependency
    await syncChanges();

    return formatOutput(result.data, result.raw, args.format, depTemplate);
  },
});
