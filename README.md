# Asnaf portal frontend

Independent React/Vite client for the public economic actor portal.

## Foundations

- Vite development server: `http://127.0.0.1:5174`
- Portal API namespace: `/api/user/v1`
- Local proxy target: `http://127.0.0.1:3001`
- Default token key: `asnaf.portal.access-token`
- Persian RTL document and Vazirmatn font
- Independent login/session, navigation, and API client
- Dashboard, owned cases, case finance, account/password, and issuance wizard
- Read-only organizational stages and disabled renewal/auction/stewardship
  future actions

Copy `.env.example` to `.env.local` to override local API or token settings.
The API base URL should include `/api/user/v1`.

Vite uses `../frontend/public` as its static asset source so the portal shares
the administration client's `head3.png` and brand assets after both portal
projects were moved into this repository.

Use `npm run lint` and `npm run build` for non-server verification.
