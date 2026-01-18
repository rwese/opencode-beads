import { tool } from "@opencode-ai/plugin"
import type { ToolDefinition } from "@opencode-ai/plugin"
import { runBd, formatOutput, transformBdStats, isSuccess, handleBdError } from "./utils"
import { statsTemplate } from "./bd-stats.tmpl"
import type { StatsResponse } from "./types"

export const bd_stats: ToolDefinition = tool({
  description: "Show project statistics",
  args: {
    format: tool.schema.enum(["markdown", "json", "raw"]).default("markdown"),
  },
  execute: async (args) => {
    const result = await runBd<StatsResponse>(["stats", "--json"])
    
    if (!isSuccess(result)) {
      handleBdError(result)
    }
    
    const stats = transformBdStats(result.data as unknown as Parameters<typeof transformBdStats>[0])
    
    return formatOutput(stats, result.raw, args.format, statsTemplate)
  },
})