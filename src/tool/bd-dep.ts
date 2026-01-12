import { tool } from "@opencode-ai/plugin"
import { runBd, formatOutput } from "./utils"
import { depTemplate } from "./bd-dep.tmpl"

export const bd_dep = tool({
  description: "Add a dependency between issues",
  args: {
    from: tool.schema.string(),
    to: tool.schema.string(),
    type: tool.schema.enum(["blocks", "discovered-from"]).default("blocks"),
    format: tool.schema.enum(["markdown", "json", "raw"]).default("markdown"),
  },
  async execute(args) {
    const { data, raw } = await runBd(`dep add ${args.from} ${args.to} --type ${args.type} --json`)
    return formatOutput(data, raw, args.format, depTemplate)
  },
})