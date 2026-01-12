import { tool } from "@opencode-ai/plugin"
import { runBd, formatOutput } from "./utils"
import { listTemplate } from "./bd-list.tmpl"

export const bd_list = tool({
  description: "List issues by status",
  args: {
    status: tool.schema.enum(["open", "in_progress", "blocked", "closed"]).default("open"),
    format: tool.schema.enum(["markdown", "json", "raw"]).default("markdown"),
  },
  async execute(args) {
    const { data, raw } = await runBd(`list --status ${args.status} --json`)
    return formatOutput(data, raw, args.format, listTemplate)
  },
})