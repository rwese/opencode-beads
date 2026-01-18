# Agent Guidelines

## Project

OpenCode plugin providing bd\_\* tools for beads issue tracker integration.

## Commands

- **Typecheck**: `bun run typecheck`
- **Build**: `bun run build`
- **Install deps**: `bun install`

## Code Style

- TypeScript strict mode with ESM modules
- `import type` for type-only imports
- `node:` prefix for Node.js imports
- Handle undefined from indexed access
- camelCase functions/variables, PascalCase types/interfaces
- JSDoc comments for function documentation
- Async/await for async operations

## Project Structure

```
src/
├── plugin.ts          # Main plugin entry point
└── tool/
    ├── index.ts       # Tool exports
    ├── types.ts       # TypeScript interfaces
    ├── utils.ts       # Shared utilities
    ├── bd-*.ts        # 10 tool implementations
    └── bd-*.tmpl.ts   # 10 output templates
```

## bd\_\* Tools

All tools are fully functional and use absolute path `/Users/wese/.local/bin/bd`:

- **bd_create** - Create issues with title, type, priority, acceptance, deps
- **bd_list** - List issues by status
- **bd_show** - Show issue details
- **bd_update** - Update status, priority, assignee
- **bd_close** - Close with reason
- **bd_ready** - Find unblocked tasks
- **bd_stats** - Project statistics
- **bd_blocked** - Show blocked issues
- **bd_dep** - Add dependencies
- **bd_sync** - Sync with git

## TypeScript Types

```typescript
Issue {
  id, title, type, priority, status,
  description?, assignee?, acceptance?,
  blockedBy?, blocks?, createdAt?, updatedAt?
}
```

Response types: ReadyResponse, ListResponse, ShowResponse, UpdateResponse, CloseResponse, StatsResponse, DepAddResponse,
SyncResponse.

## Version Bump

Update package.json version, CHANGELOG.md, and README.md version reference. Commit with `:bookmark: bump version X.Y.Z`.

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
