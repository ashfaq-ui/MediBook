# MediBook

A fresh foundation for rebuilding the clinic appointment system component by
component: Next.js 16 and React 19, Spring Boot 4 with Java 17, and PostgreSQL 17
in Docker.

## Current state

The frontend contains the home, login, registration, patient, doctor, and admin
pages, with basic content, navigation, forms, and empty data areas. These are
browsable previews; submissions and account actions are disabled while features
are rebuilt. See [Frontend/README.md](Frontend/README.md) for the page routes.
The backend contains application configuration, database connectivity, CORS
configuration, and `GET /api/health`.
The previous login, dashboards, booking, email, and AI implementations have been
removed from the active application and archived locally before the reset.
These features will be rebuilt incrementally.

The existing PostgreSQL database and `medibook_pgdata` Docker volume are retained.
Automatic Hibernate schema changes and SQL initialization are disabled. The
foundation does not create, update, or delete application records or tables.

## Run locally

Requirements: Docker Desktop, Java 17, and Node.js 20.9 or newer. Use Maven or
the included `backend/mvnw` wrapper.

From the project root, start PostgreSQL:

```bash
docker compose up -d
```

In a backend terminal:

```bash
cd backend
mvn spring-boot:run
```

In a frontend terminal:

```bash
cd Frontend
npm ci
npm run dev
```

Frontend: http://localhost:3000

Backend health: http://localhost:8080/api/health

Database: `localhost:5433`, database `medibook`, username `postgres`, password
`medibookpassword` for the current local setup. Existing volume credentials are
retained when restarting the container.

Stop the application servers with Ctrl+C. Stop PostgreSQL from the project root
with `docker compose stop db`; its named volume retains the data.

## Configuration

The backend reads `DATABASE_URL`, `DB_USERNAME`, `DB_PASSWORD`, `PORT`, and
`CORS_ALLOWED_ORIGINS` from the process environment; defaults work with the
included Compose configuration. `backend/.env.example` lists the supported
values. Spring Boot does not automatically load a `.env` file.

The frontend's `.env.development` contains the local API URL. For overrides,
copy `Frontend/.env.example` to `Frontend/.env.local`. Public Next.js environment
variables are embedded when the application builds. Configure the production API
URL explicitly when deploying.

## Project layout

- `Frontend/src/app`: Next.js routes, root layout, and base styles.
- `Frontend/src/components`: shared UI components as they are built.
- `Frontend/src/features`: feature components as they are built.
- `Frontend/src/lib`: shared frontend utilities as they are needed.
- `backend/src/main/java/com/medibook/config`: application configuration.
- `backend/src/main/java/com/medibook/health`: API and database health.
- `compose.yaml`: the existing PostgreSQL service and persistent data volume.

## Verification

```bash
cd Frontend
npm run lint
npm run build
```

In the backend directory:

```bash
./mvnw clean verify
```

Backend tests use an isolated in-memory database and do not require PostgreSQL.
They check health responses, development CORS, and startup without schema writes.

## Rebuild order

1. Page structure and navigation (created); refine the UI component by component.
2. Registration, login, and role handling.
3. Departments and doctor profiles.
4. Doctor availability and time slots.
5. Appointment booking and management.
6. Patient, doctor, and admin dashboards.
7. Email notifications and optional AI features.

Each component can be designed, implemented, and reviewed before moving on.
Existing database tables will be mapped deliberately as their features return.

## Local backups

`.rebuild-backups/` is ignored by Git. The timestamped snapshot made before this
reset contains `source-before-rebuild.tar.gz`, `medibook.dump`, and a checksum
manifest. `.rebuild-backups/latest` identifies the snapshot directory. Keep these
local backups when reviewing or continuing the rebuild.
