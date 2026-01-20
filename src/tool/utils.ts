import type { Issue } from './types';

export interface BdCommandResult<T = unknown> {
  data: T;
  raw: string;
  success: boolean;
  error?: string;
}

const BD_PATH = '/Users/wese/.local/bin/bd';

export async function runBd<T = unknown>(args: string[]): Promise<BdCommandResult<T>> {
  try {
    // Execute bd directly - daemon mode handles database automatically
    const { stdout, stderr } = await Bun.spawn({
      cmd: [BD_PATH, ...args],
      stdout: 'pipe',
      stderr: 'pipe',
    });

    const raw = await new Response(stdout).text();
    const errorOutput = await new Response(stderr).text();

    // Check for failure - look for error messages in stderr
    const hasError =
      errorOutput.length > 0 &&
      (errorOutput.toLowerCase().includes('error') ||
        errorOutput.toLowerCase().includes('failed') ||
        errorOutput.toLowerCase().includes('unknown command'));

    if (hasError) {
      return {
        data: null as T,
        raw,
        success: false,
        error: errorOutput.trim(),
      };
    }

    // Try to parse as JSON
    try {
      const data = JSON.parse(raw) as T;
      return { data, raw, success: true };
    } catch {
      // JSON parsing failed, but command might have succeeded
      // Check for common success indicators in the output
      if (
        raw.includes('✓') ||
        raw.includes('Sync complete') ||
        raw.includes('created') ||
        raw.includes('updated')
      ) {
        // Command likely succeeded but didn't return JSON
        return {
          data: { success: true, message: raw } as T,
          raw,
          success: true,
        };
      }

      // Command likely failed
      const errorMsg = extractErrorMessage(raw);
      return {
        data: null as T,
        raw,
        success: false,
        error: errorMsg || 'bd command failed: command did not return valid JSON',
      };
    }
  } catch (error) {
    // Command execution failed
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      data: null as T,
      raw: '',
      success: false,
      error: `bd command execution failed: ${errorMsg}`,
    };
  }
}

function extractErrorMessage(output: string): string {
  // Try to extract meaningful error messages from bd output
  const patterns = [
    /Error:\s*(.+)/i,
    /error:\s*(.+)/i,
    /failed:\s*(.+)/i,
    /Could not find\s+(.+)/i,
    /does not exist:\s*(.+)/i,
    /Invalid\s+(.+)/i,
  ];

  for (const pattern of patterns) {
    const match = output.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // Return the last non-empty line if no pattern matches
  const lines = output
    .trim()
    .split('\n')
    .filter(line => line.trim());
  return lines.length > 0 ? lines[lines.length - 1] || '' : '';
}

export function isSuccess<T>(
  result: BdCommandResult<T>
): result is BdCommandResult<T> & { data: Exclude<T, null> } {
  return result.success && result.data !== null;
}

export function handleBdError(result: BdCommandResult): never {
  throw new Error(result.error || `bd command failed: ${result.raw.slice(0, 200)}`);
}

export interface BdRawIssue {
  id: string;
  title: string;
  status: string;
  priority: number;
  issue_type: string;
  description?: string;
  owner?: string;
  acceptance?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  blocked_by?: string[];
  blocks?: string[];
  dependency_count?: number;
  dependent_count?: number;
  closed_at?: string;
  close_reason?: string;
}

const VALID_ISSUE_STATUSES = ['open', 'in_progress', 'blocked', 'closed'] as const;
type ValidIssueStatus = (typeof VALID_ISSUE_STATUSES)[number];

const VALID_ISSUE_TYPES = ['bug', 'feature', 'task', 'epic', 'chore'] as const;
type ValidIssueType = (typeof VALID_ISSUE_TYPES)[number];

export function transformBdIssue(raw: BdRawIssue | Record<string, unknown>) {
  const typeValue = (raw.issue_type as string) || 'task';
  const type = VALID_ISSUE_TYPES.includes(typeValue as ValidIssueType)
    ? (typeValue as ValidIssueType)
    : 'task';

  const statusValue = (raw.status as string) || 'open';
  const status = VALID_ISSUE_STATUSES.includes(statusValue as ValidIssueStatus)
    ? (statusValue as ValidIssueStatus)
    : 'open';

  return {
    id: String(raw.id || ''),
    title: String(raw.title || ''),
    type,
    priority: Number(raw.priority) || 2,
    status,
    description: raw.description as string | undefined,
    assignee: raw.owner as string | undefined,
    acceptance: raw.acceptance as string | undefined,
    createdAt: raw.created_at as string,
    updatedAt: raw.updated_at as string,
    blockedBy: raw.blocked_by as string[] | undefined,
    blocks: raw.blocks as string[] | undefined,
  };
}

export function transformBdIssues(raw: unknown[]): Issue[] {
  const issues = Array.isArray(raw) ? raw : [];
  return issues.map(item => transformBdIssue(item as BdRawIssue | Record<string, unknown>));
}

export interface BdRawStats {
  summary?: {
    total_issues?: number;
    open_issues?: number;
    in_progress_issues?: number;
    closed_issues?: number;
    blocked_issues?: number;
    [key: string]: unknown;
  };
  recent_activity?: {
    hours_tracked?: number;
    commit_count?: number;
    issues_created?: number;
    issues_closed?: number;
    issues_updated?: number;
    issues_reopened?: number;
    total_changes?: number;
    [key: string]: unknown;
  };
  byPriority?: Record<string, number>;
}

export function transformBdStats(raw: BdRawStats) {
  const summary = raw.summary || {};
  const byPriority: Record<string, number> = {};

  // Extract priority counts from the summary
  if (summary.total_issues !== undefined) {
    byPriority['total'] = summary.total_issues;
  }
  if (summary.open_issues !== undefined) {
    byPriority['open'] = summary.open_issues;
  }
  if (summary.in_progress_issues !== undefined) {
    byPriority['inProgress'] = summary.in_progress_issues;
  }
  if (summary.closed_issues !== undefined) {
    byPriority['closed'] = summary.closed_issues;
  }
  if (summary.blocked_issues !== undefined) {
    byPriority['blocked'] = summary.blocked_issues;
  }

  return {
    total: summary.total_issues || 0,
    open: summary.open_issues || 0,
    inProgress: summary.in_progress_issues || 0,
    closed: summary.closed_issues || 0,
    blocked: summary.blocked_issues || 0,
    byPriority,
  };
}

export function formatOutput<T>(
  data: T,
  raw: string,
  format: 'markdown' | 'json' | 'raw',
  template: (data: T) => string
): string {
  if (format === 'json') return JSON.stringify(data, null, 2);
  if (format === 'raw') return raw;
  return template(data);
}

/**
 * Session context interface for OpenCode events
 */
interface SessionContext {
  sessionID?: string;
  info?: {
    sessionID?: string;
    id?: string;
  };
}

/**
 * Get the current session ID from OpenCode event context or environment.
 * Uses OpenCode's multi-layered session ID extraction pattern.
 *
 * Priority order (matching OpenCode's approach):
 * 1. OpenCode event context (if available via environment variable)
 * 2. CLAUDE_SESSION_ID environment variable
 * 3. Fallback to 'unknown'
 */
export function getSessionId(context?: SessionContext): string {
  // Priority 1: Check OpenCode event context if provided
  if (context?.sessionID && typeof context.sessionID === 'string') {
    return context.sessionID;
  }
  if (context?.info?.sessionID && typeof context.info.sessionID === 'string') {
    return context.info.sessionID;
  }
  if (context?.info?.id && typeof context.info.id === 'string') {
    return context.info.id;
  }

  // Priority 2: Check environment variable (set by OpenCode)
  if (process.env.CLAUDE_SESSION_ID) {
    return process.env.CLAUDE_SESSION_ID;
  }

  // Priority 3: Fallback for other contexts
  if (process.env.OPENCODE_SESSION_ID) {
    return process.env.OPENCODE_SESSION_ID;
  }

  // Final fallback
  return 'unknown';
}

/**
 * Sync changes to beads after modifying operations.
 * Uses --flush-only to sync without pulling, and --message for commit message.
 *
 * @param context Optional OpenCode session context for accurate session tracking
 */
export async function syncChanges(context?: SessionContext): Promise<BdCommandResult> {
  const sessionId = getSessionId(context);
  return runBd(['sync', '--flush-only', '--message', `quicksave ${sessionId}`]);
}
