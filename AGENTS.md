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

## Working with bd Database

### Key Learnings

**Trust the daemon**: The bd daemon manages database connections automatically. Most commands work without manually
specifying database paths.

**Simplest approach wins**: Running `bd stats --json` or `bd list --json` directly works perfectly. Complex database
path extraction logic is usually unnecessary.

**bd info output structure**: When parsing `bd info --json`, the database path is in `database_path`, not `database`,
`path`, or `db`.

### Common Pitfalls

**Over-engineering database access**: Don't add `--db <path>` or `--no-daemon` flags unless there's a specific need.
This forces manual database handling when the daemon would handle it automatically.

**Assuming manual path extraction is needed**: The bd daemon already knows the database location. Commands run through
the daemon don't need explicit database paths.

**Complex getDatabasePath() logic**: If you find yourself parsing `bd info --json` output to extract database paths,
consider whether you actually need to. In daemon mode, you probably don't.

### Robust Working Practices

1. **Test bd commands in terminal first**: Before writing code, run `bd stats --json` or `bd list --json` directly to
   verify commands work without database path arguments.

2. **Use daemon mode by default**: The default daemon mode handles database connections automatically. Only use
   `--no-daemon` if you specifically need non-daemon behavior.

3. **Minimal command arguments**: Start with the simplest command structure (just the command and arguments). Add `--db`
   or `--no-daemon` only if testing shows it's necessary.

4. **Check daemon status**: Run `bd info` to verify the daemon is running and healthy before debugging command execution
   issues.

5. **Let the daemon manage connections**: In daemon mode, bd handles connection pooling, caching, and database access
   transparently. Don't reimplement this logic.

### When You DO Need Database Paths

Manual database path handling may be necessary when:

- Running in non-daemon mode (`--no-daemon`)
- Need to access a different database than the default
- Building tools that must work without the daemon running
- Implementing database migration or repair utilities

For these cases, extract the path from `bd info --json` using the correct key:

```typescript
const info = JSON.parse(rawOutput);
const dbPath = info.database_path; // NOT info.database or info.path
```
