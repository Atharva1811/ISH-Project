# CampusFlora Security & Privacy Architecture

CampusFlora is engineered specifically for static client-side deployment on GitHub Pages while adhering to zero-trust client security principles. 

This document details the security model, access control policies, API key protection mechanisms, and data privacy safeguards implemented in CampusFlora for security auditors, judges, and developers.

---

## 1. Zero-Trust Security Perimeter (Row Level Security)

In a client-side single-page application (SPA), the client-side JavaScript bundle and API keys (such as `VITE_SUPABASE_ANON_KEY`) are public by design. **CampusFlora does not rely on frontend secrecy or obfuscation for authorization.**

Instead, security is enforced exclusively at the database layer using **PostgreSQL Row Level Security (RLS)** in Supabase. Every database access attempt passes through strict SQL policies evaluation.

### Table Access Rules:

#### `plants` Table
- **SELECT (Public Read)**: 
  - Verified plant records (`verified = true`) are publicly readable by any user or anonymous visitor.
  - Unverified records are **strictly hidden** from the public and are visible ONLY to the original submitter (`submitted_by = auth.uid()`) or users holding the `admin` role.
- **INSERT**:
  - Allowed ONLY for authenticated users (`auth.role() = 'authenticated'`).
  - The database enforces `submitted_by = auth.uid()`, preventing users from submitting plant entries on behalf of others.
- **UPDATE**:
  - Restricted **exclusively** to users with the `admin` role.
  - Admin status is verified via an inner SQL subquery against the `users` table:
    `EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')`
  - Regular users cannot modify records once submitted.
- **DELETE**:
  - Restricted **exclusively** to `admin` role.

#### `users` Table
- **SELECT**: Users can read only their own user profile (`id = auth.uid()`), or admins can read all profiles.
- **UPDATE**: Users can update non-sensitive profile fields (e.g. `full_name`), but the `role` column is **protected from client modification**. The RLS `WITH CHECK` clause ensures `role` matches the stored database value. Role upgrades to `admin` must be executed via Supabase SQL dashboard or service role triggers.

---

## 2. API Key Protection (PlantNet AI Proxy)

Third-party AI identification keys (such as `PLANTNET_API_KEY`) are **never bundled, embedded, or exposed to the client browser**.

- **Supabase Edge Function (`plantnet-proxy`)**:
  - The frontend sends plant image identification requests to the `plantnet-proxy` Deno Edge Function.
  - **JWT Authorization Verification**: The Edge Function validates the caller's Supabase JWT session (`auth.getUser()`) before making any external request. Unauthenticated calls are rejected with `401 Unauthorized`.
  - **Secret Storage**: The `PLANTNET_API_KEY` is stored as an encrypted environment secret in Supabase (`Deno.env.get('PLANTNET_API_KEY')`).
  - **Rate Limiting & Quota Safety**: Malicious anonymous users cannot drain the PlantNet API quota.

---

## 3. Public Profile & QR Code Data Privacy

When users scan a plant's physical QR code or share a public link (`/#/plant/:id`), privacy must be preserved:

- **Privacy-Preserving View (`public_plants`)**:
  - Public profile pages query the `public_plants` view rather than the raw `plants` table.
  - The view excludes sensitive fields including `submitted_by` (User UUID) and submitter email addresses.
- **UUID Parameter Sanitization**:
  - The frontend router validates that `:id` strictly conforms to standard UUID format (`/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`) prior to issuing any database query, preventing SQL injection or parameter probing attempts.

---

## 4. Input Sanitization & Content Security Policy (CSP)

- **XSS Prevention**:
  - All user-entered text fields (notes, common names, descriptions) are sanitized using `DOMPurify` before rendering.
  - React's default JSX string escaping is enforced throughout; `dangerouslySetInnerHTML` is omitted entirely.
- **Postgres CHECK Constraints**:
  - `latitude` must be between -90 and 90
  - `longitude` must be between -180 and 180
  - `species_name` length must be between 2 and 150 characters
  - `zone` must match an approved campus zone enum
- **HTTP Content Security Policy**:
  - `index.html` includes a strict `<meta http-equiv="Content-Security-Policy">` header restricting script, style, image, worker, and connect sources to explicitly whitelisted domains.

---

## 5. Storage Security Policy

- **`plant-images` Storage Bucket**:
  - File size strictly capped at **5MB** (5,242,880 bytes).
  - Allowed MIME types restricted to `image/jpeg`, `image/png`, `image/webp`.
  - Unauthenticated file uploads are blocked at the storage RLS layer.
