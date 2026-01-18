import { tool } from "@opencode-ai/plugin"
import type { ToolDefinition } from "@opencode-ai/plugin"
import { runBd, formatOutput, transformBdIssue, isSuccess, handleBdError } from "./utils"
import { showTemplate } from "./bd-show.tmpl"
import type { ShowResponse, Issue } from "./types"

export const bd_show: ToolDefinition = tool({
  description: "Show detailed information about an issue",
  args: {
    id: tool.schema.string().describe("The issue ID to retrieve"),
    format: tool.schema.enum(["markdown", "json", "raw"]).default("markdown"),
  },
  execute: async (args) => {
    // Validate ticket ID format
    if (!args.id || args.id.trim().length === 0) {
      throw new Error("Invalid ticket ID: ID cannot be empty")
    }
    
    // Sanitize the ticket ID to prevent command injection
    const sanitizedId = args.id.replace(/[;&|`$(){}[\]\\]/g, '')
    
    const result = await runBd<Issue[]>(['show', sanitizedId, '--json'])
    
    if (!isSuccess(result)) {
      handleBdError(result)
    }
    
    // Handle array response
    const rawData = result.data as Issue[]
    const issueData = Array.isArray(rawData) ? rawData[0] : rawData
    
    // Check if issue was found
    if (!issueData || !issueData.id) {
      throw new Error(`Issue not found: ${args.id}. The issue may have been deleted or the ID is incorrect.`)
    }
    
    const issue = transformBdIssue(issueData as unknown as Parameters<typeof transformBdIssue>[0])
    
    return formatOutput(issue as ShowResponse, result.raw, args.format, showTemplate)
  },
})