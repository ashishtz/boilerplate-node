# Boilerplate Node

A production-grade Express.js + TypeScript boilerplate using MySQL through [Knex](https://knexjs.org/) and the [Objection.js](https://vincit.github.io/objection.js/) ORM.

## Features

- **Express 5 + TypeScript (strict)** — async errors are forwarded to the central error handler automatically; services just `throw`.
- **Validated, typed configuration** — every environment variable is validated with Joi at boot; production fails fast when secrets are missing.
- **Security by default** — [helmet](https://helmetjs.github.io/) headers, CORS allow-list, global + auth-specific rate limits, RS256 JWTs with algorithm pinning, bcrypt password hashing, no stack traces or internals in production responses.
- **Structured logging** — [pino](https://getpino.io/) JSON logs in production, pretty logs in development, optional per-query SQL logging with durations.
- **Consistent response envelope** — `res.withData` / `res.withError` / `res.withValidation` on every response, with i18n-ready message codes.
- **XACML access control** — declarative request validation, data pre-fetching and authorization checks that keep services free of boilerplate (see below).
- **Operations ready** — liveness/readiness endpoints, graceful shutdown, multi-stage non-root Dockerfile, GitHub Actions CI, Dependabot.
- **Tested** — unit and in-process integration tests with Vitest + Supertest.

## Requirements

- Node.js 20+ (see `.nvmrc`)
- MySQL 8+

## Setup

```shell
cp .env.example .env        # then adjust the values
npm install
npm run generate:keys       # RSA key pair used to sign auth tokens
npm run migrate             # create the database schema
npm run dev                 # start with hot reload
```

For production:

```shell
npm run build
npm start
```

Or with Docker:

```shell
docker build -t my-api .
docker run --env-file .env -p 4200:4200 my-api
```

> Keys live in `keys/` (git-ignored). Regenerating them (`--force`) invalidates every token already issued.

## Scripts

| Script                         | Purpose                                            |
| ------------------------------ | -------------------------------------------------- |
| `npm run dev`                  | Start with hot reload (tsx watch)                  |
| `npm run build`                | Compile TypeScript to `dist/`                      |
| `npm start`                    | Run the compiled app                               |
| `npm test` / `test:watch`      | Run the Vitest suite                               |
| `npm run lint` / `lint:fix`    | ESLint (flat config)                               |
| `npm run format`               | Prettier over the whole repo                       |
| `npm run typecheck`            | `tsc --noEmit`                                     |
| `npm run generate:keys`        | Generate the RSA key pair (`--force` to overwrite) |
| `npm run new-migration`        | Scaffold a migration from `templates/migration.js` |
| `npm run migrate` / `rollback` | Apply / revert migrations                          |

## Project structure

```
src/
├── app.ts               # Express app factory (testable, no port binding)
├── index.ts             # Bootstrap: listen + graceful shutdown
├── config/              # Joi-validated env → typed appConfig/dbConfig/authConfig
├── constants/           # Single source of truth for roles & user statuses
├── database/            # Knex instance, Objection binding, query logging
├── errors/              # ApiError (HTTP status + i18n code)
├── i18n/                # Message catalog + transform()
├── middlewares/
│   ├── authenticate.ts  # Attaches req.user from a Bearer token
│   ├── authorize.ts     # Role guard: authorize("admin")
│   ├── errorHandler.ts  # Central error handler + 404 handler
│   ├── response.ts      # withData / withError / withValidation helpers
│   └── xacml/           # Declarative access control (see below)
├── models/              # BaseModel + User (password never serialized)
├── providers/           # logger (pino), jwt (RS256 sign/verify)
├── routes/              # Routers + per-route validations/access controls
├── services/            # Business logic; throw ApiError, respond via envelope
├── tokens/              # bcrypt password hashing, single-purpose HMAC tokens
├── types/               # Express type augmentation
└── utils/               # Shared helpers (Joi validate)
tests/                   # Vitest unit + Supertest integration tests
scripts/                 # generate-keys.ts
migrations/              # Knex migrations (see templates/migration.js)
```

## Response envelope

Every endpoint answers with the same shape:

```jsonc
// success
{ "data": { ... }, "message": "Success.", "status": 200 }

// error
{ "message": "Invalid credentials provided. Please try again.", "status": 401 }

// validation error (422) - one entry per failed field
{ "data": [{ "email": "\"email\" must be a valid email" }], "message": "The request contains invalid data.", "status": 422 }
```

Messages are i18n codes translated by `src/i18n`. Unknown codes fall back to English, then to the code itself. In production, unexpected 5xx details are replaced with a generic message and stacks are never sent.

## Authentication & authorization

- `POST /api/auth/register` — creates a user (role is always `user`; self-registration never grants privileges).
- `POST /api/auth/login` — verifies credentials and returns an RS256 bearer token (`rememberMe: true` extends its lifetime). Unknown email and wrong password return the same `401` so accounts cannot be enumerated.
- The `authenticate` middleware populates `req.user` on every request carrying a valid `Authorization: Bearer <token>` header; it never rejects by itself.
- Protect routes with the role guard:

```ts
router.get("/admin", authorize("admin"), adminService);
router.get("/shared", authorize(["admin", "user"]), sharedService);
```

Roles and user statuses are defined once in `src/constants` and reused by the model, the middleware, the Express types and the migration.

## XACML

XACML middleware evaluates requests **before** they reach the service layer, so services stay focused on business logic. It runs three phases:

### 1. Validation

Joi validator maps for `body`, `params` and `query`:

```ts
export const registerValidation: ValidationSchemas = {
	body: {
		email: Joi.string().email().required(),
		password: Joi.string().min(8).required(),
	},
};
```

Failures answer `422` with one entry per failed field.

### 2. Pre (data fetching)

Pre steps fetch whatever the checks need. Results land on `req.pre[assign]`. Top-level steps run **sequentially**, so later steps can read earlier results; wrap independent steps in a nested array to run that group in **parallel**:

```ts
pre: [
	{ assign: "userByEmail", method: (req) => User.query().findOne("email", String(req.body?.email ?? "")) },
	[
		{ assign: "plan", method: fetchPlan }, // these two run
		{ assign: "quota", method: fetchQuota }, // in parallel
	],
];
```

### 3. Secondary validation

Boolean checks (sync or async) over the fetched data. The first failing check stops the chain and answers `400`. Name each check with an i18n message code — it becomes the response message:

```ts
secondaryValidations: [{ assign: "EMAIL_ALREADY_EXISTS", method: (req) => !req.pre.userByEmail }];
```

Wire everything up on the route:

```ts
router.post("/register", accessControl({ validation, pre, secondaryValidations }), registerService);
```

## Configuration

All variables are documented in `.env.example` and validated at boot in `src/config/env.ts`. Highlights:

| Variable                                       | Default          | Notes                                                                     |
| ---------------------------------------------- | ---------------- | ------------------------------------------------------------------------- |
| `NODE_ENV`                                     | `development`    | `production` requires DB credentials + secrets explicitly                 |
| `PORT`                                         | `4200`           |                                                                           |
| `ALLOWED_ORIGINS`                              | _(empty)_        | CSV CORS allow-list. Empty = allow all in dev, block cross-origin in prod |
| `TRUST_PROXY`                                  | `false`          | Set `true` behind a reverse proxy (correct client IPs for rate limiting)  |
| `LOG_LEVEL`                                    | `info`           | pino level; `silent` disables logging                                     |
| `ENABLE_QUERY_LOG`                             | `false`          | SQL + duration at debug level                                             |
| `DATABASE_*`                                   | local defaults   | host, port, username, password, name, pool min/max                        |
| `AUTH_TOKEN_EXPIRY` / `REMEMBER_TOKEN_EXPIRY`  | `7d` / `30d`     |                                                                           |
| `JWT_PASSPHRASE`                               | dev-only default | Protects the RSA private key                                              |
| `JWT_PRIVATE_KEY_PATH` / `JWT_PUBLIC_KEY_PATH` | `keys/*.pem`     |                                                                           |
| `MAIL_TOKEN_SECRET`                            | dev-only default | Single-purpose tokens (verification/reset links)                          |
| `BCRYPT_SALT_ROUNDS`                           | `12`             |                                                                           |
| `RATE_LIMIT_*`                                 | 100 req / 15 min | Plus a stricter `AUTH_RATE_LIMIT_MAX` (10) on `/api/auth`                 |

## Health endpoints

- `GET /health` — liveness (process is up; never touches dependencies).
- `GET /health/ready` — readiness (pings the database; `503` when unreachable).

## Testing

```shell
npm test
```

Unit tests cover the pure modules (i18n, errors, XACML, JWT, password hashing); integration tests drive the real app in-process with Supertest. The JWT tests run against a throwaway key pair generated in `tests/.tmp/` by the Vitest global setup — no real keys or database required.

## Using this boilerplate for a new project

```bash
git clone git@github.com:ashishtz/boilerplate-node.git PROJECT_REPO_NAME
cd PROJECT_REPO_NAME
rm -rf .git
git init
git add .
git commit -m 'Initial boilerplate'
git remote add origin PROJECT_REPO_URL
git push -u origin main
```

Then rename the package in `package.json` and start building.
