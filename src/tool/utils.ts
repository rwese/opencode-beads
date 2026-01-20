import type { Issue } from "./types"

export interface BdCommandResult<T = unknown> {
  data: T
  raw: string
  success: boolean
  error?: string
}

const BD_PATH = '/Users/wese/.local/bin/bd'

// Cached database path to avoid repeated calls to bd info
let cachedDbPath: string | null = null

/**
 * Get the database path by querying bd info command
 * This dynamically discovers the database path instead of hardcoding it
 */
export async function getDatabasePath(): Promise<string> {
  if (cachedDbPath) {
    return cachedDbPath
  }
  
  try {
    // Use bd info command to get database location
    const { stdout } = await Bun.spawn({
      cmd: [BD_PATH, 'info', '--json'],
      stdout: 'pipe',
      stderr: 'pipe'
    })
    
    const raw = await new Response(stdout).text()
    const info = JSON.parse(raw)
    
    // Extract database path from bd info output
    // The structure may vary, so we check common locations
    if (info?.database) {
      cachedDbPath = String(info.database)
    } else if (info?.path) {
      cachedDbPath = String(info.path)
    } else if (info?.db) {
      cachedDbPath = String(info.db)
    } else {
      throw new Error('Could not determine database path from bd info')
    }
    
    return cachedDbPath
  } catch (error) {
    // Fallback: try to use environment variable or default location
    if (process.env.BEADS_DB) {
      return process.env.BEADS_DB
    }
    
    throw new Error(`Failed to get database path: ${error instanceof Error ? error.message : String(error)}. Try setting BEADS_DB environment variable.`)
  }
}

/**
 * Force refresh of cached database path
 */
export function clearDatabasePathCache(): void {
  cachedDbPath = null
}

export async function runBd<T = unknown>(args: string[]): Promise<BdCommandResult<T>> {
  try {
    // Get the database path dynamically
    const dbPath = await getDatabasePath()
    
    // Build arguments array with database path and no-daemon mode
    // Each element in the array becomes a separate argument - no shell parsing
    const allArgs = ['--db', dbPath, '--no-daemon', ...args]
    
    // Execute bd directly without shell - array elements become individual arguments
    // This handles all characters correctly (quotes, spaces, unicode, etc.)
    const { stdout, stderr } = await Bun.spawn({
      cmd: [BD_PATH, ...allArgs],
      stdout: 'pipe',
      stderr: 'pipe'
    })
    
    const raw = await new Response(stdout).text()
    const errorOutput = await new Response(stderr).text()
    
    // Check for failure - look for error messages in stderr
    const hasError = errorOutput.length > 0 && 
      (errorOutput.toLowerCase().includes('error') || 
       errorOutput.toLowerCase().includes('failed') ||
       errorOutput.toLowerCase().includes('unknown command'))
    
    if (hasError) {
      return {
        data: null as T,
        raw,
        success: false,
        error: errorOutput.trim()
      }
    }
    
    // Try to parse as JSON
    try {
      const data = JSON.parse(raw) as T
      return { data, raw, success: true }
    } catch {
      // JSON parsing failed, but command might have succeeded
      // Check for common success indicators in the output
      if (raw.includes('✓') || raw.includes('Sync complete') || raw.includes('created') || raw.includes('updated')) {
        // Command likely succeeded but didn't return JSON
        return { 
          data: { success: true, message: raw } as T, 
          raw, 
          success: true 
        }
      }
      
      // Command likely failed
      const errorMsg = extractErrorMessage(raw)
      return { 
        data: null as T, 
        raw, 
        success: false, 
        error: errorMsg || `bd command failed: command did not return valid JSON` 
      }
    }
  } catch (error) {
    // Command execution failed
    const errorMsg = error instanceof Error ? error.message : String(error)
    return {
      data: null as T,
      raw: '',
      success: false,
      error: `bd command execution failed: ${errorMsg}`
    }
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
  ]
  
  for (const pattern of patterns) {
    const match = output.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }
  
  // Return the last non-empty line if no pattern matches
  const lines = output.trim().split('\n').filter(line => line.trim())
  return lines.length > 0 ? (lines[lines.length - 1] || '') : ''
}

export function isSuccess<T>(result: BdCommandResult<T>): result is BdCommandResult<T> & { data: Exclude<T, null> } {
  return result.success && result.data !== null
}

export function handleBdError(result: BdCommandResult): never {
  throw new Error(result.error || `bd command failed: ${result.raw.slice(0, 200)}`)
}

export interface BdRawIssue {
  id: string
  title: string
  status: string
  priority: number
  issue_type: string
  description?: string
  owner?: string
  acceptance?: string
  created_at: string
  updated_at: string
  created_by?: string
  blocked_by?: string[]
  blocks?: string[]
  dependency_count?: number
  dependent_count?: number
  closed_at?: string
  close_reason?: string
}

const VALID_ISSUE_STATUSES = ['open', 'in_progress', 'blocked', 'closed'] as const
type ValidIssueStatus = typeof VALID_ISSUE_STATUSES[number]

const VALID_ISSUE_TYPES = ['bug', 'feature', 'task', 'epic', 'chore'] as const
type ValidIssueType = typeof VALID_ISSUE_TYPES[number]

export function transformBdIssue(raw: BdRawIssue | Record<string, unknown>) {
  const typeValue = (raw.issue_type as string) || 'task'
  const type = VALID_ISSUE_TYPES.includes(typeValue as ValidIssueType) 
    ? typeValue as ValidIssueType 
    : 'task'
    
  const statusValue = (raw.status as string) || 'open'
  const status = VALID_ISSUE_STATUSES.includes(statusValue as ValidIssueStatus)
    ? statusValue as ValidIssueStatus
    : 'open'
    
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
  }
}

export function transformBdIssues(raw: unknown[]): Issue[] {
  const issues = Array.isArray(raw) ? raw : []
  return issues.map((item) => transformBdIssue(item as BdRawIssue | Record<string, unknown>))
}

export interface BdRawStats {
  summary?: {
    total_issues?: number
    open_issues?: number
    in_progress_issues?: number
    closed_issues?: number
    blocked_issues?: number
    [key: string]: unknown
  }
  recent_activity?: {
    hours_tracked?: number
    commit_count?: number
    issues_created?: number
    issues_closed?: number
    issues_updated?: number
    issues_reopened?: number
    total_changes?: number
    [key: string]: unknown
  }
  byPriority?: Record<string, number>
}

export function transformBdStats(raw: BdRawStats) {
  const summary = raw.summary || {}
  const byPriority: Record<string, number> = {}
  
  // Extract priority counts from the summary
  if (summary.total_issues !== undefined) {
    byPriority['total'] = summary.total_issues
  }
  if (summary.open_issues !== undefined) {
    byPriority['open'] = summary.open_issues
  }
  if (summary.in_progress_issues !== undefined) {
    byPriority['inProgress'] = summary.in_progress_issues
  }
  if (summary.closed_issues !== undefined) {
    byPriority['closed'] = summary.closed_issues
  }
  if (summary.blocked_issues !== undefined) {
    byPriority['blocked'] = summary.blocked_issues
  }
  
  return {
    total: summary.total_issues || 0,
    open: summary.open_issues || 0,
    inProgress: summary.in_progress_issues || 0,
    closed: summary.closed_issues || 0,
    blocked: summary.blocked_issues || 0,
    byPriority,
  }
}

export function formatOutput<T>(
  data: T,
  raw: string,
  format: "markdown" | "json" | "raw",
  template: (data: T) => string
): string {
  if (format === "json") return JSON.stringify(data, null, 2)
  if (format === "raw") return raw
  return template(data)
}
