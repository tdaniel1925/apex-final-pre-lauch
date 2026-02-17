'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/apex-logo.png"
              alt="Apex Affinity Group"
              width={200}
              height={60}
              className="h-14 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link
              href="/"
              className="text-[#2B4C7E] hover:text-[#DC2626] transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-[#2B4C7E] hover:text-[#DC2626] transition-colors font-medium"
            >
              About Us
            </Link>
            <Link
              href="/services"
              className="text-[#2B4C7E] hover:text-[#DC2626] transition-colors font-medium"
            >
              Services
            </Link>
            <Link
              href="/opportunity"
              className="text-[#2B4C7E] hover:text-[#DC2626] transition-colors font-medium"
            >
              Opportunity
            </Link>
            <Link
              href="/contact"
              className="text-[#2B4C7E] hover:text-[#DC2626] transition-colors font-medium"
            >
              Contact
            </Link>
          </div>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Button
              asChild
              className="bg-[#DC2626] hover:bg-[#2B4C7E] text-white px-6 py-2 rounded-md transition-colors"
            >
              <Link href="/signup">Join Our Team</Link>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`block h-0.5 w-full bg-[#2B4C7E] transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 w-full bg-[#2B4C7E] transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-full bg-[#2B4C7E] transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-[#2B4C7E] hover:text-[#DC2626] transition-colors font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/about"
                className="text-[#2B4C7E] hover:text-[#DC2626] transition-colors font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                href="/services"
                className="text-[#2B4C7E] hover:text-[#DC2626] transition-colors font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link
                href="/opportunity"
                className="text-[#2B4C7E] hover:text-[#DC2626] transition-colors font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Opportunity
              </Link>
              <Link
                href="/contact"
                className="text-[#2B4C7E] hover:text-[#DC2626] transition-colors font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Button
                asChild
                className="bg-[#DC2626] hover:bg-[#2B4C7E] text-white w-full"
              >
                <Link href="/signup">Join Our Team</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
