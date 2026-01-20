import { tool } from "@opencode-ai/plugin"
import type { ToolDefinition } from "@opencode-ai/plugin"
import { runBd, formatOutput, transformBdIssue, isSuccess, handleBdError } from "./utils"
import { claimTemplate } from "./bd-claim.tmpl"
import type { UpdateResponse } from "./types"

/**
 * Claim an issue for the current user.
 * Uses the --claim flag which atomically assigns the issue to the current user
 * and sets status to in_progress.
 */
export const bd_claim: ToolDefinition = tool({
  description: "Claim an issue for yourself (assigns to current user, sets in_progress)",
  args: {
    id: tool.schema.string(),
    format: tool.schema.enum(["markdown", "json", "raw"]).default("markdown"),
  },
  execute: async (args) => {
    // Build claim command arguments as array
    const commandArgs = ['update', args.id, '--claim', '--json']
    
    const result = await runBd(commandArgs)
    
    if (!isSuccess(result)) {
      handleBdError(result)
    }
    
    // Handle both array and single object responses
    const rawData = result.data as unknown
    const issueData = Array.isArray(rawData) ? rawData[0] : rawData
    const issue = transformBdIssue(issueData as Parameters<typeof transformBdIssue>[0])
    
    return formatOutput(issue as UpdateResponse, result.raw, args.format, claimTemplate)
  },
})
