"use client";

import { useState } from "react";
import { Menu, X, BookOpen } from "lucide-react";

const navigation = [
  { name: "Features", href: "#features" },
  { name: "Privacy", href: "#privacy" },
  { name: "Blog", href: "#blog" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-warm-50/95 backdrop-blur-sm border-b border-sage-100">
      <nav
        className="container-max flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-sage-600 rounded-lg group-hover:bg-sage-700 transition-colors">
            <BookOpen className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <span className="text-xl font-semibold text-sage-900">JournalSpace</span>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sage-600 hover:text-sage-900 font-medium transition-colors"
            >
              {item.name}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <a href="#get-started" className="btn-primary">
            Get Started
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden p-2 text-sage-600 hover:text-sage-900 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden bg-warm-50 border-b border-sage-100"
        >
          <div className="px-4 py-4 space-y-4">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block text-sage-600 hover:text-sage-900 font-medium py-2 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <a
              href="#get-started"
              className="btn-primary w-full text-center mt-4"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
