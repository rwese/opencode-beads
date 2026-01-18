import { tool } from "@opencode-ai/plugin"
import type { ToolDefinition } from "@opencode-ai/plugin"
import { runBd, formatOutput, transformBdIssue, isSuccess, handleBdError } from "./utils"
import { showTemplate } from "./bd-show.tmpl"
import type { ShowResponse, Issue } from "./types"

export const bd_show: ToolDefinition = tool({
  description: "Show detailed information about an issue",
  args: {
    id: tool.schema.string(),
    format: tool.schema.enum(["markdown", "json", "raw"]).default("markdown"),
  },
  execute: async (args) => {
    const result = await runBd<Issue[]>(`show ${args.id} --json`)
    
    if (!isSuccess(result)) {
      handleBdError(result)
    }
    
    // Handle array response
    const rawData = result.data as Issue[]
    const issueData = Array.isArray(rawData) ? rawData[0] : rawData
    const issue = transformBdIssue(issueData as unknown as Parameters<typeof transformBdIssue>[0])
    
    return formatOutput(issue as ShowResponse, result.raw, args.format, showTemplate)
  },
})