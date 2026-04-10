# MediBook — Frontend

React 19 + Vite frontend for the MediBook clinic appointment system.

See the [root README](../README.md) for full project documentation.

## Development

```bash
npm install
npm run dev
```

## Environment

| File | Purpose |
|---|---|
| `.env.development` | Points to Railway backend (default) |
| `.env.production` | Points to Railway backend |

To develop against a local backend, edit `.env.development` and uncomment the localhost line.

## Build

```bash
npm run build
```

Deployed automatically to Vercel on push to `main`. The `vercel.json` at the root of this folder configures SPA routing so React Router works on direct URL access and page refresh.
