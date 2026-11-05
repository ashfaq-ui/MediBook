# MediBook Frontend

Next.js App Router / React. The pages connect to the Spring Boot API through the
same-origin `/api` proxy. See the root README for backend setup, permissions,
database migrations, and optional SMTP and AI configuration.

```bash
npm ci
npm run dev
```

Open http://localhost:3000. Configure `API_BACKEND_URL` before building for another
environment; leave `NEXT_PUBLIC_API_BASE_URL=/api` for HttpOnly cookie sessions.
Copy `.env.example` to `.env.local` for local overrides. Restart the development
server after changing environment variables or the proxy configuration.

Public routes: `/`, `/login`, `/register`, `/forgot-password`, `/reset-password`.
Registration creates patient accounts; clinic staff are created by administrators.

Patient routes: `/patient/dashboard`, `/patient/appointments`,
`/patient/book-appointment`, `/patient/health-assistant`.

Doctor routes: `/doctor/dashboard`, `/doctor/appointments`, `/doctor/slots`,
`/doctor/appointment-summary`.

Admin routes: `/admin/dashboard`, `/admin/users`, `/admin/departments`,
`/admin/doctors`, `/admin/appointments`.

Role roots redirect to dashboards. Workspaces require a valid account with the
matching role. Backend authorization is enforced independently of these UI gates.
Account settings include password changes; sign-out is available in every workspace.

Feature components live under `src/features`; shared UI components under
`src/components`; API requests under `src/lib/api.js`. The current styles are
retained so visual refinement can follow core workflow review.

```bash
npm run lint
npm run build
npm start
```
