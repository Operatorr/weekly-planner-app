# Ticket T10: Polish, Responsive Design & Vercel Deployment

## Overview

The final ticket before launch. This ticket covers visual polish (animations, transitions, micro-interactions), comprehensive responsive design testing, performance optimization, error handling, and the actual deployment to Vercel. After this ticket, Marrow Tasker is live and accessible on the internet.

**References**: __@Epic Brief: Marrow Tasker__ (all sections), __@Core Flows: Marrow Tasker__ (all flows — verify all work end-to-end)

## Scope

### In Scope

1. **Animation & Micro-Interactions** (__@src/lib/animations.ts__ and component updates)
   * Task creation: new task slides in from the top with a subtle fade
   * Task completion: checkbox fill animation → strikethrough → opacity reduction → slide out
   * Task detail sheet: smooth expand/collapse (scale + opacity, ~250ms ease-out)
   * Sidebar toggle: smooth width transition with content cross-fade
   * Tab switching: subtle content cross-fade between projects
   * Drag and drop: lift shadow, smooth settle, drop indicator pulse
   * Page transitions: minimal fade between routes (200ms)
   * Loading states: skeleton loaders for task lists and weekly view
   * Toast notifications: slide in from bottom-right, auto-dismiss with progress bar

2. **Responsive Design Audit**
   * Test and fix all layouts at breakpoints: 375px (mobile), 768px (tablet), 1024px (laptop), 1440px (desktop)
   * Mobile-specific adaptations:
     - Sidebar becomes a drawer overlay (Shadcn Sheet)
     - Weekly view becomes single-day with swipe navigation
     - Task detail opens as a full-screen sheet (bottom-up)
     - Add Task form is a floating action button that opens a bottom sheet
     - Project tabs become a scrollable horizontal list
   * Touch-friendly: larger tap targets (min 44x44px), swipe gestures for task actions

3. **Error Handling & Edge Cases**
   * Global error boundary component with friendly error message and retry button
   * Network error handling: detect offline state, show "You're offline — changes will sync when you're back"
   * Sync conflict indicators (subtle — just a small badge or indicator)
   * Empty states for every list/section (illustrated or text-based)
   * Form validation errors with clear, inline messaging
   * 404 page for unknown routes
   * Rate limit handling for Resend API calls

4. **Performance Optimization**
   * Ensure route-based code splitting (TanStack Start handles this by default)
   * Lazy load the task detail sheet component
   * Optimize TanStack DB queries — ensure indexes are hit
   * Image/asset optimization (compress SVGs, use next-gen image formats)
   * Lighthouse audit targeting: Performance > 90, Accessibility > 90, Best Practices > 90

5. **SEO & Meta Tags** (__@src/routes/__root.tsx__ and page-level)
   * Proper `<title>` and `<meta description>` for landing and pricing pages
   * Open Graph tags for social sharing (og:title, og:description, og:image)
   * Twitter Card meta tags
   * `robots.txt` allowing indexing of public pages, blocking `/app/*`
   * `sitemap.xml` for public pages (stretch goal)
   * Favicon and Apple Touch Icon

6. **Vercel Deployment**
   * Configure `vercel.json` with:
     - Build settings for TanStack Start
     - Cron job for reminder processing
     - Environment variable references
   * Set up environment variables in Vercel Dashboard:
     - `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
     - `DATABASE_URL` (Neon connection string)
     - `RESEND_API_KEY`
     - `CRON_SECRET`
     - `APP_URL`
   * Deploy to Vercel and verify:
     - Landing page loads correctly
     - Pricing page loads correctly
     - Sign-up/sign-in flows work
     - Task CRUD operations work
     - Email reminders are sent by cron
     - Database sync works across browser tabs
   * Configure custom domain (if available)
   * Enable Vercel Analytics (optional)

7. **Accessibility**
   * Proper ARIA labels on interactive elements
   * Keyboard navigation throughout the app (tab order, focus management)
   * Screen reader compatibility for task list, sections, and navigation
   * Color contrast compliance (WCAG AA minimum)
   * Focus visible indicators on all interactive elements
   * Reduced motion support: `@media (prefers-reduced-motion)` disables animations

### Out of Scope

* CI/CD pipeline (future — manually deploy for now)
* Automated testing / test suite (future ticket)
* Performance monitoring / APM (future)
* A/B testing infrastructure (future)
* CDN configuration beyond Vercel's defaults (future)

## Acceptance Criteria

* All animations are smooth, purposeful, and not distracting (200-300ms, ease-out curves)
* App is fully functional and visually correct at 375px, 768px, 1024px, and 1440px widths
* Mobile users can: add tasks, complete tasks, switch projects, navigate via sidebar drawer, view weekly schedule
* All error states show user-friendly messages (no raw error strings or blank screens)
* Offline indicator appears when network is lost, disappears when connection restores
* Lighthouse scores: Performance > 90, Accessibility > 90, Best Practices > 90, SEO > 90 (for landing page)
* Vercel deployment succeeds and all critical flows work in production
* Cron job fires correctly in production (verified via Vercel logs)
* Environment variables are correctly configured (no secrets exposed client-side)
* Sign-up → email verification → sign-in → task creation → task completion flow works end-to-end in production
* Favicon displays correctly in browser tabs
* Social sharing (copy link, paste in Slack/Twitter) shows correct preview card

## Technical Notes

* For animations, prefer CSS transitions and `@keyframes` over JavaScript animation libraries — they're more performant and sufficient for the minimal aesthetic. Only use `framer-motion` if a specific interaction requires spring physics.
* Vercel deployment for TanStack Start: ensure the output adapter is set to `vercel` in the TanStack Start config. TanStack Start v1 RC supports this natively.
* For the mobile weekly view, consider a horizontal `scroll-snap` container with one day per "page" — simpler than a full carousel component.
* Skeleton loaders: use Shadcn's `Skeleton` component with the correct proportions matching the task items.
* For offline detection, use `navigator.onLine` + `online`/`offline` events. TanStack DB's sync status should also reflect this.
* `prefers-reduced-motion`: wrap all animations in a media query check. For React transitions, check `window.matchMedia('(prefers-reduced-motion: reduce)').matches`.
* Run Lighthouse in incognito mode for accurate scores. Address any critical findings before deployment.
* For favicon, include: `favicon.ico`, `apple-touch-icon.png` (180x180), and a `site.webmanifest` for PWA basics (stretch goal).

## Dependencies

All previous tickets (T01–T09) — this is the final integration and polish pass.
