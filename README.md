# opencode-beads

[Beads](https://github.com/steveyegge/beads) issue tracker integration for [OpenCode](https://opencode.ai).

## Goals

Provide robust, type-safe bd\_\* tools for OpenCode agents to interact with beads issue tracker.

## Structure

- `src/plugin.ts` - Plugin entry point, handles beads initialization and tool registration
- `src/tool/` - 10 bd\_\* tools with templates for output formatting
  - `index.ts` - Tool exports
  - `types.ts` - TypeScript interfaces for issues and responses
  - `utils.ts` - Shared bd command execution and data transformation
  - `bd-*.ts` - Tool implementations
  - `bd-*.tmpl.ts` - Output templates

## Tools

All tools support `markdown`, `json`, and `raw` output formats:

| Tool         | Description                                                |
| ------------ | ---------------------------------------------------------- |
| `bd_create`  | Create issues with title, type, priority, acceptance, deps |
| `bd_list`    | List issues by status                                      |
| `bd_show`    | Show detailed issue information                            |
| `bd_update`  | Update status, priority, assignee                          |
| `bd_close`   | Close with reason                                          |
| `bd_ready`   | Find unblocked tasks                                       |
| `bd_stats`   | Project statistics                                         |
| `bd_blocked` | Show blocked issues                                        |
| `bd_dep`     | Add dependencies                                           |
| `bd_sync`    | Sync with git                                              |

## Installation

```bash
# Install beads CLI first
curl -fsSL https://raw.githubusercontent.com/steveyegge/beads/main/scripts/install.sh | bash

# Add to OpenCode config
echo '{"plugin": ["opencode-beads"]}' >> ~/.config/opencode/opencode.json
```

## License

MIT
