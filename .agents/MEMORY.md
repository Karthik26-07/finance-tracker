# FinTrack Memory Management

This project uses a modular documentation approach to conserve AI token context. 
Do not ingest all documentation files in every session.

## Rules for AI Context Management

1. **Start Here**: Always read `docs/modules/00-module-overview.md` first to understand the current project state and progress.
2. **On-Demand Context**: Only read the specific module plan (`docs/modules/XX-mX-name.md`) that is relevant to the active task. Do not read other module plans to avoid token spills.
3. **Database Context**: Refer to `docs/02-database-schema.md` only when modifying or writing new database queries.
4. **Updating Memory**: If you create a new feature or complete a module, update the `docs/modules/00-module-overview.md` to reflect the new state. If an entirely new module is created, generate a corresponding `docs/modules/XX-new-feature.md` plan and link it in the overview.

## Current Architecture
- **Technology Stack**: Next.js 15.5, React 19, Drizzle ORM, Supabase, Tailwind CSS v4.
- **Reference Docs**: For any Next.js 15 App Router API or feature doubts, refer strictly to the `.next-docs/` local directory rather than hallucinating outdated versions.
- **Design System**: Defined in `docs/04-ui-design-plan.md`

Maintain this token-efficient workflow strictly.
