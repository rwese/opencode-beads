# Agent Guidelines

## Commands
- **Typecheck**: `bun run typecheck`
- **Install deps**: `bun install`
- No tests configured

## Code Style
- TypeScript strict mode with ESM modules
- Use `import type` for type-only imports (verbatimModuleSyntax)
- Node.js imports use `node:` prefix (e.g., `node:fs/promises`)
- Handle undefined from indexed access (noUncheckedIndexedAccess enabled)
- camelCase for functions/variables, PascalCase for types/interfaces
- JSDoc comments for function documentation
- Async/await for async operations

## Project Structure
- `src/plugin.ts` - Main plugin entry point
- `src/vendor.ts` - Vendor file loaders
- `vendor/` - Synced content from upstream beads repo (commands, agents)

## Notes
- This is an OpenCode plugin integrating the beads issue tracker
- Vendor files are synced via `scripts/sync-beads.sh` - don't edit directly
