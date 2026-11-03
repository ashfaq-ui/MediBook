# MediBook Frontend

A clean Next.js 16 App Router foundation using React 19 and JavaScript.
The main pages use a responsive clinic interface with a public home page,
account screens, role-specific workspace navigation, dashboard panels, forms,
and empty record tables. No account, booking, or management actions are enabled
yet; live features will be connected component by component.

## Run

```bash
npm ci
npm run dev
```

Open http://localhost:3000. Node.js 20.9 or newer is required.

## Structure

- `src/app`: routes, root layout, and global CSS.
- `src/components`: shared UI components.
- `src/features`: components for each feature.
- `src/lib`: shared utilities.

Shared page components live in `src/components`, including branding and icons,
workspace navigation, dashboard panels, account layouts, page headers, preview
forms, fields, and empty tables. Feature
implementations will live in `src/features` as they are rebuilt.

## Pages

- Public: `/`, `/login`, `/register`.
- Patient: `/patient/dashboard`, `/patient/appointments`,
  `/patient/book-appointment`, `/patient/health-assistant`.
- Doctor: `/doctor/dashboard`, `/doctor/appointments`, `/doctor/slots`,
  `/doctor/appointment-summary`.
- Admin: `/admin/dashboard`, `/admin/users`, `/admin/departments`,
  `/admin/doctors`, `/admin/appointments`.

`/patient`, `/doctor`, and `/admin` redirect to their respective dashboards.
The preview pages are browsable without signing in. Form submission is disabled
and no database records are displayed or changed. Stored data remains in
PostgreSQL; the empty page areas do not indicate an empty database.

## API configuration

`.env.development` uses the local Spring Boot API at `http://localhost:8080/api`.
For overrides, copy `.env.example` to `.env.local` and edit
`NEXT_PUBLIC_API_BASE_URL`. Configure this variable before production builds;
Next.js embeds public variables at build time. The current pages make no API
requests. Backend readiness is available at `http://localhost:8080/api/health`.

## Check and build

```bash
npm run lint
npm run build
npm start
```

Use the Next.js framework preset and the `Frontend` root directory on Vercel.
The default Next.js output settings apply.
