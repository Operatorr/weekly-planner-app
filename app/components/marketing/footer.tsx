import { Link } from "@tanstack/react-router";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="bg-surface-sunken border-t border-border-subtle">
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-[7px] bg-ember flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M3 9L7.5 13.5L15 4.5"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="font-display text-lg font-semibold text-ink">
                Marrow
              </span>
            </Link>
            <p className="text-sm text-ink-muted leading-relaxed">
              A minimal task manager for people who value focus and beautiful
              design.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold tracking-wider uppercase text-ink-muted mb-4">
              Product
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#features" className="text-sm text-ink-light hover:text-ink transition-colors">
                  Features
                </a>
              </li>
              <li>
                <Link to="/pricing" className="text-sm text-ink-light hover:text-ink transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <span className="text-sm text-clay">Changelog</span>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold tracking-wider uppercase text-ink-muted mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              <li>
                <span className="text-sm text-clay">About</span>
              </li>
              <li>
                <span className="text-sm text-clay">Blog</span>
              </li>
              <li>
                <span className="text-sm text-clay">Careers</span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold tracking-wider uppercase text-ink-muted mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5">
              <li>
                <span className="text-sm text-clay">Privacy Policy</span>
              </li>
              <li>
                <span className="text-sm text-clay">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-clay">
            &copy; {new Date().getFullYear()} Marrow Tasker. All rights
            reserved.
          </p>
          <div className="flex items-center gap-5">
            {/* Social icons */}
            <a href="#" className="text-clay hover:text-ink-muted transition-colors" aria-label="Twitter/X">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="#" className="text-clay hover:text-ink-muted transition-colors" aria-label="GitHub">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
