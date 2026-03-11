# Ticket T03: Clerk Authentication Integration

## Overview

Integrate Clerk for authentication across DoMarrow — sign-up, sign-in, sign-out, email verification, and session management. After this ticket, users can create accounts, verify their email, sign in, and access protected app routes. Unauthenticated users are redirected to the landing page or sign-in.

**References**: __@Epic Brief: DoMarrow__ (Authentication System), __@Core Flows: DoMarrow__ (F1.1 Sign Up, F1.2 Sign In, F1.3 Sign Out, F1.4 Password Reset)

## Scope

### In Scope

1. **Clerk Setup** (__@src/lib/clerk.ts__)
   * Install `@clerk/tanstack-start` package
   * Configure Clerk provider in the root layout (__@src/routes/__root.tsx__)
   * Set up environment variables: `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
   * Configure Clerk to use Resend for transactional emails (email verification, password reset)
   * Enable email + password authentication strategy
   * Configure Clerk appearance to match DoMarrow's clean/minimal theme

2. **Auth Routes** (__@src/routes/__)
   * `/sign-up` route — Clerk `<SignUp />` component, styled to match app theme
   * `/sign-in` route — Clerk `<SignIn />` component, styled to match app theme
   * After sign-up redirect → `/app` (with user provisioning, see below)
   * After sign-in redirect → `/app`

3. **Route Protection** (__@src/lib/auth.ts__)
   * Middleware or route guard for all `/app/*` routes — redirect unauthenticated users to `/sign-in`
   * Public routes: `/`, `/pricing`, `/sign-in`, `/sign-up`
   * Protected routes: `/app`, `/app/*`
   * Server-side session validation for server functions

4. **User Provisioning** (__@src/server/auth/provision.ts__)
   * Clerk webhook or post-sign-up hook to create user record in Neon database
   * Set default tier to "free"
   * Create default "Personal" project for new users
   * Handle edge case: user exists in Clerk but not in Neon (re-provision)

5. **User Profile UI** (__@src/components/user-menu.tsx__)
   * Profile avatar button in the app header (top-right)
   * Dropdown menu: user name, email, "Settings" link, "Sign Out" button
   * Sign-out triggers Clerk sign-out + TanStack DB local data clear + redirect to `/`

### Out of Scope

* Social auth providers (Google, GitHub) — can be added later in Clerk dashboard
* Multi-factor authentication (future)
* User profile editing beyond what Clerk provides out of the box
* Team/organization features (future, Pro tier)

## Acceptance Criteria

* Clerk provider wraps the entire app and provides authentication context
* `/sign-up` renders a styled sign-up form that creates accounts with email verification
* Email verification emails are sent via Resend and work end-to-end
* `/sign-in` renders a styled sign-in form that authenticates users
* After sign-up, a user record is created in Neon with tier="free" and a default "Personal" project
* All `/app/*` routes redirect to `/sign-in` for unauthenticated users
* Public routes (`/`, `/pricing`, `/sign-in`, `/sign-up`) are accessible without authentication
* Profile dropdown shows user info and a working "Sign Out" button
* Sign-out clears the Clerk session, clears TanStack DB local data, and redirects to `/`
* Server functions can access the authenticated user's ID via Clerk's server-side helpers
* Password reset flow works end-to-end (email sent, link works, password updated)

## Technical Notes

* `@clerk/tanstack-start` is the official integration — follow their docs for TanStack Start specifically.
* For Resend integration, configure Clerk's email settings in the Clerk Dashboard to use a custom SMTP/API with Resend. Alternatively, use Clerk's built-in email if Resend integration is complex — the key requirement is that emails work.
* User provisioning via Clerk webhooks is the most reliable approach (handles edge cases like failed post-sign-up actions). Set up a webhook endpoint at `/api/webhooks/clerk`.
* For route protection, TanStack Start supports middleware — use it to check Clerk session on protected routes.
* The Clerk appearance API allows deep customization — match the neutral/minimal DoMarrow theme (no colored backgrounds, clean typography, subtle borders).
* Store the Clerk user ID as the primary identifier in the Neon `users` table — don't generate a separate UUID.

## Dependencies

T01 (Project Scaffolding) — project structure and dependencies.
T02 (Database Schema) — user and project tables must exist in Neon.
