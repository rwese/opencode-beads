import { tool } from "@opencode-ai/plugin"
import type { ToolDefinition } from "@opencode-ai/plugin"
import { runBd, formatOutput, transformBdIssues, isSuccess, handleBdError } from "./utils"
import { blockedTemplate } from "./bd-blocked.tmpl"
import type { BlockedResponse, Issue } from "./types"

export const bd_blocked: ToolDefinition = tool({
  description: "Show issues that are blocked by other issues",
  args: {
    format: tool.schema.enum(["markdown", "json", "raw"]).default("markdown"),
  },
  execute: async (args) => {
    const result = await runBd<Issue[]>(["blocked", "--json"])
    
    if (!isSuccess(result)) {
      handleBdError(result)
    }
    
    const issues = transformBdIssues(result.data as unknown[])
    const response: BlockedResponse = {
      issues,
      count: issues.length
    }
    
    return formatOutput(response, result.raw, args.format, blockedTemplate)
  },
})