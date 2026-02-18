'use client';

// =============================================
// Replicated Website Component
// Personalized landing page for each distributor
// =============================================

import { useState } from 'react';
import Link from 'next/link';
import type { Distributor } from '@/lib/types';
import { LicensingStatusBadge } from '@/components/common';

interface ReplicatedSiteProps {
  distributor: Distributor;
}

export default function ReplicatedSite({ distributor }: ReplicatedSiteProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const signupUrl = `/signup?ref=${distributor.slug}`;
  const isLicensed = distributor.licensing_status === 'licensed';

  const handleCopyEmail = async () => {
    await navigator.clipboard.writeText(distributor.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/apex-logo.png" alt="Apex Affinity Group" className="h-12 w-auto" />
              <div className="hidden sm:block h-8 w-px bg-gray-300" />
              <div className="hidden sm:block">
                <p className="text-sm text-gray-600">Independent Distributor</p>
                <p className="font-semibold text-gray-900">
                  {distributor.first_name} {distributor.last_name}
                </p>
              </div>
            </div>
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Member Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center bg-gradient-to-br from-[#1a2c4e] via-[#2B4C7E] to-[#3d5a7f] overflow-hidden">
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Content */}
        <div className="relative z-10 mt-20 h-full flex items-center">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              {/* Hero Content */}
              <div className="lg:col-span-7">
                <div className="space-y-3 lg:space-y-4">
                  <div className="inline-flex items-center gap-2">
                    <span className="inline-block text-[#DC2626] font-semibold text-xs md:text-sm tracking-wide uppercase">
                      Join {distributor.first_name}'s Team
                    </span>
                    <LicensingStatusBadge
                      status={distributor.licensing_status}
                      verified={distributor.licensing_verified}
                      size="sm"
                    />
                  </div>

                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
                    Build Your Insurance Business with {distributor.first_name}
                  </h1>

                  <p className="text-base md:text-lg text-white/90 leading-snug pr-4 lg:pr-12">
                    Start earning immediately with ancillary products, then scale to full insurance sales. Access multiple carriers, AI-powered tools, and earn from both your sales and your team's growth. 100% free to join.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 pt-3 lg:pt-4">
                    <a
                      href={signupUrl}
                      className="inline-flex items-center justify-center bg-[#DC2626] hover:bg-gradient-to-r hover:from-[#DC2626] hover:to-[#B91C1C] text-white px-5 py-3 lg:px-7 lg:py-4 text-sm lg:text-base font-bold rounded-lg transition-all shadow-lg"
                    >
                      Join {distributor.first_name}'s Team →
                    </a>
                    <button
                      onClick={handleCopyEmail}
                      className="inline-flex items-center justify-center border-2 border-white text-white hover:bg-white hover:text-[#2B4C7E] px-5 py-3 lg:px-7 lg:py-4 text-sm lg:text-base font-semibold rounded-lg transition-all"
                    >
                      {copiedEmail ? '✓ Email Copied!' : `Contact ${distributor.first_name}`}
                    </button>
                  </div>

                  {distributor.company_name && (
                    <p className="text-sm text-white/80 pt-2">
                      {distributor.company_name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Video Box - Extended to Right Edge */}
          <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-[45%] max-w-2xl">
            <div className="bg-white rounded-3xl rounded-r-none overflow-hidden shadow-2xl">
              <div className="relative aspect-square">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src="/videos/flag-waving.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>

          {/* Mobile Video */}
          <div className="lg:hidden container mx-auto px-4 mt-8">
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-md mx-auto">
              <div className="relative aspect-square">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src="/videos/flag-waving.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator - Hidden on mobile */}
        <div className="hidden md:block absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/50 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Why Join Section - Moved Below Hero */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Join {distributor.first_name}'s Team?
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Start Earning Day 1</h3>
              <p className="text-sm text-gray-600">Sell ancillary products immediately - no license required</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">$0 to Join</h3>
              <p className="text-sm text-gray-600">No fees, no monthly dues, no hidden costs</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Own Your Business</h3>
              <p className="text-sm text-gray-600">100% book ownership - your clients forever</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Personal Mentorship</h3>
              <p className="text-sm text-gray-600">{distributor.first_name} will personally guide you</p>
            </div>
          </div>
        </div>
      </section>

      {/* Original Stats Card Content - Now Removed Since We Moved It */}
      {/* The content was integrated into the new "Why Join Section" above */}


      {/* What You Get Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What You Get When You Join {distributor.first_name}'s Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to start earning immediately and build a successful insurance business
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon="⚡"
              title="Start Earning Immediately"
              description="Sell telemedicine, roadside assistance, identity theft protection, legal services - no license required"
            />
            <FeatureCard
              icon="💰"
              title="100% Book Ownership"
              description="You own your clients and renewals forever. Your business, your asset."
            />
            <FeatureCard
              icon="🎓"
              title="Full Licensing Support"
              description="When ready, we guide you through getting licensed to sell insurance products"
            />
            <FeatureCard
              icon="🤖"
              title="AI-Powered CRM"
              description="Automated follow-ups, lead tracking, and sales tools included free"
            />
            <FeatureCard
              icon="📊"
              title="Real-Time Dashboard"
              description="Track your sales, team growth, and earnings all in one place"
            />
            <FeatureCard
              icon="🤝"
              title="Dual Income Streams"
              description="Earn from your direct sales plus team development bonuses"
            />
          </div>
        </div>
      </section>

      {/* About Your Sponsor */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-[#2B4C7E] to-[#1a2c4e] rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">
                  {distributor.first_name.charAt(0)}
                  {distributor.last_name.charAt(0)}
                </span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {distributor.first_name} {distributor.last_name}
              </h2>
              <div className="flex items-center justify-center gap-2 mb-4">
                <LicensingStatusBadge
                  status={distributor.licensing_status}
                  verified={distributor.licensing_verified}
                  size="sm"
                />
              </div>
              {distributor.company_name && (
                <p className="text-lg text-gray-600">{distributor.company_name}</p>
              )}
            </div>

            <div className="prose prose-lg max-w-none text-center">
              <p className="text-gray-700">
                I'm excited to help you start your journey with Apex Affinity Group. You can start earning immediately selling ancillary products (no license needed), and when you're ready, I'll guide you through getting licensed to sell insurance.
              </p>
              <p className="text-gray-700 mt-4">
                The best part? It's 100% free to join, you'll own your entire book of business, and you can earn from both your sales and team development. Let's build your success together!
              </p>
            </div>

            <div className="mt-8 text-center">
              <a
                href={signupUrl}
                className="inline-flex items-center justify-center px-8 py-4 bg-[#2B4C7E] text-white font-bold text-lg rounded-lg hover:bg-[#1a2c4e] transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Join {distributor.first_name}'s Team Now →
              </a>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <button onClick={handleCopyEmail} className="hover:text-[#2B4C7E] transition-colors">
                    {copiedEmail ? '✓ Copied!' : distributor.email}
                  </button>
                </div>
                {distributor.phone && (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{distributor.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-r from-[#2B4C7E] to-[#1a2c4e] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Build Your Business?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Start earning within 24 hours. No license needed. 100% free to join.
          </p>
          <a
            href={signupUrl}
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#2B4C7E] font-bold text-lg rounded-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Join {distributor.first_name}'s Team →
          </a>
          <p className="mt-6 text-sm text-blue-200">
            Free to join • Own your business 100% • Earn from sales + team bonuses
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <img src="/apex-logo.png" alt="Apex Affinity Group" className="h-10 w-auto mx-auto mb-4 opacity-75" />
            <p className="text-sm">
              © {new Date().getFullYear()} Apex Affinity Group. All rights reserved.
            </p>
            <p className="text-xs mt-2">
              Independent Distributor: {distributor.first_name} {distributor.last_name}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Feature Card Component
interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
