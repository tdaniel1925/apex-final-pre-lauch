'use client';

// =============================================
// Profile V2 - Template-styled Profile & Settings
// Matches SmartViz design system 100%
// =============================================

import Link from 'next/link';
import { useState } from 'react';

export default function ProfileV2() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-neutral-50">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 bg-white border-r border-neutral-200 flex flex-col z-20">
        <div className="p-6 flex items-center gap-3 border-b border-neutral-100">
          <div className="w-10 h-10 bg-neutral-900 rounded-small flex items-center justify-center text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className="font-heading font-bold text-xl text-neutral-900">Apex Affinity</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <div className="mb-6">
            <p className="px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Main</p>
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-small transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link href="/dashboard-v2" className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-small transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              <span className="font-medium">Dashboard V2</span>
              <span className="ml-auto bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full font-bold">NEW</span>
            </Link>
            <Link href="/dashboard/team" className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-small transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-medium">My Team</span>
            </Link>
          </div>

          <div className="mb-6">
            <p className="px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Management</p>
            <Link href="/profile-v2" className="flex items-center gap-3 px-4 py-3 bg-neutral-900 text-white rounded-small shadow-custom transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">Profile V2</span>
            </Link>
            <Link href="/reports-v2" className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-small transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium">Reports V2</span>
            </Link>
          </div>
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-primary-500 rounded-large p-5 text-white relative overflow-hidden shadow-custom">
            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-white opacity-20 rounded-full"></div>
            <div className="relative z-10">
              <h4 className="font-heading font-bold text-lg mb-1">Pro Features</h4>
              <p className="text-primary-50 text-sm mb-3 opacity-90">Unlock advanced network tools</p>
              <button className="w-full bg-white text-primary-600 font-bold py-2 rounded-small text-sm hover:bg-primary-50 transition-colors">
                Upgrade Now
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-6 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold border-2 border-white shadow-sm">
              JD
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-900">John Distributor</p>
              <p className="text-xs text-neutral-500">john@example.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="font-heading text-2xl font-bold text-neutral-900">Profile & Settings</h1>
              <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
                <svg className="w-3 h-3 mr-1.5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Account Verified
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="px-4 py-2 bg-neutral-900 text-white rounded-small text-sm font-semibold hover:bg-neutral-700 transition-colors">
                Back to Dashboard
              </Link>
            </div>
          </div>

          {/* Settings Tabs */}
          <div className="px-6 flex gap-1 border-t border-neutral-100">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === 'profile'
                  ? 'text-neutral-900 border-neutral-900'
                  : 'text-neutral-500 border-transparent hover:text-neutral-700'
              }`}
            >
              <svg className="w-4 h-4 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === 'security'
                  ? 'text-neutral-900 border-neutral-900'
                  : 'text-neutral-500 border-transparent hover:text-neutral-700'
              }`}
            >
              <svg className="w-4 h-4 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Security
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === 'billing'
                  ? 'text-neutral-900 border-neutral-900'
                  : 'text-neutral-500 border-transparent hover:text-neutral-700'
              }`}
            >
              <svg className="w-4 h-4 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Billing & Plan
            </button>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-y-auto">
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="max-w-4xl">
              <div className="bg-white rounded-large border border-neutral-200 shadow-custom p-6 mb-6">
                <h3 className="font-heading font-bold text-lg text-neutral-900 mb-4">Personal Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">First Name</label>
                    <input
                      type="text"
                      defaultValue="John"
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-small text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      defaultValue="Distributor"
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-small text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      defaultValue="john@example.com"
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-small text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      defaultValue="+1 (555) 123-4567"
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-small text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button className="px-5 py-2.5 border border-neutral-200 text-neutral-700 rounded-small text-sm font-semibold hover:bg-neutral-50 transition-colors">
                    Cancel
                  </button>
                  <button className="px-5 py-2.5 bg-neutral-900 text-white rounded-small text-sm font-semibold hover:bg-neutral-700 transition-colors shadow-custom">
                    Save Changes
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-large border border-neutral-200 shadow-custom p-6">
                <h3 className="font-heading font-bold text-lg text-neutral-900 mb-4">Profile Photo</h3>

                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-2xl border-4 border-white shadow-custom">
                    JD
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-neutral-600 mb-3">Upload a new profile photo or avatar</p>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 bg-neutral-900 text-white rounded-small text-sm font-semibold hover:bg-neutral-700 transition-colors">
                        Upload Photo
                      </button>
                      <button className="px-4 py-2 border border-neutral-200 text-neutral-700 rounded-small text-sm font-semibold hover:bg-neutral-50 transition-colors">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="max-w-4xl">
              <div className="bg-white rounded-large border border-neutral-200 shadow-custom p-6 mb-6">
                <h3 className="font-heading font-bold text-lg text-neutral-900 mb-4">Change Password</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-small text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">New Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-small text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-small text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button className="px-5 py-2.5 bg-neutral-900 text-white rounded-small text-sm font-semibold hover:bg-neutral-700 transition-colors shadow-custom">
                    Update Password
                  </button>
                </div>
              </div>

              <div className="bg-primary-50 border border-primary-200 rounded-large p-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-large bg-primary-100 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-heading font-bold text-neutral-900 mb-1">Two-Factor Authentication</h4>
                    <p className="text-sm text-neutral-600 mb-4">Add an extra layer of security to your account</p>
                    <button className="px-4 py-2 bg-neutral-900 text-white rounded-small text-sm font-semibold hover:bg-neutral-700 transition-colors">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BILLING TAB */}
          {activeTab === 'billing' && (
            <div className="max-w-4xl">
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-large p-8 text-white mb-6 shadow-custom-hover">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-primary-100 text-sm mb-1">Current Plan</p>
                    <h3 className="font-heading font-bold text-3xl mb-2">Free Plan</h3>
                    <p className="text-primary-50 text-sm">Upgrade to unlock premium features</p>
                  </div>
                  <button className="px-6 py-3 bg-white text-primary-600 rounded-small font-bold hover:bg-primary-50 transition-colors shadow-lg">
                    Upgrade to Pro
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-large border border-neutral-200 p-6 shadow-custom">
                  <h4 className="font-heading font-bold text-neutral-900 mb-4">Free</h4>
                  <p className="text-3xl font-extrabold text-neutral-900 mb-1">$0</p>
                  <p className="text-sm text-neutral-500 mb-4">per month</p>
                  <ul className="space-y-2 text-sm text-neutral-600">
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-primary-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Basic dashboard
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-primary-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Up to 50 team members
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-large border-2 border-primary-500 p-6 shadow-custom-hover relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary-500 text-white text-xs font-bold rounded-full">
                    POPULAR
                  </div>
                  <h4 className="font-heading font-bold text-neutral-900 mb-4">Pro</h4>
                  <p className="text-3xl font-extrabold text-neutral-900 mb-1">$49</p>
                  <p className="text-sm text-neutral-500 mb-4">per month</p>
                  <ul className="space-y-2 text-sm text-neutral-600 mb-6">
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-primary-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Advanced analytics
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-primary-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Unlimited team members
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-primary-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Priority support
                    </li>
                  </ul>
                  <button className="w-full px-4 py-2.5 bg-primary-500 text-white rounded-small font-bold hover:bg-primary-600 transition-colors">
                    Upgrade Now
                  </button>
                </div>

                <div className="bg-white rounded-large border border-neutral-200 p-6 shadow-custom">
                  <h4 className="font-heading font-bold text-neutral-900 mb-4">Enterprise</h4>
                  <p className="text-3xl font-extrabold text-neutral-900 mb-1">Custom</p>
                  <p className="text-sm text-neutral-500 mb-4">Contact us</p>
                  <ul className="space-y-2 text-sm text-neutral-600">
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-primary-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Custom features
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-primary-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Dedicated support
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
