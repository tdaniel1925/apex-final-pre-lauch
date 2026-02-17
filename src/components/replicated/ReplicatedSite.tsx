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
      <section className="relative overflow-hidden bg-gradient-to-br from-[#2B4C7E] via-[#1a2c4e] to-[#0d1829] text-white">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              <div className="inline-flex items-center gap-2 mb-6">
                <LicensingStatusBadge
                  status={distributor.licensing_status}
                  verified={distributor.licensing_verified}
                  size="md"
                />
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
                Join {distributor.first_name}'s Team at{' '}
                <span className="text-blue-300">Apex Affinity Group</span>
              </h1>

              <p className="text-xl text-blue-100 mb-8">
                {isLicensed
                  ? 'Build your insurance business with a proven system, cutting-edge technology, and unlimited earning potential.'
                  : 'Join a thriving network of entrepreneurs building successful referral businesses with industry-leading support.'}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={signupUrl}
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#2B4C7E] font-bold rounded-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Join My Team →
                </a>
                <button
                  onClick={handleCopyEmail}
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all border-2 border-white/20"
                >
                  {copiedEmail ? '✓ Email Copied!' : `Contact ${distributor.first_name}`}
                </button>
              </div>

              {distributor.company_name && (
                <p className="mt-8 text-sm text-blue-200">
                  {distributor.company_name}
                </p>
              )}
            </div>

            {/* Right: Stats Card */}
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold mb-6">Why Join Our Team?</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Proven System</h4>
                      <p className="text-sm text-blue-100">Follow our step-by-step blueprint for success</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-400 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Unlimited Earning</h4>
                      <p className="text-sm text-blue-100">Your income grows with your team</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-400 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Personal Mentorship</h4>
                      <p className="text-sm text-blue-100">I'll personally guide your journey</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Training & Tools</h4>
                      <p className="text-sm text-blue-100">Access world-class resources and support</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What You Get When You Join
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to build a successful {isLicensed ? 'insurance' : 'referral'} business
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLicensed ? (
              // Benefits for Licensed Agents
              <>
                <FeatureCard
                  icon="📋"
                  title="License Management"
                  description="Simple license verification and compliance tracking"
                />
                <FeatureCard
                  icon="💰"
                  title="Advanced Commissions"
                  description="Competitive commission structure with team bonuses"
                />
                <FeatureCard
                  icon="🎯"
                  title="Lead Generation"
                  description="Access proven lead generation strategies and tools"
                />
                <FeatureCard
                  icon="📊"
                  title="Business Dashboard"
                  description="Track your sales, team growth, and earnings in real-time"
                />
                <FeatureCard
                  icon="🎓"
                  title="Elite Training"
                  description="Exclusive training from top insurance professionals"
                />
                <FeatureCard
                  icon="🤝"
                  title="Team Building"
                  description="Build and manage your own team of agents"
                />
              </>
            ) : (
              // Benefits for Non-Licensed Distributors
              <>
                <FeatureCard
                  icon="🔗"
                  title="Your Referral Link"
                  description="Simple sharing system to grow your network"
                />
                <FeatureCard
                  icon="💰"
                  title="Referral Income"
                  description="Earn from your direct referrals and team growth"
                />
                <FeatureCard
                  icon="📱"
                  title="Marketing Materials"
                  description="Professional tools to promote your business"
                />
                <FeatureCard
                  icon="📊"
                  title="Team Dashboard"
                  description="Track your network and earnings in one place"
                />
                <FeatureCard
                  icon="🎓"
                  title="Success Training"
                  description="Learn proven strategies for network building"
                />
                <FeatureCard
                  icon="🌟"
                  title="This Website"
                  description="Get your own personalized landing page like this one"
                />
              </>
            )}
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
                I'm excited to help you start your journey with Apex Affinity Group. Whether you're
                {isLicensed
                  ? ' a licensed insurance professional looking to grow your business'
                  : ' looking to build a successful referral business'}
                , I'll be here to support you every step of the way.
              </p>
              <p className="text-gray-700 mt-4">
                Click the button below to join my team and let's build your success together!
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
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of successful distributors building their future with Apex Affinity Group
          </p>
          <a
            href={signupUrl}
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#2B4C7E] font-bold text-lg rounded-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Join {distributor.first_name}'s Team →
          </a>
          <p className="mt-6 text-sm text-blue-200">
            Free to join • No credit card required • Start earning immediately
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
