export interface Issue {
  id: string
  title: string
  type: "bug" | "feature" | "task" | "epic" | "chore"
  priority: number
  status: "open" | "in_progress" | "blocked" | "closed"
  description?: string
  assignee?: string
  acceptance?: string
  blockedBy?: string[]
  blocks?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface ReadyResponse {
  issues: Issue[]
  count: number
}

export interface CreateResponse extends Issue {}

export interface UpdateResponse extends Issue {
  previousStatus?: string
}

export interface CloseResponse extends Issue {
  closedReason?: string
  closedAt?: string
}

export interface ShowResponse extends Issue {
  blockedBy?: string[]
  blocks?: string[]
  dependencies?: unknown[]
  labels?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface ListResponse {
  issues: Issue[]
  count: number
  status: string
}

export interface BlockedResponse {
  issues: Issue[]
  count: number
}

export interface StatsResponse {
  total: number
  open: number
  inProgress: number
  closed: number
  blocked: number
  byPriority: Record<string, number>
}

export interface DepAddResponse {
  from: string
  to: string
  type: string
  timestamp: string
}

export interface SyncResponse {
  status: string
  message: string
  changes?: number
}