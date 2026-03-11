'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ProfileV2() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 bg-white border-r border-neutral-200 flex flex-col z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-neutral-900 rounded-small flex items-center justify-center text-white">
            <i className="ri-bar-chart-box-fill text-xl"></i>
          </div>
          <span className="font-heading font-bold text-xl text-neutral-900">SmartViz</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <div className="mb-6">
            <p className="px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Main</p>
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-small transition-all">
              <i className="ri-dashboard-line"></i>
              <span className="font-medium">Dashboard</span>
            </Link>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-small transition-all">
              <i className="ri-file-excel-line"></i>
              <span className="font-medium">Data Sources</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-small transition-all">
              <i className="ri-robot-line"></i>
              <span className="font-medium">AI Analysis</span>
              <span className="ml-auto bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full font-bold">NEW</span>
            </a>
          </div>

          <div className="mb-6">
            <p className="px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Management</p>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-small transition-all">
              <i className="ri-upload-cloud-line"></i>
              <span className="font-medium">Manual Upload</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-small transition-all">
              <i className="ri-links-line"></i>
              <span className="font-medium">Integrations</span>
            </a>
            <Link href="/profile-v2" className="flex items-center gap-3 px-4 py-3 bg-neutral-900 text-white rounded-small shadow-custom transition-all">
              <i className="ri-user-settings-line"></i>
              <span className="font-medium">Profile &amp; Plan</span>
            </Link>
            <Link href="/reports-v2" className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-small transition-all">
              <i className="ri-file-chart-line"></i>
              <span className="font-medium">Reports</span>
            </Link>
          </div>
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-primary-500 rounded-large p-5 text-white relative overflow-hidden shadow-custom">
            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-white opacity-20 rounded-full"></div>
            <div className="relative z-10">
              <h4 className="font-heading font-bold text-lg mb-1">Pro Plan</h4>
              <p className="text-primary-50 text-sm mb-3 opacity-90">Unlock advanced AI insights</p>
              <button className="w-full bg-white text-primary-600 font-bold py-2 rounded-small text-sm hover:bg-primary-50 transition-colors">Upgrade Now</button>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-6 px-2">
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
            <div>
              <p className="text-sm font-bold text-neutral-900">Sarah Wilson</p>
              <p className="text-xs text-neutral-500">sarah@company.com</p>
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
              <h1 className="font-heading text-2xl font-bold text-neutral-900">Profile &amp; Settings</h1>
              <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
                <i className="ri-shield-check-line mr-1.5 text-primary-500"></i>
                Account Verified
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"></i>
                <input type="text" placeholder="Search settings..." className="pl-10 pr-4 py-2 bg-neutral-50 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all" />
              </div>
              <button className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 hover:text-primary-600 transition-colors relative">
                <i className="ri-notification-3-line text-lg"></i>
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-secondary-500 rounded-full border border-white"></span>
              </button>
            </div>
          </div>

          {/* Settings Tabs */}
          <div className="px-6 flex gap-1 border-t border-neutral-100">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                activeTab === 'profile'
                  ? 'text-neutral-900 border-neutral-900'
                  : 'text-neutral-500 border-transparent hover:text-neutral-700'
              }`}
            >
              <i className="ri-user-line mr-1.5"></i>Profile
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                activeTab === 'security'
                  ? 'text-neutral-900 border-neutral-900'
                  : 'text-neutral-500 border-transparent hover:text-neutral-700'
              }`}
            >
              <i className="ri-lock-line mr-1.5"></i>Security
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                activeTab === 'billing'
                  ? 'text-neutral-900 border-neutral-900'
                  : 'text-neutral-500 border-transparent hover:text-neutral-700'
              }`}
            >
              <i className="ri-bank-card-line mr-1.5"></i>Billing &amp; Plan
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                activeTab === 'invoices'
                  ? 'text-neutral-900 border-neutral-900'
                  : 'text-neutral-500 border-transparent hover:text-neutral-700'
              }`}
            >
              <i className="ri-file-list-3-line mr-1.5"></i>Invoices
            </button>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-y-auto bg-neutral-50">
          {/* ===== PROFILE TAB ===== */}
          {activeTab === 'profile' && (
            <div>
              {/* Avatar & Name Banner */}
              <section className="bg-white rounded-large shadow-custom p-6 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="relative">
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Sarah Wilson" className="w-24 h-24 rounded-large object-cover border-4 border-white shadow-custom" />
                    <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-neutral-900 text-white rounded-full flex items-center justify-center hover:bg-neutral-700 transition-colors shadow-custom">
                      <i className="ri-camera-line text-sm"></i>
                    </button>
                  </div>
                  <div className="flex-1">
                    <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-1">Sarah Wilson</h2>
                    <p className="text-neutral-500 text-sm mb-3">sarah@company.com · Pro Plan Member since Jan 2023</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-full border border-primary-100">
                        <i className="ri-vip-crown-line"></i> Pro Plan
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 text-neutral-600 text-xs font-medium rounded-full">
                        <i className="ri-building-line"></i> Company Admin
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                        <i className="ri-checkbox-circle-line"></i> Email Verified
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-small text-sm font-medium hover:bg-neutral-200 transition-colors">
                      <i className="ri-upload-2-line mr-1.5"></i>Upload Photo
                    </button>
                    <button className="px-4 py-2 bg-neutral-50 text-neutral-500 rounded-small text-sm font-medium hover:bg-neutral-100 transition-colors">
                      Remove
                    </button>
                  </div>
                </div>
              </section>

              {/* Personal Info Form */}
              <section className="bg-white rounded-large shadow-custom p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-neutral-900">Personal Information</h3>
                    <p className="text-sm text-neutral-500 mt-0.5">Update your personal details and contact info</p>
                  </div>
                  <button className="px-4 py-2 bg-primary-500 text-white rounded-small text-sm font-medium hover:bg-primary-600 transition-colors shadow-custom">
                    <i className="ri-save-line mr-1.5"></i>Save Changes
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">First Name</label>
                    <input type="text" defaultValue="Sarah" className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-small text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Last Name</label>
                    <input type="text" defaultValue="Wilson" className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-small text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Email Address</label>
                    <div className="relative">
                      <i className="ri-mail-line absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm"></i>
                      <input type="email" defaultValue="sarah@company.com" className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-small text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Phone Number</label>
                    <div className="relative">
                      <i className="ri-phone-line absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm"></i>
                      <input type="tel" defaultValue="+1 (555) 234-5678" className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-small text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Company</label>
                    <div className="relative">
                      <i className="ri-building-line absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm"></i>
                      <input type="text" defaultValue="Acme Corp" className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-small text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Job Title</label>
                    <input type="text" defaultValue="Head of Finance" className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-small text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Timezone</label>
                    <div className="relative">
                      <i className="ri-time-zone-line absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm"></i>
                      <select className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-small text-sm text-neutral-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all appearance-none">
                        <option>UTC-5 (Eastern Time)</option>
                        <option>UTC-8 (Pacific Time)</option>
                        <option>UTC+0 (GMT)</option>
                        <option>UTC+1 (Central European Time)</option>
                      </select>
                      <i className="ri-arrow-down-s-line absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm pointer-events-none"></i>
                    </div>
                  </div>
                </div>
              </section>

              {/* Notification Preferences */}
              <section className="bg-white rounded-large shadow-custom p-6 mb-6">
                <div className="mb-5">
                  <h3 className="font-heading text-lg font-bold text-neutral-900">Notification Preferences</h3>
                  <p className="text-sm text-neutral-500 mt-0.5">Choose how and when you receive notifications</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">Email Digest</p>
                      <p className="text-xs text-neutral-500 mt-0.5">Receive a daily summary of your data activity</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">AI Insight Alerts</p>
                      <p className="text-xs text-neutral-500 mt-0.5">Get notified when AI detects anomalies or trends</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">Marketing Updates</p>
                      <p className="text-xs text-neutral-500 mt-0.5">Product news, tips, and feature announcements</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ===== SECURITY TAB ===== */}
          {activeTab === 'security' && (
            <div>
              <section className="bg-white rounded-large shadow-custom p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-neutral-900">Change Password</h3>
                    <p className="text-sm text-neutral-500 mt-0.5">Ensure your account uses a strong, unique password</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600">
                    <i className="ri-lock-password-line text-lg"></i>
                  </div>
                </div>
                <div className="max-w-md space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Current Password</label>
                    <div className="relative">
                      <i className="ri-lock-line absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm"></i>
                      <input type="password" placeholder="Enter current password" className="w-full pl-9 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-small text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all" />
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"><i className="ri-eye-off-line text-sm"></i></button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">New Password</label>
                    <div className="relative">
                      <i className="ri-lock-line absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm"></i>
                      <input type="password" placeholder="Enter new password" className="w-full pl-9 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-small text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all" />
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"><i className="ri-eye-off-line text-sm"></i></button>
                    </div>
                    <div className="mt-2 flex gap-1.5">
                      <div className="h-1 flex-1 rounded-full bg-secondary-400"></div>
                      <div className="h-1 flex-1 rounded-full bg-secondary-400"></div>
                      <div className="h-1 flex-1 rounded-full bg-neutral-200"></div>
                      <div className="h-1 flex-1 rounded-full bg-neutral-200"></div>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">Password strength: <span className="text-secondary-600 font-medium">Fair</span></p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <i className="ri-lock-line absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm"></i>
                      <input type="password" placeholder="Confirm new password" className="w-full pl-9 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-small text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all" />
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"><i className="ri-eye-off-line text-sm"></i></button>
                    </div>
                  </div>
                  <button className="px-6 py-2.5 bg-neutral-900 text-white rounded-small text-sm font-medium hover:bg-neutral-700 transition-colors shadow-custom">
                    Update Password
                  </button>
                </div>
              </section>

              <section className="bg-white rounded-large shadow-custom p-6 mb-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-neutral-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-neutral-500 mt-0.5">Add an extra layer of security to your account</p>
                  </div>
                  <span className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-bold rounded-full border border-orange-100">Not Enabled</span>
                </div>
                <div className="flex items-start gap-4 p-4 bg-neutral-50 rounded-large border border-neutral-200">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 shrink-0">
                    <i className="ri-smartphone-line text-lg"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-neutral-800 mb-1">Authenticator App</p>
                    <p className="text-xs text-neutral-500">Use an app like Google Authenticator or Authy to generate one-time codes.</p>
                  </div>
                  <button className="px-4 py-2 bg-primary-500 text-white rounded-small text-sm font-medium hover:bg-primary-600 transition-colors shrink-0">Enable</button>
                </div>
              </section>

              <section className="bg-white rounded-large shadow-custom p-6 mb-6">
                <h3 className="font-heading text-lg font-bold text-neutral-900 mb-4">Active Sessions</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-primary-50 border border-primary-100 rounded-large">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                        <i className="ri-macbook-line"></i>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-800">MacBook Pro – Chrome</p>
                        <p className="text-xs text-neutral-500">New York, US · Active now</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-primary-600 bg-primary-100 px-2 py-1 rounded-full">Current</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-large hover:bg-neutral-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                        <i className="ri-smartphone-line"></i>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-800">iPhone 14 – Safari</p>
                        <p className="text-xs text-neutral-500">New York, US · 2 hours ago</p>
                      </div>
                    </div>
                    <button className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors">Revoke</button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ===== BILLING TAB ===== */}
          {activeTab === 'billing' && (
            <div>
              {/* Current Plan */}
              <section className="mb-6">
                <h3 className="font-heading text-lg font-bold text-neutral-900 mb-4">Current Plan</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Starter */}
                  <div className="bg-white rounded-large shadow-custom p-5 border-2 border-transparent hover:border-neutral-200 transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-neutral-500">Starter</span>
                      <span className="text-xs text-neutral-400">Free</span>
                    </div>
                    <p className="font-heading text-3xl font-bold text-neutral-900 mb-1">$0<span className="text-base font-normal text-neutral-500">/mo</span></p>
                    <p className="text-xs text-neutral-500 mb-4">For individuals getting started</p>
                    <ul className="space-y-2 text-xs text-neutral-600">
                      <li className="flex items-center gap-2"><i className="ri-check-line text-neutral-400"></i>5 data sources</li>
                      <li className="flex items-center gap-2"><i className="ri-check-line text-neutral-400"></i>Basic charts</li>
                      <li className="flex items-center gap-2"><i className="ri-close-line text-neutral-300"></i>AI Analysis</li>
                    </ul>
                  </div>
                  {/* Pro (Active) */}
                  <div className="bg-neutral-900 rounded-large p-5 border-2 border-neutral-900 relative overflow-hidden shadow-custom-hover cursor-pointer">
                    <div className="absolute top-3 right-3 px-2 py-0.5 bg-primary-500 text-white text-xs font-bold rounded-full">Active</div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-neutral-300">Pro</span>
                      <span className="text-xs text-primary-400">Most Popular</span>
                    </div>
                    <p className="font-heading text-3xl font-bold text-white mb-1">$49<span className="text-base font-normal text-neutral-400">/mo</span></p>
                    <p className="text-xs text-neutral-400 mb-4">For growing teams</p>
                    <ul className="space-y-2 text-xs text-neutral-300">
                      <li className="flex items-center gap-2"><i className="ri-check-line text-primary-400"></i>Unlimited sources</li>
                      <li className="flex items-center gap-2"><i className="ri-check-line text-primary-400"></i>Advanced charts</li>
                      <li className="flex items-center gap-2"><i className="ri-check-line text-primary-400"></i>AI Analysis</li>
                    </ul>
                  </div>
                  {/* Enterprise */}
                  <div className="bg-white rounded-large shadow-custom p-5 border-2 border-transparent hover:border-neutral-200 transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-neutral-500">Enterprise</span>
                      <span className="text-xs text-neutral-400">Custom</span>
                    </div>
                    <p className="font-heading text-3xl font-bold text-neutral-900 mb-1">$199<span className="text-base font-normal text-neutral-500">/mo</span></p>
                    <p className="text-xs text-neutral-500 mb-4">For large organizations</p>
                    <ul className="space-y-2 text-xs text-neutral-600">
                      <li className="flex items-center gap-2"><i className="ri-check-line text-primary-500"></i>Everything in Pro</li>
                      <li className="flex items-center gap-2"><i className="ri-check-line text-primary-500"></i>SSO &amp; SAML</li>
                      <li className="flex items-center gap-2"><i className="ri-check-line text-primary-500"></i>Dedicated support</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Subscription Management */}
              <section className="bg-white rounded-large shadow-custom p-6 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-neutral-900">Subscription Management</h3>
                    <p className="text-sm text-neutral-500 mt-0.5">Next billing date: <span className="font-semibold text-neutral-700">November 24, 2023</span> · $49.00</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-small text-sm font-medium hover:bg-neutral-200 transition-colors">
                      <i className="ri-refresh-line mr-1.5"></i>Change Plan
                    </button>
                    <button className="px-4 py-2 bg-red-50 text-red-600 rounded-small text-sm font-medium hover:bg-red-100 transition-colors border border-red-100">
                      <i className="ri-close-circle-line mr-1.5"></i>Cancel Plan
                    </button>
                  </div>
                </div>
                <div className="mt-4 bg-neutral-50 rounded-large p-3 flex items-center gap-3 border border-neutral-200">
                  <i className="ri-information-line text-primary-500"></i>
                  <p className="text-xs text-neutral-600">Your Pro plan renews automatically. Cancel anytime before Nov 24 to avoid the next charge.</p>
                </div>
              </section>

              {/* Payment Methods */}
              <section className="bg-white rounded-large shadow-custom p-6 mb-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-neutral-900">Payment Methods</h3>
                    <p className="text-sm text-neutral-500 mt-0.5">Manage your saved payment cards</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-small text-sm font-medium hover:bg-neutral-700 transition-colors shadow-custom">
                    <i className="ri-add-line"></i>Add Card
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  {/* Card 1 - Active */}
                  <div className="rounded-large p-5 text-white relative overflow-hidden shadow-custom-hover" style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'}}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mt-8 -mr-8"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -mb-8 -ml-8"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <i className="ri-bank-card-fill text-sm"></i>
                          </div>
                          <span className="text-xs font-bold text-white/70 uppercase tracking-wider">Visa</span>
                        </div>
                        <span className="px-2 py-0.5 bg-primary-500 text-white text-xs font-bold rounded-full">Default</span>
                      </div>
                      <p className="font-heading text-lg font-bold tracking-widest mb-4">•••• •••• •••• 4242</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-white/60 mb-0.5">Card Holder</p>
                          <p className="text-sm font-semibold">Sarah Wilson</p>
                        </div>
                        <div>
                          <p className="text-xs text-white/60 mb-0.5">Expires</p>
                          <p className="text-sm font-semibold">12/26</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="rounded-large p-5 text-white relative overflow-hidden shadow-custom" style={{background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)'}}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mt-8 -mr-8"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -mb-8 -ml-8"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <i className="ri-bank-card-fill text-sm"></i>
                          </div>
                          <span className="text-xs font-bold text-white/70 uppercase tracking-wider">Mastercard</span>
                        </div>
                        <button className="text-white/60 hover:text-white text-xs transition-colors">Set Default</button>
                      </div>
                      <p className="font-heading text-lg font-bold tracking-widest mb-4">•••• •••• •••• 8891</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-white/60 mb-0.5">Card Holder</p>
                          <p className="text-sm font-semibold">Sarah Wilson</p>
                        </div>
                        <div>
                          <p className="text-xs text-white/60 mb-0.5">Expires</p>
                          <p className="text-sm font-semibold">08/25</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add new card form (collapsed) */}
                <div className="border-2 border-dashed border-neutral-200 rounded-large p-5 text-center hover:border-primary-300 hover:bg-primary-50/20 transition-all cursor-pointer">
                  <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-2 text-neutral-500">
                    <i className="ri-add-line text-xl"></i>
                  </div>
                  <p className="text-sm font-medium text-neutral-700">Add a new payment method</p>
                  <p className="text-xs text-neutral-400 mt-0.5">Visa, Mastercard, American Express accepted</p>
                </div>
              </section>

              {/* Billing Address */}
              <section className="bg-white rounded-large shadow-custom p-6 mb-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-neutral-900">Billing Address</h3>
                    <p className="text-sm text-neutral-500 mt-0.5">Used for invoices and tax purposes</p>
                  </div>
                  <button className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-small text-sm font-medium hover:bg-neutral-200 transition-colors">
                    <i className="ri-edit-line mr-1.5"></i>Edit
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-neutral-50 rounded-large border border-neutral-200">
                    <p className="text-xs text-neutral-500 mb-1">Street Address</p>
                    <p className="text-sm font-semibold text-neutral-800">123 Finance Street, Suite 400</p>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-large border border-neutral-200">
                    <p className="text-xs text-neutral-500 mb-1">City / State</p>
                    <p className="text-sm font-semibold text-neutral-800">New York, NY 10001</p>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-large border border-neutral-200">
                    <p className="text-xs text-neutral-500 mb-1">Country</p>
                    <p className="text-sm font-semibold text-neutral-800">United States</p>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-large border border-neutral-200">
                    <p className="text-xs text-neutral-500 mb-1">Tax ID / VAT</p>
                    <p className="text-sm font-semibold text-neutral-800">US-123456789</p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ===== INVOICES TAB ===== */}
          {activeTab === 'invoices' && (
            <div>
              {/* Invoice Summary */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-large shadow-custom p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
                      <i className="ri-money-dollar-circle-line"></i>
                    </div>
                    <span className="text-sm text-neutral-500">Total Paid</span>
                  </div>
                  <p className="font-heading text-2xl font-bold text-neutral-900">$441.00</p>
                  <p className="text-xs text-neutral-400 mt-1">9 invoices this year</p>
                </div>
                <div className="bg-white rounded-large shadow-custom p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                      <i className="ri-checkbox-circle-line"></i>
                    </div>
                    <span className="text-sm text-neutral-500">Last Payment</span>
                  </div>
                  <p className="font-heading text-2xl font-bold text-neutral-900">$49.00</p>
                  <p className="text-xs text-neutral-400 mt-1">Oct 24, 2023</p>
                </div>
                <div className="bg-white rounded-large shadow-custom p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center">
                      <i className="ri-calendar-event-line"></i>
                    </div>
                    <span className="text-sm text-neutral-500">Next Invoice</span>
                  </div>
                  <p className="font-heading text-2xl font-bold text-neutral-900">$49.00</p>
                  <p className="text-xs text-neutral-400 mt-1">Nov 24, 2023</p>
                </div>
              </section>

              {/* Invoice Table */}
              <section className="bg-white rounded-large shadow-custom overflow-hidden mb-6">
                <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                  <h3 className="font-heading text-lg font-bold text-neutral-900">Invoice History</h3>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-neutral-50 text-neutral-600 rounded-small text-sm font-medium hover:bg-neutral-100 transition-colors">
                      <i className="ri-filter-3-line"></i>Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-small text-sm font-medium hover:bg-primary-600 transition-colors">
                      <i className="ri-download-line"></i>Export All
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase font-semibold">
                      <tr>
                        <th className="px-6 py-4">Invoice</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Plan</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      <tr className="hover:bg-neutral-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-primary-50 text-primary-600 flex items-center justify-center"><i className="ri-file-text-fill text-sm"></i></div>
                            <span className="font-medium text-neutral-900 text-sm">#INV-2023-010</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-600">Oct 24, 2023</td>
                        <td className="px-6 py-4 text-sm text-neutral-600">Pro Monthly</td>
                        <td className="px-6 py-4 text-sm font-semibold text-neutral-900">$49.00</td>
                        <td className="px-6 py-4"><span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Paid</span></td>
                        <td className="px-6 py-4"><button className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"><i className="ri-download-line mr-1"></i>PDF</button></td>
                      </tr>
                      <tr className="hover:bg-neutral-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-primary-50 text-primary-600 flex items-center justify-center"><i className="ri-file-text-fill text-sm"></i></div>
                            <span className="font-medium text-neutral-900 text-sm">#INV-2023-009</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-600">Sep 24, 2023</td>
                        <td className="px-6 py-4 text-sm text-neutral-600">Pro Monthly</td>
                        <td className="px-6 py-4 text-sm font-semibold text-neutral-900">$49.00</td>
                        <td className="px-6 py-4"><span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Paid</span></td>
                        <td className="px-6 py-4"><button className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"><i className="ri-download-line mr-1"></i>PDF</button></td>
                      </tr>
                      <tr className="hover:bg-neutral-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-primary-50 text-primary-600 flex items-center justify-center"><i className="ri-file-text-fill text-sm"></i></div>
                            <span className="font-medium text-neutral-900 text-sm">#INV-2023-008</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-600">Aug 24, 2023</td>
                        <td className="px-6 py-4 text-sm text-neutral-600">Pro Monthly</td>
                        <td className="px-6 py-4 text-sm font-semibold text-neutral-900">$49.00</td>
                        <td className="px-6 py-4"><span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Paid</span></td>
                        <td className="px-6 py-4"><button className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"><i className="ri-download-line mr-1"></i>PDF</button></td>
                      </tr>
                      <tr className="hover:bg-neutral-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-primary-50 text-primary-600 flex items-center justify-center"><i className="ri-file-text-fill text-sm"></i></div>
                            <span className="font-medium text-neutral-900 text-sm">#INV-2023-007</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-600">Jul 24, 2023</td>
                        <td className="px-6 py-4 text-sm text-neutral-600">Pro Monthly</td>
                        <td className="px-6 py-4 text-sm font-semibold text-neutral-900">$49.00</td>
                        <td className="px-6 py-4"><span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Paid</span></td>
                        <td className="px-6 py-4"><button className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"><i className="ri-download-line mr-1"></i>PDF</button></td>
                      </tr>
                      <tr className="hover:bg-neutral-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-neutral-100 text-neutral-500 flex items-center justify-center"><i className="ri-file-text-fill text-sm"></i></div>
                            <span className="font-medium text-neutral-900 text-sm">#INV-2023-001</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-600">Jan 24, 2023</td>
                        <td className="px-6 py-4 text-sm text-neutral-600">Starter → Pro</td>
                        <td className="px-6 py-4 text-sm font-semibold text-neutral-900">$0.00</td>
                        <td className="px-6 py-4"><span className="px-2 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-600">Free</span></td>
                        <td className="px-6 py-4"><button className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"><i className="ri-download-line mr-1"></i>PDF</button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
