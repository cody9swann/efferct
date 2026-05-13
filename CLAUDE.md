# Agent Notes

This repository is a Bun workspace for an Effect-based applicant tracking system prototype.

## Defaults

- Use Bun for package management and script execution.
- Prefer `bun run <script>` for workspace scripts.
- Prefer `bun test` for new tests.
- Keep the main product path focused on `packages/api`, `packages/app`, and `packages/shared`.
- Treat `packages/web` as an older client prototype unless a task explicitly targets it.

## Effect

Before making non-trivial Effect changes, check the local Effect Solutions CLI for relevant guidance:

```sh
effect-solutions list
effect-solutions search <term>
effect-solutions show <slug>
```

The local Effect source is available at `~/.local/share/effect-solutions/effect` when deeper API reference is needed.

## Validation

Use these commands before handing off broad changes:

```sh
bun run typecheck
bun run test
bun run build
```
