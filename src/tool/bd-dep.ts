import { tool } from "@opencode-ai/plugin"
import type { ToolDefinition } from "@opencode-ai/plugin"
import { runBd, formatOutput, isSuccess, handleBdError } from "./utils"
import { depTemplate } from "./bd-dep.tmpl"
import type { DepAddResponse } from "./types"

export const bd_dep: ToolDefinition = tool({
  description: "Add a dependency between issues",
  args: {
    from: tool.schema.string(),
    to: tool.schema.string(),
    type: tool.schema.enum(["blocks", "discovered-from"]).default("blocks"),
    format: tool.schema.enum(["markdown", "json", "raw"]).default("markdown"),
  },
  execute: async (args) => {
    const result = await runBd<DepAddResponse>(`dep add ${args.from} ${args.to} --type ${args.type} --json`)
    
    if (!isSuccess(result)) {
      handleBdError(result)
    }
    
    return formatOutput(result.data, result.raw, args.format, depTemplate)
  },
})