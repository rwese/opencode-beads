import { tool } from "@opencode-ai/plugin"
import { runBd, formatOutput } from "./utils"
import { blockedTemplate } from "./bd-blocked.tmpl"

export const bd_blocked = tool({
  description: "Show issues that are blocked by other issues",
  args: {
    format: tool.schema.enum(["markdown", "json", "raw"]).default("markdown"),
  },
  async execute(args) {
    const { data, raw } = await runBd("blocked --json")
    return formatOutput(data, raw, args.format, blockedTemplate)
  },
})