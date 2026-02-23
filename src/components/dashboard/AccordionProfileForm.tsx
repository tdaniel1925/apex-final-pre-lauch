'use client';

// =============================================
// Accordion-Based Profile Form Component
// Complete profile management with ACH information
// =============================================

import { useState } from 'react';
import type { Distributor } from '@/lib/types';
import ProfilePhotoCropper from './ProfilePhotoCropper';

interface AccordionProfileFormProps {
  distributor: Distributor;
  userEmail: string;
}

type Section = 'personal' | 'address' | 'banking' | 'tax' | 'security';

export default function AccordionProfileForm({ distributor, userEmail }: AccordionProfileFormProps) {
  const [openSection, setOpenSection] = useState<Section | null>('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(distributor.profile_photo_url);

  const toggleSection = (section: Section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      // Personal Information
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      company_name: formData.get('company_name') as string,
      phone: formData.get('phone') as string,

      // Address
      address_line1: formData.get('address_line1') as string,
      address_line2: formData.get('address_line2') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      zip: formData.get('zip') as string,

      // Banking/ACH
      bank_name: formData.get('bank_name') as string,
      bank_routing_number: formData.get('bank_routing_number') as string,
      bank_account_number: formData.get('bank_account_number') as string,
      bank_account_type: formData.get('bank_account_type') as string,

      // Tax Information
      tax_id: formData.get('tax_id') as string,
      tax_id_type: formData.get('tax_id_type') as string,
      date_of_birth: formData.get('date_of_birth') as string,
    };

    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const SectionHeader = ({ section, title, icon, complete }: { section: Section; title: string; icon: string; complete?: boolean }) => (
    <button
      type="button"
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 border-b border-gray-200 transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="text-left">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {complete !== undefined && (
            <p className="text-sm text-gray-600">
              {complete ? '✓ Complete' : 'Incomplete'}
            </p>
          )}
        </div>
      </div>
      <svg
        className={`w-5 h-5 text-gray-500 transition-transform ${openSection === section ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-0">
      <div className="bg-white rounded-lg shadow overflow-hidden">

        {/* Profile Photo */}
        <div className="p-6 bg-white border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            📸 <span>Profile Photo</span>
          </h3>
          <ProfilePhotoCropper
            currentPhotoUrl={profilePhotoUrl}
            onPhotoUpdate={(url) => setProfilePhotoUrl(url)}
          />
        </div>

        {/* Personal Information */}
        <SectionHeader
          section="personal"
          title="Personal Information"
          icon="👤"
          complete={!!(distributor.first_name && distributor.last_name && distributor.phone)}
        />
        {openSection === 'personal' && (
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  defaultValue={distributor.first_name}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  defaultValue={distributor.last_name}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (cannot be changed)
                </label>
                <input
                  type="email"
                  value={userEmail}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  name="company_name"
                  defaultValue={distributor.company_name || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={distributor.phone || ''}
                  required
                  placeholder="(555) 123-4567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Address */}
        <SectionHeader
          section="address"
          title="Mailing Address"
          icon="📍"
          complete={!!(distributor.address_line1 && distributor.city && distributor.state && distributor.zip)}
        />
        {openSection === 'address' && (
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address_line1"
                  defaultValue={distributor.address_line1 || ''}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 2
                </label>
                <input
                  type="text"
                  name="address_line2"
                  defaultValue={distributor.address_line2 || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    defaultValue={distributor.city || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    defaultValue={distributor.state || ''}
                    required
                    maxLength={2}
                    placeholder="CA"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent uppercase"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="zip"
                    defaultValue={distributor.zip || ''}
                    required
                    maxLength={10}
                    placeholder="12345"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Banking/ACH Information */}
        <SectionHeader
          section="banking"
          title="Banking Information (ACH)"
          icon="🏦"
          complete={!!(distributor.bank_name && distributor.bank_routing_number && distributor.bank_account_number)}
        />
        {openSection === 'banking' && (
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-900">
                <strong>Required for Commission Payouts:</strong> Enter your bank account information to receive commission payments via ACH direct deposit.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="bank_name"
                  defaultValue={distributor.bank_name || ''}
                  required
                  placeholder="e.g., Chase Bank, Bank of America"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Routing Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="bank_routing_number"
                    defaultValue={distributor.bank_routing_number || ''}
                    required
                    maxLength={9}
                    pattern="[0-9]{9}"
                    placeholder="9 digits"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">9-digit number on bottom of check</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="bank_account_number"
                    defaultValue={distributor.bank_account_number || ''}
                    required
                    placeholder="Account number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="bank_account_type"
                  defaultValue={distributor.bank_account_type || ''}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent"
                >
                  <option value="">Select account type</option>
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                </select>
              </div>

              {distributor.ach_verified && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-900">
                    ✓ Banking information verified on {new Date(distributor.ach_verified_at!).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tax Information */}
        <SectionHeader
          section="tax"
          title="Tax Information"
          icon="📋"
          complete={!!(distributor.tax_id && distributor.tax_id_type && distributor.date_of_birth)}
        />
        {openSection === 'tax' && (
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-900">
                <strong>IRS Requirement:</strong> We are required to collect this information for 1099 tax reporting if you earn $600 or more in commissions per year.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax ID Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="tax_id_type"
                  defaultValue={distributor.tax_id_type || ''}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent"
                >
                  <option value="">Select type</option>
                  <option value="ssn">SSN (Social Security Number) - Individual</option>
                  <option value="ein">EIN (Employer Identification Number) - Business</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="tax_id"
                  defaultValue={distributor.tax_id || ''}
                  required
                  placeholder="XXX-XX-XXXX or XX-XXXXXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Your information is encrypted and secure</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  defaultValue={distributor.date_of_birth || ''}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Security */}
        <SectionHeader
          section="security"
          title="Security & Password"
          icon="🔒"
        />
        {openSection === 'security' && (
          <div className="p-6 bg-gray-50">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-900 mb-2">
                  <strong>Change Password:</strong>
                </p>
                <p className="text-sm text-gray-700 mb-3">
                  To change your password, you'll need to reset it via email for security purposes.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    const response = await fetch('/api/auth/request-password-reset', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: userEmail }),
                    });
                    if (response.ok) {
                      alert('Password reset email sent! Check your inbox.');
                    }
                  }}
                  className="px-4 py-2 bg-[#2B4C7E] text-white rounded-md hover:bg-[#1a2c4e] transition-colors text-sm"
                >
                  Send Password Reset Email
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3 bg-[#2B4C7E] text-white rounded-md hover:bg-[#1a2c4e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          {isSubmitting ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </form>
  );
}
