import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const { isSignedIn } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "glass border-b border-border-subtle shadow-sm"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-[8px] bg-ember flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M3 9L7.5 13.5L15 4.5"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            Marrow
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm text-ink-muted hover:text-ink transition-colors"
          >
            Features
          </a>
          <Link
            to="/pricing"
            className="text-sm text-ink-muted hover:text-ink transition-colors"
          >
            Pricing
          </Link>
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          {isSignedIn ? (
            <Button variant="primary" size="sm" asChild>
              <Link to="/app">Go to App</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/sign-in">Sign In</Link>
              </Button>
              <Button variant="primary" size="sm" asChild>
                <Link to="/sign-up">Get Started Free</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 -mr-2 text-ink-light hover:text-ink transition-colors"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-border-subtle animate-fade-in">
          <div className="px-6 py-4 space-y-4">
            <a
              href="#features"
              className="block text-sm text-ink-muted hover:text-ink"
              onClick={() => setMobileOpen(false)}
            >
              Features
            </a>
            <Link
              to="/pricing"
              className="block text-sm text-ink-muted hover:text-ink"
              onClick={() => setMobileOpen(false)}
            >
              Pricing
            </Link>
            <div className="pt-2 border-t border-border-subtle space-y-2">
              {isSignedIn ? (
                <Button variant="primary" size="sm" className="w-full" asChild>
                  <Link to="/app" onClick={() => setMobileOpen(false)}>Go to App</Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to="/sign-in" onClick={() => setMobileOpen(false)}>Sign In</Link>
                  </Button>
                  <Button variant="primary" size="sm" className="w-full" asChild>
                    <Link to="/sign-up" onClick={() => setMobileOpen(false)}>Get Started Free</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
