# MediBook

Clinic appointment management with Next.js, Spring Boot / Java 17, and PostgreSQL 17.

## Working features

- Patient registration; password hashing; HttpOnly cookie sessions; remembered login;
  logout; password changes; email-based, expiring, single-use password resets.
- Backend role enforcement and frontend access gates for patient, doctor, and admin.
  Public registration always creates patients. Administrators create staff accounts.
- Departments and doctor profiles with specialization, phone, department assignment,
  and active/inactive accounts. Linked departments cannot be deleted.
- Doctor availability generation by date, time range, and slot duration; overlap
  validation; removal of unused future slots. Omit breaks and leave dates when
  adding availability. Slots with appointment history are retained.
- Patient booking, cancellation, and rescheduling with the same doctor; appointment
  search and status/date filters; role-scoped appointment history and dashboards.
- Transactional row locks prevent double booking and overlapping patient appointments.
  Cancellation releases availability while retaining appointment history.
- Doctor consultation notes, prescriptions/care instructions, follow-up dates,
  completion, and no-show handling. Patients only see summaries explicitly shared
  by their doctor. Completion requires the appointment to have started; no-show
  requires its end time to have passed.
- Optional SMTP confirmation, cancellation, rescheduling, completion, password reset,
  and 24-hour reminder emails through a persistent outbox with up to five attempts.
- Clinic help for appointment navigation, plus an optional local Ollama adapter for
  general educational questions. AI requests require explicit consent. No account
  details or clinical records are sent to the model. Chat history stays in the page
  session and is not stored in the database.

The existing visual layout is retained for later design work. No demo users,
appointments, or departments are inserted into the retained database.

## Run locally

Requirements: Docker Desktop, Java 17, Node.js 20.9 or newer.

From the project root:

```bash
docker compose up -d
```

In a backend terminal:

```bash
cd backend
./mvnw spring-boot:run
```

In a frontend terminal:

```bash
cd Frontend
npm ci
npm run dev
```

Open http://localhost:3000. API readiness: http://localhost:8080/api/health.
Restart both existing development servers after pulling these changes.

Use an existing administrator account to create departments and doctors. If the
installation has **no administrator**, export `ADMIN_EMAIL` and `ADMIN_PASSWORD`
(at least 10 characters, at most 72 UTF-8 bytes) before starting the backend.
Bootstrap only runs when there is no ADMIN row; it never changes existing accounts.
There is no default administrator password. Staff can change their initial passwords
under Account settings. Doctors create availability; patients can then book it.

Database: host port `5433`, database `medibook`, local username `postgres`, local
password `medibookpassword`. The existing `medibook_pgdata` volume is retained.
Stop servers with Ctrl+C and PostgreSQL with `docker compose stop db`.

## Database migrations and backups

Hibernate schema generation stays disabled. On first startup, the explicit,
transactional migration in `backend/src/main/resources/db/core.sql` maps the
existing tables and adds account activation, sessions, password resets, clinical
summary fields, reminders, an email outbox, and a migration version table.
It replaces the old appointment slot uniqueness constraint so cancelled slots can
be reused, and extends appointment statuses with `NO_SHOW`. Existing rows and
appointment history are retained. Later startups skip the completed migration.

Back up the database before applying migrations to another environment. The local
pre-implementation backup is `.rebuild-backups/core-implementation/before-core.dump`.
Earlier rebuild archives remain under `.rebuild-backups/`. Never commit these dumps.

## Configuration

`backend/.env.example` documents environment variables. Spring Boot does not load
`.env` automatically; export values in the launching shell or configure your host.

- `DATABASE_URL`, `DB_USERNAME`, `DB_PASSWORD`, `PORT`: database and server.
- `CLINIC_TIMEZONE`: defaults to `Asia/Colombo`; the current frontend labels times
  using that timezone. Update the labels if configuring another clinic timezone.
- `FRONTEND_URL`: reset-link origin. `CORS_ALLOWED_ORIGINS`: exact frontend origins,
  comma separated. Mutations require an allowed Origin and `X-Requested-With`.
- `COOKIE_SECURE=true` for HTTPS deployment. Sessions expire after one day or 30
  days with remembered login. Password changes and resets revoke old sessions;
  deactivation revokes access immediately. Roles cannot be changed away from
  patient accounts with appointment history; doctor roles stay tied to profiles.
- `MAIL_ENABLED=true`, `MAIL_FROM`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`,
  `SMTP_PASSWORD`, `SMTP_AUTH`, `SMTP_STARTTLS`: optional SMTP integration.
  Without SMTP, password-reset requests report that email is unavailable.
  Failed deliveries remain visible to administrators via `/api/admin/notifications`;
  payloads are redacted after delivery and removed after seven days. SMTP delivery
  is at least once: a crash after sending can result in a duplicate email.
- `OLLAMA_URL`, `OLLAMA_MODEL`: optional [Ollama chat API](https://github.com/ollama/ollama/blob/main/docs/api.md).
  Run your chosen model separately and set its installed model name. Empty model
  disables AI without disabling clinic help. The adapter has bounded concurrency,
  per-account throttling, response size limits, and a 60-second timeout. AI output
  is informational and must be assessed by a qualified clinician for care decisions.

Browser requests use `/api` through the Next.js proxy, keeping session cookies on
the frontend origin. Set `API_BACKEND_URL` before building the frontend to the
backend origin, e.g. `https://api.your-clinic.example`. Leave
`NEXT_PUBLIC_API_BASE_URL=/api`. Use HTTPS and allow the production frontend origin
in backend configuration. No secrets belong in `NEXT_PUBLIC_*` variables.

## Verification

```bash
cd backend
./mvnw clean verify
```

Backend tests use isolated in-memory databases and mocked SMTP. They cover account
permissions, CSRF headers, logout, token expiration/single use, scheduling overlap,
concurrent booking, cancellation/rebooking, rescheduling, consultation privacy,
completion rules, deactivation, migration reruns, reminders, delivery retries, and
the optional AI HTTP contract against a local stub. They send no real email and do
not require an installed model.

```bash
cd Frontend
npm run lint
npm run build
npm start
```

The implementation was also smoke-tested against a disposable PostgreSQL copy of
the retained database. Real SMTP delivery and real model quality require your
configured services; neither is implied by the mocked integration checks.
