import { tool } from "@opencode-ai/plugin"
import { runBd, formatOutput } from "./utils"
import { statsTemplate } from "./bd-stats.tmpl"

export const bd_stats = tool({
  description: "Show project statistics",
  args: {
    format: tool.schema.enum(["markdown", "json", "raw"]).default("markdown"),
  },
  async execute(args) {
    const { data, raw } = await runBd("stats --json")
    return formatOutput(data, raw, args.format, statsTemplate)
  },
})