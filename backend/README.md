# Backend

A Hono-based backend service with authentication, real-time sync, and database management.

## Tech Stack

- **Runtime**: Node >= 22
- **Framework**: Hono JS
- **Package Manager**: pnpm
- **Sync Engine**: [Zero](https://zero.rocicorp.dev/docs/introduction)
- **Authentication**: [better-auth](https://www.better-auth.com/)
- **Sync Engine**: [Zero](https://zero.rocicorp.dev/docs/introduction)
- **Email**: [Resend](https://resend.com/)
- **Storage**: Any S3 compatible storage
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL (Docker)

## Getting Started

### Installation

```bash
pnpm install
```

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Database
DB_USER=jonsnow
DB_PASSWORD=idontwannit
DB_NAME=kanbased_uat
DB_PORT=5432
# postgresql://DB_USER:DB_PASSWORD@localhost:DB_PORT/DB_NAME
DATABASE_URL=postgresql://jonsnow:idontwannit@localhost:5432/kanbased_uat

# Server
NODE_ENV=development
FE_ORIGIN=http://localhost:3000
BE_ORIGIN=http://localhost:8000
BE_PORT=8000

# Auth
BETTER_AUTH_SECRET=# crypto secure random string `openssl rand -hex 32`
BETTER_AUTH_URL=http://localhost:8000
GOOGLE_CLIENT_ID=# get it from google console
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=# get it from github developer settings
GITHUB_CLIENT_SECRET=

# Email
RESEND_API_KEY= # sign up to Resend and get the API key

# Storage
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=
S3_REGION=
S3_ENDPOINT=
PUBLIC_IMAGE_DOMAIN=# eg: https://images.kanbased.com

# Zero Cache
# Your Postgres database URL
ZERO_UPSTREAM_DB=postgresql://jonsnow:idontwannit@localhost:5432/kanbased_uat
ZERO_REPLICA_FILE="/tmp/hello_zero_replica.db"
# Note: Port should match your backend port
ZERO_AUTH_JWKS_URL=http://localhost:8000/api/auth/jwks
```

### Development

```bash
# Start PostgreSQL database
pnpm dev:db:start

# Run database migrations
pnpm db:migrate

# Start backend server
pnpm dev

# Start zero cache (in separate terminal)
pnpm dev:zero-cache
```

Backend will be available at `http://localhost:8000`

## Deployment

This guide is only to deploy the backend server and zero cache on a VPS. I'd recommend going with [Coolify](https://coolify.io) if you are deploying on a VPS / Self hosting (same thing)

### Deploy Hono server

```bash
# Load all the environment variables
# Start Hono server
pnpm start
```

### Deploy Zero sync in a Docker container

This guide shows how to deploy the Zero sync engine service on a docker container. For more options read the [Zero docs](https://zero.rocicorp.dev/docs/deployment)

Here is a minimal Docker Compose file to deploy the Zero cache on a VPS

```yaml
services:
  zero_cache:
    image: "rocicorp/zero:0.21.2025062401"
    healthcheck:
      test:
        - CMD
        - curl
        - "-f"
        - "http://localhost:4848"
      interval: 30s
      timeout: 10s
      retries: 3
    environment:
      - "ZERO_UPSTREAM_DB=${ZERO_UPSTREAM_DB}"
      - "ZERO_CVR_DB=${ZERO_CVR_DB}"
      - "ZERO_CHANGE_DB=${ZERO_CHANGE_DB}"
      - "ZERO_AUTH_JWKS_URL=${ZERO_AUTH_JWKS_URL}"
      - "ZERO_UPSTREAM_MAX_CONNS=${ZERO_UPSTREAM_MAX_CONNS}"
      - "ZERO_CVR_MAX_CONNS=${ZERO_CVR_MAX_CONNS}"
      - "ZERO_CHANGE_MAX_CONNS=${ZERO_CHANGE_MAX_CONNS}"
      - ZERO_REPLICA_FILE=/zero_data/zchat_replica.db
      - ZERO_PORT=4848
    volumes:
      - "replica:/zero_data"
volumes:
  replica: null
```

Environment variables

```bash
# your Auth server's JWKS URL, eg: http:localhost:8000/api/auth/jwks
ZERO_AUTH_JWKS_URL=

# Can be your upstream database URL or a seperate DB, eg: postgresql://jonsnow:idontwannit@localhost:5432/kanbased_uat
ZERO_CHANGE_DB=

ZERO_CHANGE_MAX_CONNS=1

# Can be your upstream database URL or a seperate DB
ZERO_CVR_DB=

ZERO_CVR_MAX_CONNS=20

# Your upstream database URL
ZERO_UPSTREAM_DB=

ZERO_UPSTREAM_MAX_CONNS=4
```
