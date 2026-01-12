import { tool } from "@opencode-ai/plugin"
import { runBd, formatOutput } from "./utils"
import { createTemplate } from "./bd-create.tmpl"

export const bd_create = tool({
  description: "Create a new issue",
  args: {
    title: tool.schema.string(),
    type: tool.schema.enum(["bug", "feature", "task", "epic", "chore"]).default("task"),
    priority: tool.schema.number().default(2),
    format: tool.schema.enum(["markdown", "json", "raw"]).default("markdown"),
  },
  async execute(args) {
    const { data, raw } = await runBd(`create "${args.title}" -t ${args.type} -p ${args.priority} --json`)
    return formatOutput(data, raw, args.format, createTemplate)
  },
})