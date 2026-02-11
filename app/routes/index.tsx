import { createFileRoute, Link } from "@tanstack/react-router";
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
  Check,
  Sparkles,
  MoveRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[40%] -right-[20%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-ember/[0.04] to-amber/[0.06] blur-3xl" />
          <div className="absolute -bottom-[30%] -left-[15%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-sage/[0.04] to-sky/[0.04] blur-3xl" />
        </div>

        <div className="relative max-w-[1200px] mx-auto px-6">
          <div className="max-w-[720px] mx-auto text-center">
            {/* Pill badge */}
            <div className="animate-fade-up">
              <Badge variant="coming" className="mb-8 py-1.5 px-4 text-[0.8125rem]">
                <Sparkles size={14} className="mr-1.5" />
                Now in early access
              </Badge>
            </div>

            {/* Headline */}
            <h1 className="animate-fade-up delay-1 font-display text-[clamp(2.5rem,6vw,5rem)] leading-[1.05] tracking-[-0.02em] font-bold text-ink mb-6">
              Your tasks,{" "}
              <span className="relative">
                <span className="relative z-10">beautifully</span>
                <span className="absolute bottom-[0.1em] left-0 right-0 h-[0.3em] bg-ember/15 -rotate-[0.5deg] rounded-sm" />
              </span>
              <br />
              organized
            </h1>

            {/* Subheadline */}
            <p className="animate-fade-up delay-2 text-lg md:text-xl text-ink-muted leading-relaxed mb-10 max-w-[540px] mx-auto">
              A minimal task manager for people who value focus. Plan your day,
              see your week at a glance, and get things done — without the
              clutter.
            </p>

            {/* CTAs */}
            <div className="animate-fade-up delay-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button variant="primary" size="xl" asChild>
                <Link to="/app">
                  Get Started Free
                  <ArrowRight size={18} />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/pricing">See Pricing</Link>
              </Button>
            </div>

            {/* Trust line */}
            <p className="animate-fade-up delay-4 mt-6 text-xs text-clay">
              Free forever &middot; No credit card required
            </p>
          </div>

          {/* ─── APP PREVIEW ─── */}
          <div className="animate-fade-up delay-5 mt-16 md:mt-24 relative">
            <div className="relative rounded-[20px] border border-border bg-surface-raised shadow-xl overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border-subtle bg-bone/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-clay-light" />
                  <div className="w-3 h-3 rounded-full bg-clay-light" />
                  <div className="w-3 h-3 rounded-full bg-clay-light" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-bone rounded-[8px] px-4 py-1 text-xs text-clay max-w-[280px] w-full text-center">
                    app.marrowtasker.com
                  </div>
                </div>
                <div className="w-[54px]" />
              </div>

              {/* App mockup */}
              <div className="p-1">
                <div className="flex min-h-[420px]">
                  {/* Sidebar mock */}
                  <div className="hidden md:flex flex-col w-[200px] border-r border-border-subtle p-4 gap-1.5">
                    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] bg-ember/8 text-ember">
                      <div className="w-4 h-4 rounded-full bg-ember/20" />
                      <span className="text-sm font-medium">Today</span>
                      <span className="ml-auto text-xs bg-ember/10 rounded-full px-1.5 py-0.5">3</span>
                    </div>
                    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] text-ink-muted hover:bg-bone/60">
                      <div className="w-4 h-4 rounded-full bg-sky/20" />
                      <span className="text-sm">Upcoming</span>
                    </div>
                    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] text-ink-muted hover:bg-bone/60">
                      <div className="w-4 h-4 rounded-full bg-clay-light" />
                      <span className="text-sm">Someday</span>
                    </div>
                    <div className="my-3 h-px bg-border-subtle" />
                    <div className="text-[10px] font-semibold tracking-wider uppercase text-clay px-2.5 mb-1">Projects</div>
                    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] text-ink-muted hover:bg-bone/60">
                      <div className="w-2.5 h-2.5 rounded-full bg-ember" />
                      <span className="text-sm">Personal</span>
                    </div>
                  </div>

                  {/* Main content mock */}
                  <div className="flex-1 p-6 space-y-4">
                    {/* Add task bar */}
                    <div className="flex items-center gap-3 px-4 py-3 rounded-[12px] border border-dashed border-clay-light text-clay">
                      <div className="w-5 h-5 rounded-full border-2 border-clay-light" />
                      <span className="text-sm">Add a task&#8230;</span>
                    </div>

                    {/* Task items */}
                    <div className="space-y-1">
                      <MockTaskItem
                        name="Review quarterly goals"
                        badge="Today"
                        badgeColor="sky"
                        hasChecklist="1/4"
                      />
                      <MockTaskItem
                        name="Buy groceries for the week"
                        badge="Today"
                        badgeColor="sky"
                      />
                      <MockTaskItem
                        name="Reply to Sarah's email"
                        badge="Overdue"
                        badgeColor="destructive"
                      />
                      <MockTaskItem
                        name="Update portfolio website bio"
                        completed
                      />
                    </div>

                    {/* Weekly preview */}
                    <div className="mt-6 pt-4 border-t border-border-subtle">
                      <div className="text-xs font-semibold tracking-wider uppercase text-clay mb-3">
                        This Week
                      </div>
                      <div className="grid grid-cols-7 gap-1.5">
                        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                          <div
                            key={i}
                            className={`text-center py-2 rounded-[8px] text-xs ${
                              i === 1
                                ? "bg-ember/8 text-ember font-semibold"
                                : "text-clay"
                            }`}
                          >
                            {d}
                            {(i === 2 || i === 3 || i === 5) && (
                              <div className="mt-1.5 mx-auto w-1.5 h-1.5 rounded-full bg-ink/20" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-ember/20 to-transparent rounded-full blur-3xl" />

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
            <Link to="/app">
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

function MockTaskItem({
  name,
  badge,
  badgeColor,
  completed,
  hasChecklist,
}: {
  name: string;
  badge?: string;
  badgeColor?: string;
  completed?: boolean;
  hasChecklist?: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 rounded-[10px] transition-colors ${
        completed ? "opacity-50" : "hover:bg-bone/60"
      }`}
    >
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          completed
            ? "border-sage bg-sage"
            : "border-clay-light hover:border-ember"
        }`}
      >
        {completed && (
          <Check size={12} className="text-white" strokeWidth={3} />
        )}
      </div>
      <span
        className={`text-sm flex-1 ${
          completed ? "line-through text-ink-muted" : "text-ink"
        }`}
      >
        {name}
      </span>
      {badge && (
        <span
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
            badgeColor === "destructive"
              ? "bg-red-50 text-red-500"
              : badgeColor === "sky"
                ? "bg-sky/10 text-sky"
                : "bg-bone text-ink-muted"
          }`}
        >
          {badge}
        </span>
      )}
      {hasChecklist && (
        <span className="text-[10px] text-clay">{hasChecklist}</span>
      )}
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  delay: number;
}) {
  const colorMap: Record<string, string> = {
    ember: "bg-ember/8 text-ember",
    sky: "bg-sky/8 text-sky",
    sage: "bg-sage/8 text-sage-dark",
    amber: "bg-amber/8 text-amber",
  };

  return (
    <div className={`group p-8 rounded-[20px] bg-surface-raised border border-border-subtle hover:border-border-strong hover:shadow-md transition-[border-color,box-shadow] duration-300`}>
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
    <div className="text-center md:text-left">
      <div className="font-display text-6xl md:text-7xl font-bold text-bone-dark mb-4 select-none">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm text-ink-muted leading-relaxed">{description}</p>
    </div>
  );
}
