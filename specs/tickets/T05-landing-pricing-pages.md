# Ticket T05: Landing Page & Pricing Page

## Overview

Build the public-facing marketing pages for DoMarrow — a compelling landing page that converts visitors to sign-ups, and a pricing page that clearly presents the Free and Pro tiers (with Pro disabled as "Coming Soon"). These pages establish the brand identity and serve as the entry point for all users. The design should be clean, minimal, and Things-inspired — lots of whitespace, elegant typography, and subtle animations.

**References**: __@Epic Brief: DoMarrow__ (Landing Page, Pricing Page sections), __@Core Flows: DoMarrow__ (F1.15 Landing Page, F1.16 Pricing Page)

## Scope

### In Scope

1. **Shared Navigation** (__@src/components/marketing/navbar.tsx__)
   * Logo ("DoMarrow" or logo mark) on the left
   * Nav links: Features (anchor scroll), Pricing (links to `/pricing`)
   * Auth buttons: "Sign In" (ghost button), "Get Started Free" (primary button)
   * Sticky header with subtle backdrop blur on scroll
   * Mobile-responsive: hamburger menu on small screens

2. **Landing Page** (__@src/routes/index.tsx__)
   * **Hero Section**: Headline ("Your tasks, beautifully organized"), subheadline (value proposition), primary CTA ("Get Started Free"), secondary CTA ("See Pricing"), hero illustration or app screenshot mockup
   * **Features Section**: 3-4 feature cards with icons and descriptions:
     - "Smart Quick Add" — Natural task entry, just start typing
     - "Weekly Planning" — See your whole week at a glance, drag to reschedule
     - "Flexible Layouts" — List view, board view, whatever works for you
     - "Never Forget" — Timely reminders via email and calendar
   * **How It Works Section** (optional): 3-step visual guide (Add tasks → Organize your week → Get it done)
   * **Final CTA Section**: "Ready to get organized?" with sign-up button
   * **Footer**: Logo, nav links (About, Pricing, Privacy, Terms), copyright "© 2026 DoMarrow"

3. **Pricing Page** (__@src/routes/pricing.tsx__)
   * **Pricing Header**: "Simple, transparent pricing" headline
   * **Billing Toggle**: Monthly / Yearly toggle (affects Pro price display only)
   * **Free Tier Card**:
     - Title: "Free"
     - Price: "$0 / forever"
     - Feature list with checkmarks (matching __@Epic Brief__ Free tier features)
     - CTA: "Get Started Free" button (links to `/sign-up`)
   * **Pro Tier Card**:
     - Title: "Pro"
     - Badge: "Coming Soon" (overlay or ribbon)
     - Price: "$3/mo billed yearly" or "$4/month" based on toggle
     - Yearly savings callout: "Save 25% with yearly billing"
     - Feature list with checkmarks (matching __@Epic Brief__ Pro tier features, includes "Everything in Free, plus:")
     - CTA: "Coming Soon" button (disabled, grayed out)
     - Optional: "Notify me when Pro launches" email capture (stretch goal)
   * **Feature Comparison Table**: Full feature-by-feature comparison grid below the cards
   * **FAQ Section** (optional): Common questions about the free tier and upcoming Pro

4. **Shared Footer** (__@src/components/marketing/footer.tsx__)
   * Consistent footer across marketing pages
   * Logo, navigation links, copyright

5. **Responsive Design**
   * Full mobile responsiveness for all marketing pages
   * Pricing cards stack vertically on mobile
   * Feature grid adapts from multi-column to single column

### Out of Scope

* Blog / content pages (future)
* SEO optimization beyond basic meta tags (future ticket)
* Analytics integration (future)
* "Notify me" email capture backend (stretch goal, not required)
* Privacy Policy / Terms of Service content (placeholder pages are fine)

## Acceptance Criteria

* Landing page loads at `/` with hero section, features, CTA, and footer
* All CTAs link to the correct destinations (`/sign-up`, `/pricing`)
* Pricing page loads at `/pricing` with both tier cards displayed correctly
* Free tier card has an active "Get Started Free" button
* Pro tier card shows "Coming Soon" badge and a disabled CTA button
* Monthly/yearly toggle switches the Pro price display between "$4/month" and "$3/mo billed yearly ($36/year)"
* Feature comparison table accurately reflects the tier features from the Epic Brief
* Pages are fully responsive (tested at 375px, 768px, 1024px, 1440px widths)
* Navigation is consistent between landing and pricing pages
* Design follows the clean, minimal, Things-inspired aesthetic: ample whitespace, neutral colors, subtle shadows, elegant typography
* Page transitions are smooth (no jarring reloads between marketing pages)
* Footer is present and consistent on both pages
* Authenticated users who visit the landing page see "Go to App" instead of "Get Started Free"

## Technical Notes

* Use Shadcn UI components: Card, Button, Badge, Tabs (for billing toggle), Separator
* For the hero illustration, consider a CSS/SVG illustration or a stylized screenshot of the app UI (can be a placeholder initially)
* Use Tailwind's prose utilities for text sections
* Consider adding subtle entrance animations using CSS `@keyframes` or `framer-motion` (keep it minimal — fade-in and slight slide-up, nothing flashy)
* For the feature comparison table, use a responsive table component that becomes a stacked card layout on mobile
* SEO basics: proper `<title>`, `<meta description>`, Open Graph tags for each page
* Ensure authenticated state check uses Clerk's client-side hooks (`useAuth()`) for conditional CTA rendering

## Dependencies

T01 (Project Scaffolding) — Shadcn UI and Tailwind must be configured.
T03 (Authentication) — Clerk integration for conditional auth state rendering.
