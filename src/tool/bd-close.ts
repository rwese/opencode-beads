import { tool } from "@opencode-ai/plugin"
import { runBd, formatOutput } from "./utils"
import { closeTemplate } from "./bd-close.tmpl"

export const bd_close = tool({
  description: "Close an issue with a reason",
  args: {
    id: tool.schema.string(),
    reason: tool.schema.string().default("Completed"),
    format: tool.schema.enum(["markdown", "json", "raw"]).default("markdown"),
  },
  async execute(args) {
    const { data, raw } = await runBd(`close ${args.id} --reason "${args.reason}" --json`)
    return formatOutput(data, raw, args.format, closeTemplate)
  },
})