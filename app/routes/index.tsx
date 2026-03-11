import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef } from "react";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  CalendarDays,
  LayoutList,
  Bell,
  ArrowRight,
  Sparkles,
  MoveRight,
} from "lucide-react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap-config";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { DemoAppPreview } from "@/components/landing/demo-app-preview";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "DoMarrow — Your tasks, beautifully organized" },
      { name: "description", content: "A minimal, beautiful task manager for people who value focus. Plan your day, organize your week, get things done — without the clutter." },
      { property: "og:title", content: "DoMarrow — Your tasks, beautifully organized" },
      { property: "og:description", content: "A minimal task manager for people who value focus. Plan your day, see your week at a glance, and get things done." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "DoMarrow — Your tasks, beautifully organized" },
      { name: "twitter:description", content: "A minimal task manager for people who value focus. Plan your day, see your week at a glance, and get things done." },
    ],
  }),
});

function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const appPreviewRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // GSAP animations
  useGSAP(() => {
    // Skip animations if user prefers reduced motion
    if (reducedMotion) {
      return;
    }

    // Hero content staggered reveal timeline
    const heroTimeline = gsap.timeline({ defaults: { ease: "expo.out" } });

    heroTimeline
      .fromTo(".hero-badge",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 })
      .fromTo(".hero-headline",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8 }, "-=0.4")
      .fromTo(".hero-highlight",
        { scaleX: 0 },
        { scaleX: 1, duration: 0.6 }, "-=0.3")
      .fromTo(".hero-subheadline",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 }, "-=0.4")
      .fromTo(".hero-ctas",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 }, "-=0.3")
      .fromTo(".hero-trust",
        { opacity: 0 },
        { opacity: 1, duration: 0.4 }, "-=0.2")
      .fromTo(".app-preview",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8 }, "-=0.3");

    // Feature cards scroll-triggered reveal
    ScrollTrigger.batch(".feature-card", {
      onEnter: (elements) => {
        gsap.fromTo(elements,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, stagger: 0.15, duration: 0.8, ease: "expo.out" }
        );
      },
      start: "top 85%",
      once: true,
    });

    // Step cards scroll-triggered animation
    ScrollTrigger.batch(".step-card", {
      onEnter: (elements) => {
        gsap.fromTo(elements,
          { opacity: 0, x: -30 },
          { opacity: 1, x: 0, stagger: 0.2, duration: 0.7, ease: "expo.out" }
        );
      },
      start: "top 80%",
      once: true,
    });

    // Step numbers scale animation
    gsap.utils.toArray(".step-number").forEach((el) => {
      ScrollTrigger.create({
        trigger: el as Element,
        start: "top 85%",
        onEnter: () => {
          gsap.fromTo(el as Element,
            { scale: 0.5, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(2)" }
          );
        },
        once: true,
      });
    });

    // CTA section glow pulse
    gsap.to(".cta-glow", {
      opacity: 0.25,
      scale: 1.1,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-surface">
      <Navbar />

      {/* ─── HERO SECTION ─── */}
      <section ref={heroRef} className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[40%] -right-[20%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-ember/[0.04] to-amber/[0.06] blur-3xl" />
          <div className="absolute -bottom-[30%] -left-[15%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-sage/[0.04] to-sky/[0.04] blur-3xl" />
        </div>

        <div className="relative max-w-[1200px] mx-auto px-6">
          <div className="max-w-[720px] mx-auto text-center">
            {/* Pill badge */}
            <div className="hero-badge">
              <Badge variant="coming" className="mb-8 py-1.5 px-4 text-[0.8125rem]">
                <Sparkles size={14} className="mr-1.5" />
                Now in early access
              </Badge>
            </div>

            {/* Headline */}
            <h1 className="hero-headline font-display text-[clamp(2.5rem,6vw,5rem)] leading-[1.05] tracking-[-0.02em] font-bold text-ink mb-6">
              Your tasks,{" "}
              <span className="relative">
                <span className="relative z-10">beautifully</span>
                <span className="hero-highlight absolute bottom-[0.1em] left-0 right-0 h-[0.3em] bg-ember/15 -rotate-[0.5deg] rounded-sm" />
              </span>
              <br />
              organized
            </h1>

            {/* Subheadline */}
            <p className="hero-subheadline text-lg md:text-xl text-ink-muted leading-relaxed mb-10 max-w-[540px] mx-auto">
              A minimal task manager for people who value focus. Plan your day,
              see your week at a glance, and get things done — without the
              clutter.
            </p>

            {/* CTAs */}
            <div className="hero-ctas flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button variant="primary" size="xl" asChild>
                <Link to="/sign-up">
                  Get Started Free
                  <ArrowRight size={18} />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/pricing">See Pricing</Link>
              </Button>
            </div>

            {/* Trust line */}
            <p className="hero-trust mt-6 text-xs text-clay">
              Free forever &middot; No credit card required
            </p>
          </div>

          {/* ─── APP PREVIEW ─── */}
          <div ref={appPreviewRef} className="app-preview mt-16 md:mt-24 relative">
            <DemoAppPreview />
            {/* Decorative glow behind preview */}
            <div className="absolute -inset-4 -z-10 rounded-[28px] bg-gradient-to-b from-ember/[0.03] to-transparent blur-2xl" />
          </div>
        </div>
      </section>

      {/* ─── FEATURES SECTION ─── */}
      <section id="features" className="py-24 md:py-32 bg-surface-sunken relative">
        <div className="absolute inset-0 grain opacity-20 pointer-events-none" />

        <div className="relative max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Designed for how you think
            </h2>
            <p className="text-lg text-ink-muted max-w-[480px] mx-auto">
              Four simple views. One beautiful interface. Everything you need to
              stay on top of your work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureCard
              icon={<Zap size={22} />}
              title="Smart Quick Add"
              description="Start typing and your task is captured. Add dates, reminders, and projects inline — or just hit Enter for rapid entry."
              color="ember"
              delay={1}
            />
            <FeatureCard
              icon={<CalendarDays size={22} />}
              title="Weekly Planning"
              description="See your entire week laid out in columns. Drag tasks between days to reschedule. Today's column always stays front and center."
              color="sky"
              delay={2}
            />
            <FeatureCard
              icon={<LayoutList size={22} />}
              title="Flexible Layouts"
              description="Undated tasks, today's priorities, weekly overview, and future planning — all in one scrollable, beautifully organized view."
              color="sage"
              delay={3}
            />
            <FeatureCard
              icon={<Bell size={22} />}
              title="Never Forget"
              description="Set one-time email reminders on any task. Get a gentle nudge when it matters, right in your inbox."
              color="amber"
              delay={4}
            />
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Three steps to clarity
            </h2>
            <p className="text-lg text-ink-muted max-w-[480px] mx-auto">
              No setup, no learning curve. Just you and your tasks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            <StepCard
              number="01"
              title="Capture"
              description="Type a task name and hit Enter. Add a date or reminder if you want — but you don't have to."
            />
            <StepCard
              number="02"
              title="Organize"
              description="Your tasks flow into the right section automatically. Drag to rearrange. See your week at a glance."
            />
            <StepCard
              number="03"
              title="Complete"
              description="Check off tasks with a satisfying animation. Review your progress. Repeat tomorrow."
            />
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-ink" />
        <div className="absolute inset-0 grain opacity-30" />
        <div className="cta-glow absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-ember/20 to-transparent rounded-full blur-3xl" />

        <div className="relative max-w-[600px] mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-chalk mb-6">
            Ready to get
            <br />
            organized?
          </h2>
          <p className="text-lg text-chalk/60 mb-10">
            Join early adopters who've already simplified their task management.
            Free forever — upgrade when you're ready.
          </p>
          <Button variant="primary" size="xl" asChild>
            <Link to="/sign-up">
              Start for Free
              <MoveRight size={18} />
            </Link>
          </Button>
          <p className="mt-4 text-xs text-chalk/30">
            No credit card &middot; Takes 30 seconds
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ─── Sub-components ─── */

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  delay?: number;
}) {
  const colorMap: Record<string, string> = {
    ember: "bg-ember/8 text-ember",
    sky: "bg-sky/8 text-sky",
    sage: "bg-sage/8 text-sage-dark",
    amber: "bg-amber/8 text-amber",
  };

  return (
    <div className="feature-card group p-8 rounded-[20px] bg-surface-raised border border-border-subtle hover:border-border-strong hover:shadow-md transition-[border-color,box-shadow] duration-300">
      <div
        className={`w-12 h-12 rounded-[12px] ${colorMap[color]} flex items-center justify-center mb-5 transition-transform duration-200 group-hover:scale-110`}
      >
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-ink-muted leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="step-card text-center md:text-left">
      <div className="step-number font-display text-6xl md:text-7xl font-bold text-bone-dark mb-4 select-none">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm text-ink-muted leading-relaxed">{description}</p>
    </div>
  );
}
