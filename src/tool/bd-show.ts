import { tool } from "@opencode-ai/plugin"
import { runBd, formatOutput } from "./utils"
import { showTemplate } from "./bd-show.tmpl"

export const bd_show = tool({
  description: "Show detailed information about an issue",
  args: {
    id: tool.schema.string(),
    format: tool.schema.enum(["markdown", "json", "raw"]).default("markdown"),
  },
  async execute(args) {
    const { data, raw } = await runBd(`show ${args.id} --json`)
    return formatOutput(data, raw, args.format, showTemplate)
  },
})