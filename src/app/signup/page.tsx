'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

type Step = 1 | 2 | 3 | 4 | 5 | 6;

export default function SignupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [sponsorCode, setSponsorCode] = useState('');
  const [sponsorName, setSponsorName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [ssn, setSsn] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [signature, setSignature] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const steps = [
    { number: 1, title: 'Sponsor' },
    { number: 2, title: 'Personal Info' },
    { number: 3, title: 'Tax & Identity' },
    { number: 4, title: 'Agreement' },
    { number: 5, title: 'Payment' },
    { number: 6, title: 'Complete' }
  ];

  async function handleNext() {
    setError('');

    if (currentStep === 1) {
      // Verify sponsor code
      if (!sponsorCode) {
        setError('Please enter a sponsor code');
        return;
      }
      const { data } = await supabase
        .from('distributors')
        .select('first_name, last_name')
        .eq('rep_number', sponsorCode)
        .single();

      if (data) {
        setSponsorName(`${data.first_name} ${data.last_name}`);
        setCurrentStep(2);
      } else {
        setError('Invalid sponsor code');
      }
    } else if (currentStep === 2) {
      if (!firstName || !lastName || !email || !phone || !password) {
        setError('Please fill in all fields');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!ssn || ssn.length < 9) {
        setError('Please enter a valid SSN');
        return;
      }
      setCurrentStep(4);
    } else if (currentStep === 4) {
      if (!agreedToTerms || !signature) {
        setError('Please read and sign the agreement');
        return;
      }
      setCurrentStep(5);
    } else if (currentStep === 5) {
      // Process payment and create account
      setLoading(true);
      try {
        // In production: process Stripe payment here
        // For now, create the account
        const { error: signupError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signupError) {
          setError(signupError.message);
          setLoading(false);
          return;
        }

        setCurrentStep(6);
      } catch (err) {
        setError('An error occurred during signup');
        setLoading(false);
      }
    }
  }

  function renderStep() {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#0F2045] mb-2">Sponsor Verification</h2>
              <p className="text-gray-600">Enter your sponsor's code to verify your enrollment.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sponsor Code</label>
              <input
                type="text"
                value={sponsorCode}
                onChange={(e) => setSponsorCode(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1B3A7D] focus:border-[#1B3A7D]"
                placeholder="Enter sponsor code"
              />
              {sponsorName && (
                <p className="mt-2 text-sm text-emerald-600">✓ Sponsor: {sponsorName}</p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#0F2045] mb-2">Personal Information</h2>
              <p className="text-gray-600">Tell us about yourself.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1B3A7D] focus:border-[#1B3A7D]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1B3A7D] focus:border-[#1B3A7D]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1B3A7D] focus:border-[#1B3A7D]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1B3A7D] focus:border-[#1B3A7D]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1B3A7D] focus:border-[#1B3A7D]"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#0F2045] mb-2">Tax & Identity</h2>
              <p className="text-gray-600">Required for commission payouts (IRS Form 1099).</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Social Security Number</label>
              <input
                type="password"
                value={ssn}
                onChange={(e) => setSsn(e.target.value)}
                maxLength={9}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1B3A7D] focus:border-[#1B3A7D]"
                placeholder="XXX-XX-XXXX"
              />
              <p className="mt-2 text-xs text-gray-500">Your SSN is encrypted and secure. Required by law for tax reporting.</p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#0F2045] mb-2">Independent Distributor Agreement</h2>
              <p className="text-gray-600">Please review and sign the agreement.</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 h-64 overflow-y-auto text-sm text-gray-700">
              <h3 className="font-bold mb-4">Apex Affinity Group Independent Distributor Agreement</h3>
              <p className="mb-4">
                By signing this agreement, you acknowledge that you have read and agree to the terms and conditions of the Apex Affinity Group Independent Distributor Agreement.
              </p>
              <p className="mb-4">
                <strong>1. Independent Contractor Status:</strong> You understand and agree that as an Independent Distributor, you are an independent contractor and not an employee of Apex Affinity Group.
              </p>
              <p className="mb-4">
                <strong>2. Compensation:</strong> You will be compensated according to the Apex Affinity Group Compensation Plan as outlined in the Policies and Procedures.
              </p>
              <p className="mb-4">
                <strong>3. Business Center Fee:</strong> You agree to pay the one-time Business Center activation fee of $39.
              </p>
              <p className="text-xs text-gray-500 mt-6">Last updated: January 1, 2025</p>
            </div>
            <div>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-[#1B3A7D] focus:ring-[#1B3A7D]"
                />
                <span className="text-sm text-gray-700">I have read and agree to the terms of the Independent Distributor Agreement</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Electronic Signature</label>
              <input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1B3A7D] focus:border-[#1B3A7D]"
                placeholder="Type your full name"
              />
              <p className="mt-2 text-xs text-gray-500">By typing your name, you agree that this constitutes a legal electronic signature.</p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#0F2045] mb-2">Business Center Activation</h2>
              <p className="text-gray-600">One-time fee to activate your distributor account.</p>
            </div>
            <div className="bg-gradient-to-br from-[#1B3A7D] to-[#0F2045] text-white rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold">Business Center</h3>
                  <p className="text-gray-300 mt-1">Activation Fee</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold">$39</p>
                  <p className="text-gray-300 text-sm">One-time payment</p>
                </div>
              </div>
              <div className="border-t border-white/20 pt-6 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Access to replicated website</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Commission-qualified status</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Back office access</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Training materials</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> In production, Stripe payment processing would be integrated here.
              </p>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="text-center space-y-6 py-8">
            <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center" style={{ background: '#C7181F' }}>
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-[#0F2045] mb-2">Welcome to Apex!</h2>
              <p className="text-gray-600">Your distributor account has been created successfully.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 text-left">
              <h3 className="font-bold text-[#0F2045] mb-4">Next Steps:</h3>
              <ol className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: '#1B3A7D' }}>1</span>
                  <span>Check your email for your welcome message and account details</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: '#1B3A7D' }}>2</span>
                  <span>Complete your profile in the back office</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: '#1B3A7D' }}>3</span>
                  <span>Review training materials to get started</span>
                </li>
              </ol>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-3 rounded-lg text-white font-semibold shadow-lg"
              style={{ background: '#1B3A7D' }}
            >
              Go to Dashboard
            </button>
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      currentStep >= step.number
                        ? 'text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                    style={currentStep >= step.number ? { background: '#1B3A7D' } : {}}
                  >
                    {currentStep > step.number ? '✓' : step.number}
                  </div>
                  <span className="text-xs mt-2 text-gray-600 hidden md:block">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 bg-gray-200 mx-2">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: currentStep > step.number ? '100%' : '0%',
                        background: '#1B3A7D'
                      }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-[#C7181F] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {renderStep()}

          {currentStep < 6 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              {currentStep > 1 ? (
                <button
                  onClick={() => setCurrentStep((currentStep - 1) as Step)}
                  className="px-6 py-2 rounded-lg text-gray-600 font-medium hover:bg-gray-100 transition-colors"
                >
                  ← Back
                </button>
              ) : (
                <div></div>
              )}
              <button
                onClick={handleNext}
                disabled={loading}
                className="px-8 py-3 rounded-lg text-white font-semibold shadow-lg transition-all disabled:opacity-50"
                style={{ background: '#1B3A7D' }}
              >
                {loading ? 'Processing...' : currentStep === 5 ? 'Complete Signup' : 'Continue →'}
              </button>
            </div>
          )}
        </div>

        {currentStep < 6 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="font-semibold text-[#1B3A7D] hover:underline">
                Sign In
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
