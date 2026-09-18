# Security Policy

## Reporting a vulnerability

If you believe you have found a security vulnerability in NARAN, please report it
privately. **Do not** open a public GitHub issue for security problems.

- Email: `security@naran.mn` *(update to the store's real security contact before launch)*
- Please include: a description, steps to reproduce, affected URL/endpoint, and
  impact. A proof-of-concept helps but is not required.
- We aim to acknowledge reports within a few business days.

Please act in good faith: do not run automated scans that degrade service, do not
access or modify other users' data, and give us reasonable time to fix an issue
before any public disclosure.

## Scope

- Storefront (Next.js), Medusa admin/API, the Express payments gateway, and the
  deployment configuration in `infra/`.
- Out of scope: third-party services (QPay/Botxon, the hosting provider,
  Cloudflare, email provider) — report those to the respective vendor.

## Hardening already in place

- **Payments** are server-authoritative (the charge amount is the cart's
  server-side total; client-sent amounts are ignored). Payment webhooks are
  verified with HMAC + constant-time comparison; the status endpoint is the final
  source of truth. See `docs/` and `api/src/`.
- **HTTP security headers** on the storefront (HSTS, `X-Frame-Options: DENY`,
  `nosniff`, `Referrer-Policy`, `Permissions-Policy`) and an enforced
  **Content-Security-Policy**; the API adds `helmet`.
- **Rate limiting** on login, registration, password reset, and payment-intent
  creation.
- **RBAC** on custom admin routes; deny-by-default for role-less admins can be
  enabled with `SUPER_ADMIN_EMAILS`.
- **Secrets** are never committed (`.env*` is gitignored); production refuses to
  boot without its required secrets.

## Supported versions

Only the currently deployed `main` branch is supported. Please report against the
latest deployed version.
