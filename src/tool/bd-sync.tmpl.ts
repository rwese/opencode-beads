import type { SyncResponse } from './types';

export function syncTemplate(data: SyncResponse): string {
  return (
    '## Sync Status\n\n' +
    '| Field | Value |\n' +
    '|-------|-------|\n' +
    `| Status | ${data.status} |\n` +
    `| Message | ${data.message} |\n`
  );
}
