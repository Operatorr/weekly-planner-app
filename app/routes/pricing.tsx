import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Check, X, ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  head: () => ({
    meta: [
      { title: "Pricing — DoMarrow" },
      { name: "description", content: "Simple, transparent pricing for DoMarrow. Start free, upgrade when you need more. No surprises, no hidden fees." },
      { property: "og:title", content: "Pricing — DoMarrow" },
      { property: "og:description", content: "Start free, upgrade when you need more. Simple, transparent pricing with no hidden fees." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Pricing — DoMarrow" },
      { name: "twitter:description", content: "Start free, upgrade when you need more. Simple, transparent pricing with no hidden fees." },
    ],
  }),
});

function PricingPage() {
  const [yearly, setYearly] = useState(true);

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <section className="pt-32 pb-20 md:pt-44 md:pb-24">
        <div className="max-w-[1200px] mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16 max-w-[600px] mx-auto">
            <h1 className="animate-fade-up font-display text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Simple, transparent
              <br />
              pricing
            </h1>
            <p className="animate-fade-up delay-1 text-lg text-ink-muted">
              Start free, upgrade when you need more. No surprises, no hidden
              fees.
            </p>
          </div>

          {/* Billing toggle */}
          <div className="animate-fade-up delay-2 flex items-center justify-center gap-3 mb-12">
            <button
              type="button"
              className={`text-sm transition-colors cursor-pointer ${
                !yearly ? "text-ink font-medium" : "text-ink-muted"
              }`}
              onClick={() => setYearly(false)}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(!yearly)}
              className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                yearly ? "bg-ember" : "bg-clay-light"
              }`}
              aria-label="Toggle billing period"
            >
              <div
                className={`absolute top-1 w-5 h-5 rounded-full bg-chalk shadow-sm transition-transform duration-200 ${
                  yearly ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <button
              type="button"
              className={`text-sm transition-colors cursor-pointer ${
                yearly ? "text-ink font-medium" : "text-ink-muted"
              }`}
              onClick={() => setYearly(true)}
            >
              Yearly
            </button>
            {yearly && (
              <Badge variant="sage" className="ml-1 animate-scale-in">
                Save 25%
              </Badge>
            )}
          </div>

          {/* Pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[840px] mx-auto mb-20">
            {/* Free tier */}
            <Card className="animate-fade-up delay-2 p-8 flex flex-col">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-1">Free</h2>
                <p className="text-sm text-ink-muted">
                  Everything you need to get started
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-5xl font-bold">$0</span>
                  <span className="text-ink-muted text-sm">/ forever</span>
                </div>
              </div>

              <Button variant="primary" size="lg" className="w-full mb-8" asChild>
                <Link to="/sign-up">
                  Get Started Free
                  <ArrowRight size={16} />
                </Link>
              </Button>

              <ul className="space-y-3 flex-1">
                <FeatureItem included>1 personal project</FeatureItem>
                <FeatureItem included>Smart quick add</FeatureItem>
                <FeatureItem included>One-time task reminders</FeatureItem>
                <FeatureItem included>Flexible list layout</FeatureItem>
                <FeatureItem included>1 saved filter view</FeatureItem>
                <FeatureItem included>1-week activity history</FeatureItem>
                <FeatureItem included>
                  Email &amp; calendar integrations
                </FeatureItem>
              </ul>
            </Card>

            {/* Pro tier */}
            <Card className="animate-fade-up delay-3 p-8 flex flex-col relative overflow-hidden border-ember/20">
              {/* Coming soon ribbon */}
              <div className="absolute top-5 -right-8 bg-gradient-to-r from-ember to-amber text-chalk text-[10px] font-bold tracking-wider uppercase py-1 px-10 rotate-45 shadow-md">
                Coming Soon
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-semibold">Pro</h2>
                  <Sparkles size={16} className="text-ember" />
                </div>
                <p className="text-sm text-ink-muted">
                  For power users who want it all
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-5xl font-bold">
                    ${yearly ? "3" : "4"}
                  </span>
                  <span className="text-ink-muted text-sm">/ month</span>
                </div>
                {yearly && (
                  <p className="text-xs text-ink-muted mt-1">
                    $36 billed yearly
                  </p>
                )}
              </div>

              <Button
                variant="outline"
                size="lg"
                className="w-full mb-8 opacity-60 cursor-not-allowed"
                disabled
              >
                Coming Soon
              </Button>

              <p className="text-xs font-medium text-ember mb-3">
                Everything in Free, plus:
              </p>
              <ul className="space-y-3 flex-1">
                <FeatureItem included>Up to 300 projects</FeatureItem>
                <FeatureItem included>Board (Kanban) layout</FeatureItem>
                <FeatureItem included>Calendar layout</FeatureItem>
                <FeatureItem included>Task duration tracking</FeatureItem>
                <FeatureItem included>
                  Custom reminders (recurring, snooze)
                </FeatureItem>
                <FeatureItem included>150 saved filter views</FeatureItem>
                <FeatureItem included>Unlimited activity history</FeatureItem>
                <FeatureItem included>
                  Task Assist AI
                </FeatureItem>
                <FeatureItem included>Deadlines &amp; due dates</FeatureItem>
              </ul>
            </Card>
          </div>

          {/* Feature comparison table */}
          <div className="max-w-[840px] mx-auto">
            <h2 className="font-display text-2xl font-bold text-center mb-8">
              Feature comparison
            </h2>

            <div className="rounded-[16px] border border-border-subtle overflow-hidden">
              <table className="w-full text-sm [font-variant-numeric:tabular-nums]">
                <thead>
                  <tr className="bg-surface-sunken border-b border-border-subtle">
                    <th className="text-left px-6 py-4 font-medium text-ink-muted">
                      Feature
                    </th>
                    <th className="text-center px-6 py-4 font-medium text-ink-muted w-[120px]">
                      Free
                    </th>
                    <th className="text-center px-6 py-4 font-medium text-ink-muted w-[120px]">
                      Pro
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <ComparisonRow
                    feature="Personal projects"
                    free="1"
                    pro="300"
                  />
                  <ComparisonRow
                    feature="Smart quick add"
                    free={true}
                    pro={true}
                  />
                  <ComparisonRow
                    feature="Task reminders"
                    free="One-time"
                    pro="Custom"
                  />
                  <ComparisonRow
                    feature="List layout"
                    free={true}
                    pro={true}
                  />
                  <ComparisonRow
                    feature="Board (Kanban) layout"
                    free={false}
                    pro={true}
                  />
                  <ComparisonRow
                    feature="Calendar layout"
                    free={false}
                    pro={true}
                  />
                  <ComparisonRow
                    feature="Task duration"
                    free={false}
                    pro={true}
                  />
                  <ComparisonRow
                    feature="Filter views"
                    free="1"
                    pro="150"
                  />
                  <ComparisonRow
                    feature="Activity history"
                    free="1 week"
                    pro="Unlimited"
                  />
                  <ComparisonRow
                    feature="Email & calendar integration"
                    free={true}
                    pro={true}
                  />
                  <ComparisonRow
                    feature="Task Assist (AI)"
                    free={false}
                    pro={true}
                  />
                  <ComparisonRow
                    feature="Deadlines"
                    free={false}
                    pro={true}
                    last
                  />
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ */}
          <div className="max-w-[600px] mx-auto mt-20">
            <h2 className="font-display text-2xl font-bold text-center mb-10">
              Questions?
            </h2>

            <div className="space-y-6">
              <FaqItem
                q="Is the Free tier really free forever?"
                a="Yes! The Free tier has no time limit and no credit card required. Use it as long as you like."
              />
              <FaqItem
                q="When will Pro be available?"
                a="We're working on Pro features now. We'll announce the launch date soon. Early Free users may get a discount."
              />
              <FaqItem
                q="Can I export my data?"
                a="Absolutely. Your data is yours. We support JSON export for all tasks and projects."
              />
              <FaqItem
                q="What happens to my tasks if I downgrade from Pro?"
                a="Your tasks remain safe. You'll keep read access to everything, but some Pro features (like extra projects) will become read-only until you re-subscribe."
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FeatureItem({
  children,
  included,
}: {
  children: React.ReactNode;
  included: boolean;
}) {
  return (
    <li className="flex items-start gap-2.5">
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
          included ? "bg-sage/15 text-sage-dark" : "bg-bone text-clay"
        }`}
      >
        {included ? (
          <Check size={12} strokeWidth={3} />
        ) : (
          <X size={10} strokeWidth={3} />
        )}
      </div>
      <span className={included ? "text-ink-light" : "text-clay"}>
        {children}
      </span>
    </li>
  );
}

function ComparisonRow({
  feature,
  free,
  pro,
  last,
}: {
  feature: string;
  free: boolean | string;
  pro: boolean | string;
  last?: boolean;
}) {
  const renderValue = (val: boolean | string) => {
    if (val === true)
      return (
        <div className="w-5 h-5 rounded-full bg-sage/15 text-sage-dark flex items-center justify-center mx-auto">
          <Check size={12} strokeWidth={3} />
        </div>
      );
    if (val === false)
      return <span className="text-clay">&mdash;</span>;
    return <span className="text-ink-light font-medium">{val}</span>;
  };

  return (
    <tr className={last ? "" : "border-b border-border-subtle"}>
      <td className="px-6 py-3.5 text-ink-light">{feature}</td>
      <td className="text-center px-6 py-3.5">{renderValue(free)}</td>
      <td className="text-center px-6 py-3.5">{renderValue(pro)}</td>
    </tr>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="border-b border-border-subtle pb-6">
      <h4 className="font-medium text-ink mb-2">{q}</h4>
      <p className="text-sm text-ink-muted leading-relaxed">{a}</p>
    </div>
  );
}
