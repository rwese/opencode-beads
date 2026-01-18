import { tool } from "@opencode-ai/plugin"
import type { ToolDefinition } from "@opencode-ai/plugin"
import { runBd, formatOutput, transformBdIssues, isSuccess, handleBdError } from "./utils"
import { readyTemplate } from "./bd-ready.tmpl"
import type { ReadyResponse, Issue } from "./types"

export const bd_ready: ToolDefinition = tool({
  description: "Find ready-to-work tasks with no blockers",
  args: {
    format: tool.schema.enum(["markdown", "json", "raw"]).default("markdown"),
  },
  execute: async (args) => {
    const result = await runBd<Issue[]>("ready --json")
    
    if (!isSuccess(result)) {
      handleBdError(result)
    }
    
    const issues = transformBdIssues(result.data as unknown[])
    const response: ReadyResponse = {
      issues,
      count: issues.length
    }
    
    return formatOutput(response, result.raw, args.format, readyTemplate)
  },
})