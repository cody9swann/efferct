# Effect ATS

An applicant tracking system prototype built to explore Effect-first TypeScript application architecture. The project combines a typed HTTP API, shared domain schemas, service/repository boundaries, mock data layers, and a modern recruiting dashboard UI.

This is intentionally a product-shaped codebase rather than a small demo: jobs, candidates, applications, interviews, scorecards, notes, activity, and organizations are modeled across the API and client.

## Highlights

- Effect-powered API built with `@effect/platform` and `@effect/platform-bun`
- Shared domain model using `effect/Schema`
- Layered service and repository design with injectable dependencies
- OpenAPI and Swagger documentation exposed by the API
- Next.js recruiting dashboard with shadcn-style components
- Pipeline UI for moving candidates through job stages
- Bun workspace managed as a small monorepo
- Bun-native service tests for Effect layers

## Tech Stack

- Runtime and package manager: Bun
- API: Effect, `@effect/platform`, `@effect/platform-bun`
- Frontend: Next.js, React, Tailwind CSS, Radix UI, lucide-react
- State/data effects: `@effect-atom/atom-react`
- Tooling: TypeScript, Turborepo

## Repository Layout

```text
packages/
  api/      Effect HTTP API, handlers, services, repositories, mock layers
  app/      Main Next.js application UI
  shared/   Shared schemas, branded IDs, domain types, test helpers
  web/      Earlier TanStack Router prototype retained for reference
```

## Getting Started

Install dependencies:

```sh
bun install
```

Run the API:

```sh
bun run --filter @ats/api dev
```

Run the main web app in another terminal:

```sh
bun run --filter @ats/app dev
```

The app runs on [http://localhost:3002](http://localhost:3002), and the API runs on [http://localhost:3001](http://localhost:3001).

API documentation is available at [http://localhost:3001/docs](http://localhost:3001/docs) while the API server is running.

## Validation

```sh
bun run typecheck
bun run test
bun run build
```

## Notes

The API currently uses in-memory mock layers so the full stack can run without provisioning a database. That keeps the repository easy to clone and inspect while still exercising the same service boundaries that a persistent implementation would use.

The main application is `packages/app`. `packages/web` is an earlier prototype kept in the repository to show the evolution of the client experiments.
