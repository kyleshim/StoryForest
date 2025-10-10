# StoryForest

StoryForest is a full-stack reading management app that helps caregivers curate personal "reading gardens" for each child. Parents can add young readers, track the books they already own, build wishlists, and browse age-appropriate recommendations while sharing public libraries with the wider community.【F:client/src/pages/home-page.tsx†L48-L135】【F:client/src/pages/library-page.tsx†L54-L200】【F:client/src/pages/explore-page.tsx†L22-L200】

## Features

- **Child-centric dashboard.** Add multiple children and get a quick view of their personalized reading gardens with welcoming UI details and growth tips.【F:client/src/pages/home-page.tsx†L48-L135】
- **Library and wishlist management.** Move books between a child's library and wishlist, rate completed reads, and filter or sort the collection without leaving the page.【F:client/src/pages/library-page.tsx†L73-L200】
- **Age-aware recommendations.** Pull curated suggestions from the Google Books API that tailor search terms to each reader's age band and allow one-click adds to the library or wishlist.【F:client/src/components/recommendations.tsx†L13-L129】【F:client/src/lib/book-api.ts†L95-L118】
- **Community discovery.** Explore public libraries from other families or search for users to spark inspiration for new reads.【F:client/src/pages/explore-page.tsx†L22-L200】

## Architecture

StoryForest ships as a TypeScript monorepo with three main workspaces:

- `client/` – A React 18 + Vite SPA styled with Tailwind CSS, powered by Clerk for authentication and TanStack Query for data fetching.【F:client/src/main.tsx†L1-L20】【F:package.json†L6-L109】
- `server/` – An Express API that handles authentication, book discovery proxies, and CRUD endpoints, bundling the client in production via Vite middleware.【F:server/index.ts†L1-L74】【F:server/routes.ts†L14-L200】
- `shared/` – A Drizzle ORM schema shared between the server and any tooling, covering children, books, libraries, wishlists, sessions, and user preferences stored in Postgres.【F:shared/schema.ts†L5-L137】

Key integrations include Clerk for identity, Neon/Postgres accessed through Drizzle ORM, and Google Books for discovery. NPM scripts coordinate local development, production builds, and schema pushes.【F:package.json†L6-L12】【F:server/db.ts†L1-L15】【F:server/routes.ts†L14-L177】

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   - `DATABASE_URL` – Postgres connection string used by Drizzle and the session store.【F:server/db.ts†L1-L15】【F:server/replitAuth.ts†L32-L45】
   - `SESSION_SECRET` – Secret for signing Express sessions.【F:server/auth.ts†L19-L27】【F:server/replitAuth.ts†L15-L53】
   - `VITE_CLERK_PUBLISHABLE_KEY` – Clerk publishable key required by the frontend at boot.【F:client/src/main.tsx†L9-L20】
   - `CLERK_SECRET_KEY` – Clerk backend key so the API can look up users via the Clerk SDK.【F:server/auth.ts†L1-L74】
   - (Optional) Google Books API is accessed anonymously, but you can supply `GOOGLE_API_KEY` and append it in the routes if you hit rate limits.

3. **Run the dev server**
   ```bash
   npm run dev
   ```
   This starts the Express API and Vite dev server together on port 5000.【F:server/index.ts†L54-L74】

4. **Apply schema changes** (if you modify the database)
   ```bash
   npm run db:push
   ```
   The script syncs the Drizzle schema to your Postgres instance.【F:package.json†L6-L12】【F:shared/schema.ts†L5-L137】

### Loading demo content for previews or screenshots

Because StoryForest relies on Clerk-authenticated users and a Postgres database, the UI renders empty states until you've created a reader and attached books. Use the seeding helper below to stand up a demo library and wishlist that match the redesigned cards:

1. **Provision your environment variables** – create a `.env` file in the project root (or export variables in your shell) with at least:
   ```bash
   DATABASE_URL="postgres://..."   # Local or hosted Postgres connection string
   SESSION_SECRET="replace-me"     # Any random string for dev cookies
   VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."
   CLERK_SECRET_KEY="sk_test_..."
   ```
   Clerk dev keys are available from your dashboard. When using a `.env` file, Vite will automatically load the `VITE_` prefixed values for the client.【F:client/src/main.tsx†L9-L20】

2. **Create a Clerk test user** – from the Clerk dashboard or via `clerk dev`, add a user account you can sign in with locally. Copy its `id` value (it looks like `user_2abc...`).

3. **Push the schema** – make sure your database has the latest tables:
   ```bash
   npm run db:push
   ```

4. **Seed sample data** – export the Clerk user id so the records are associated with your account, then run the TypeScript seeder:
   ```bash
   export SEED_CLERK_ID="user_2abc123"
   npx tsx server/scripts/seed-sample-data.ts
   ```
   The script inserts two demo readers (Hazel and Theo) with a handful of books split between the library and wishlist so the redesigned tiles appear populated.【F:server/scripts/seed-sample-data.ts†L1-L173】

5. **Launch the app and sign in** – start the dev server with `npm run dev`, open `http://localhost:5000`, and authenticate with the same Clerk user. The library and wishlist pages will now render the seeded content, letting you capture screenshots of the new layouts.【F:server/index.ts†L54-L74】【F:client/src/pages/library-page.tsx†L54-L200】【F:client/src/pages/wishlist-page.tsx†L42-L185】

## Project Structure

```
StoryForest/
├── client/        # React application (routes, components, hooks)
├── server/        # Express API, auth, storage, and route handlers
├── shared/        # Drizzle ORM schema & shared types
├── components.json# Tailwind/shadcn component registry
├── package.json   # Scripts, dependencies, and workspace metadata
└── tsconfig.json  # Shared TypeScript configuration
```

## Roadmap Ideas

- **Richer reading analytics.** The current stats card only surfaces counts of library and wishlist items; expanding it with streaks, reading time, or milestone tracking would provide more meaningful insights.【F:client/src/components/reading-stats.tsx†L8-L27】
- **Smarter recommendations.** Recommendations presently rely on age-bracketed keyword searches before forwarding to Google Books; incorporating reading history, ratings, or external curation lists would personalize suggestions further.【F:client/src/lib/book-api.ts†L95-L118】
- **Social discovery upgrades.** The explore view already surfaces public libraries and a user search, but richer profiles, follow mechanics, or collaborative shelves could deepen the community experience.【F:client/src/pages/explore-page.tsx†L22-L200】

---

Whether you're cultivating a budding bookworm or exploring new stories as a family, StoryForest lays the groundwork for delightful, organized reading adventures.
