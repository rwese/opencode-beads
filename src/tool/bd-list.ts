import { tool } from "@opencode-ai/plugin"
import type { ToolDefinition } from "@opencode-ai/plugin"
import { runBd, formatOutput, transformBdIssues, isSuccess, handleBdError } from "./utils"
import { listTemplate } from "./bd-list.tmpl"
import type { ListResponse, Issue } from "./types"

export const bd_list: ToolDefinition = tool({
  description: "List issues by status",
  args: {
    status: tool.schema.enum(["open", "in_progress", "blocked", "closed"]).default("open"),
    format: tool.schema.enum(["markdown", "json", "raw"]).default("markdown"),
  },
  execute: async (args) => {
    const result = await runBd<Issue[]>(["list", "--status", args.status, "--json"])
    
    if (!isSuccess(result)) {
      handleBdError(result)
    }
    
    // Transform the raw data to our expected format
    const issues = transformBdIssues(result.data as unknown[])
    const response: ListResponse = {
      issues,
      count: issues.length,
      status: args.status
    }
    
    return formatOutput(response, result.raw, args.format, listTemplate)
  },
})