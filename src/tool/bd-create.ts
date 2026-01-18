import { tool } from "@opencode-ai/plugin"
import type { ToolDefinition } from "@opencode-ai/plugin"
import { runBd, formatOutput, transformBdIssue, isSuccess, handleBdError } from "./utils"
import { createTemplate } from "./bd-create.tmpl"
import type { CreateResponse } from "./types"

export const bd_create: ToolDefinition = tool({
  description: "Create a new issue with optional acceptance criteria and dependencies",
  args: {
    title: tool.schema.string(),
    type: tool.schema.enum(["bug", "feature", "task", "epic", "chore"]).default("task"),
    priority: tool.schema.number().default(2),
    acceptance: tool.schema.string().optional(),
    description: tool.schema.string().optional(),
    depends_on: tool.schema.array(tool.schema.string()).optional(),
    format: tool.schema.enum(["markdown", "json", "raw"]).default("markdown"),
  },
  execute: async (args) => {
    // Validate depends_on references
    if (args.depends_on && args.depends_on.length > 0) {
      const missingTickets: string[] = []
      
      for (const ticketId of args.depends_on) {
        const result = await runBd(`show ${ticketId} --json`)
        if (!result.success) {
          missingTickets.push(ticketId)
        }
      }
      
      if (missingTickets.length > 0) {
        throw new Error(
          `Cannot create issue: the following referenced tickets do not exist: ${missingTickets.join(", ")}`
        )
      }
    }

    // Build command with all available flags
    let command = `create "${args.title}" -t ${args.type} -p ${args.priority}`
    
    if (args.acceptance) {
      command += ` --acceptance ${JSON.stringify(args.acceptance)}`
    }
    
    if (args.description) {
      command += ` -d ${JSON.stringify(args.description)}`
    }
    
    if (args.depends_on && args.depends_on.length > 0) {
      command += ` --deps ${args.depends_on.join(",")}`
    }
    
    command += " --json"
    
    const result = await runBd(command)
    
    if (!isSuccess(result)) {
      handleBdError(result)
    }
    
    // Handle both array and single object responses
    const rawData = result.data as unknown
    const issueData = Array.isArray(rawData) ? rawData[0] : rawData
    const issue = transformBdIssue(issueData as Parameters<typeof transformBdIssue>[0])
    
    return formatOutput(issue as CreateResponse, result.raw, args.format, createTemplate)
  },
})