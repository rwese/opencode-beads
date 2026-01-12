import { tool } from "@opencode-ai/plugin"
import { runBd, formatOutput } from "./utils"
import { readyTemplate } from "./bd-ready.tmpl"

export const bd_ready = tool({
  description: "Find ready-to-work tasks with no blockers",
  args: {
    format: tool.schema.enum(["markdown", "json", "raw"]).default("markdown"),
  },
  async execute(args) {
    const { data, raw } = await runBd("ready --json")
    return formatOutput(data, raw, args.format, readyTemplate)
  },
})