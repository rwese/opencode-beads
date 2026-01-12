import { tool } from "@opencode-ai/plugin"
import { runBd, formatOutput } from "./utils"
import { syncTemplate } from "./bd-sync.tmpl"

export const bd_sync = tool({
  description: "Sync beads with git remote",
  args: {
    format: tool.schema.enum(["markdown", "json", "raw"]).default("markdown"),
  },
  async execute(args) {
    const { data, raw } = await runBd("sync --json")
    return formatOutput(data, raw, args.format, syncTemplate)
  },
})