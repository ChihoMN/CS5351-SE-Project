# Frontend

React SPA built with TanStack Router and Zero sync engine.

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Create `.env` with following variables:

```bash
# Your backend base url
CLIENT_MY_API_BASE_URL=http://localhost:8000

# Your Zero cache server base url
CLIENT_PUBLIC_SERVER=http://localhost:4848
```

3. Start development server:

```bash
pnpm dev
```

## Scripts

- `pnpm dev` - Starts dev server
- `pnpm build` - Builds for production
- `pnpm lint` - Runs eslint
- `pnpm format` - Format code
- `pnpm fixall` - Formats and fixes possible eslint errors.
