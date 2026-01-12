import { tool } from "@opencode-ai/plugin"
import { runBd, formatOutput } from "./utils"
import { updateTemplate } from "./bd-update.tmpl"

export const bd_update = tool({
  description: "Update an issue's status, priority, or assignee",
  args: {
    id: tool.schema.string(),
    status: tool.schema.enum(["open", "in_progress", "blocked", "closed"]).optional(),
    priority: tool.schema.number().optional(),
    assignee: tool.schema.string().optional(),
    format: tool.schema.enum(["markdown", "json", "raw"]).default("markdown"),
  },
  async execute(args) {
    let command = `update ${args.id} --json`
    if (args.status) command += ` --status ${args.status}`
    if (args.priority !== undefined) command += ` --priority ${args.priority}`
    if (args.assignee) command += ` --assignee "${args.assignee}"`
    
    const { data, raw } = await runBd(command)
    return formatOutput(data, raw, args.format, updateTemplate)
  },
})