# Ticket T08: Email Reminders via Resend

## Overview

Implement the email reminder system for DoMarrow using Resend as the email service provider. When a user sets a reminder on a task, the system sends a well-designed email at the specified time with the task details and a link back to the app. This ticket covers the Resend integration, email templates, the server-side reminder processing job, and the Vercel Cron configuration.

**References**: __@Epic Brief: DoMarrow__ (Task Reminders feature), __@Core Flows: DoMarrow__ (F2.1 Set a Task Reminder)

## Scope

### In Scope

1. **Resend Integration** (__@src/server/email/resend.ts__)
   * Install and configure `resend` npm package
   * Set up API key via `RESEND_API_KEY` environment variable
   * Configure sender domain/email (e.g., `reminders@domarrow.app` or Resend's default)
   * Create a reusable `sendEmail(to, subject, html)` function

2. **Email Templates** (__@src/server/email/templates/__)
   * `task-reminder.tsx` — React Email template for task reminders:
     - Subject: "Reminder: {task name}"
     - Body: Task name (bold), description preview (if exists), due date, checklist progress (if applicable)
     - CTA button: "Open in DoMarrow" (links to the task in the app)
     - Footer: "You're receiving this because you set a reminder in DoMarrow" + unsubscribe link (future)
     - Design: clean, minimal, matches DoMarrow brand — white background, neutral typography, subtle accent color
   * `welcome.tsx` — Welcome email template (sent after sign-up):
     - Subject: "Welcome to DoMarrow"
     - Body: Brief welcome message, 2-3 tips for getting started, CTA to open the app
   * Consider using `@react-email/components` for email templating

3. **Reminder Processing Job** (__@src/server/cron/process-reminders.ts__)
   * Server route or API endpoint: `GET /api/cron/process-reminders`
   * Protected with a `CRON_SECRET` to prevent unauthorized access
   * Logic:
     1. Query Neon for reminders where `reminder_at <= NOW()` and `sent = false`
     2. For each due reminder, fetch the associated task and user
     3. Send the reminder email via Resend
     4. Mark the reminder as `sent = true`
     5. Log the result (success/failure count)
   * Handle errors gracefully: if one email fails, continue processing others
   * Batch limit: process max 50 reminders per invocation to stay within Vercel function timeout

4. **Vercel Cron Configuration** (__@vercel.json__)
   * Configure cron job to hit `/api/cron/process-reminders` every 5 minutes
   * Include the `CRON_SECRET` in the authorization header

5. **Welcome Email Trigger** (__@src/server/auth/provision.ts__ — update from T03)
   * After user provisioning (new sign-up), send the welcome email via Resend
   * Non-blocking: don't fail the sign-up if the email fails

### Out of Scope

* Calendar integration (.ics file generation) — future
* Custom reminder repeat patterns (Pro tier)
* Push notifications (future)
* Email preference settings / unsubscribe management (future)
* SMS reminders (future)

## Acceptance Criteria

* Resend is configured and can send emails successfully
* Task reminder email is well-designed and matches DoMarrow branding
* Reminder emails contain: task name, description, due date, and a working "Open in DoMarrow" link
* Cron job runs every 5 minutes and correctly identifies due reminders
* Due reminders trigger email delivery and are marked as `sent = true`
* A reminder set for 2:30 PM is sent within the 2:30–2:35 PM window (5-minute cron granularity)
* Failed email sends are logged but don't crash the cron job or block other reminders
* Welcome email is sent to new users after sign-up
* `CRON_SECRET` protects the cron endpoint from unauthorized access
* Email renders correctly across major email clients (Gmail, Outlook, Apple Mail)

## Technical Notes

* Use `@react-email/components` for building email templates — it provides React components that compile to email-safe HTML
* Resend's free tier allows 100 emails/day, 3,000/month — sufficient for MVP
* For the cron job, Vercel Cron Jobs (Hobby plan) support `schedule` cron expressions in `vercel.json`. The minimum interval varies by plan — check Vercel docs.
* The cron endpoint should verify `Authorization: Bearer ${CRON_SECRET}` header. Vercel automatically sends this for configured cron jobs.
* For email links, use the app's base URL from an environment variable: `APP_URL` (e.g., `https://domarrow.app/app/task/{taskId}`)
* Consider timezone handling: reminders should fire based on the user's timezone. Store timezone preference in the user record and convert `reminder_at` accordingly. For MVP, store reminders in UTC and convert on display.
* If `@react-email/components` is too heavy, a simple HTML string template works fine for MVP.

## Dependencies

T01 (Project Scaffolding) — dependencies.
T02 (Database Schema) — reminders table.
T03 (Authentication) — user provisioning hook for welcome email.
T04 (Server Functions) — reminder server functions (setReminder, removeReminder).
