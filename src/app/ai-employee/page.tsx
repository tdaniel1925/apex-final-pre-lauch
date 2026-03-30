'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AIEmployeePage() {
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    email: '',
    phone: '',
    role: '',
    budget: '',
    interviewMethod: 'call', // 'call' or 'chat'
  });

  const [showChat, setShowChat] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Save to database
    console.log('Form submitted:', formData);

    // If they chose chat, show chat interface
    if (formData.interviewMethod === 'chat') {
      setShowChat(true);
    } else {
      // If they chose call, show calendar booking
      setSubmitted(true);
    }

    setIsSubmitting(false);
  };

  if (showChat) {
    return <ChatInterview formData={formData} />;
  }

  if (submitted) {
    return <CallScheduled formData={formData} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-slate-900">
              Apex Affinity Group
            </Link>
            <Link
              href="/login"
              className="text-slate-600 hover:text-slate-900 font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-slate-50"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                Now Available
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                Your Custom
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  AI Employee
                </span>
                Built Just for You
              </h1>

              <p className="text-xl text-slate-600 leading-relaxed mb-8">
                Get a dedicated AI team member that handles marketing, sales, or operations for your business.
                <span className="font-semibold text-slate-900"> Starting at just $500/month</span> — less than hiring an intern.
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-8 mb-12">
                <div>
                  <div className="text-3xl font-bold text-slate-900">24/7</div>
                  <div className="text-sm text-slate-600">Always Working</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">$500-$1k</div>
                  <div className="text-sm text-slate-600">Per Month</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">100%</div>
                  <div className="text-sm text-slate-600">Custom Built</div>
                </div>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-4 mb-8">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 border-2 border-white"
                    />
                  ))}
                </div>
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">50+ businesses</span> already using AI employees
                </p>
              </div>
            </div>

            {/* Right side - Form */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Get Started in 3 Steps
                </h2>
                <p className="text-slate-600">
                  Fill out this form, then choose how you'd like to tell us about your business
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Smith"
                  />
                </div>

                {/* Business Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Acme Inc."
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="john@acme.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>

                {/* Role Needed */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    What Role Do You Need? *
                  </label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a role...</option>
                    <option value="marketing-manager">Marketing Manager</option>
                    <option value="social-media-manager">Social Media Manager</option>
                    <option value="content-writer">Content Writer</option>
                    <option value="sales-rep">Sales Development Rep</option>
                    <option value="customer-success">Customer Success Manager</option>
                    <option value="executive-assistant">Executive Assistant</option>
                    <option value="data-analyst">Data Analyst</option>
                    <option value="other">Other / Not Sure</option>
                  </select>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Monthly Budget *
                  </label>
                  <select
                    required
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select budget range...</option>
                    <option value="500-750">$500 - $750</option>
                    <option value="750-1000">$750 - $1,000</option>
                    <option value="1000+">$1,000+</option>
                  </select>
                </div>

                {/* Interview Method Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    How would you like to proceed? *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, interviewMethod: 'call' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.interviewMethod === 'call'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      <div className="text-2xl mb-2">📞</div>
                      <div className="font-semibold text-slate-900 text-sm">Schedule Call</div>
                      <div className="text-xs text-slate-600 mt-1">AI voice interview</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, interviewMethod: 'chat' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.interviewMethod === 'chat'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      <div className="text-2xl mb-2">💬</div>
                      <div className="font-semibold text-slate-900 text-sm">Chat Now</div>
                      <div className="text-xs text-slate-600 mt-1">AI chatbot interview</div>
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Processing...' :
                    formData.interviewMethod === 'call' ? 'Continue to Schedule Call' : 'Start Chat Interview'
                  }
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              From discovery to deployment in just days, not weeks
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Discovery Interview
              </h3>
              <p className="text-slate-600">
                Our AI interviews you (via call or chat) to understand your business needs and goals
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Custom Proposal
              </h3>
              <p className="text-slate-600">
                Get a detailed proposal showing exactly what your AI employee will do and the expected results
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                SMS Approval
              </h3>
              <p className="text-slate-600">
                Review and approve your custom quote via text message — simple and secure
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                4
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Build & Deploy
              </h3>
              <p className="text-slate-600">
                Our team builds your AI employee and helps you get it integrated into your workflow
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Employee Roles Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Popular AI Employee Roles
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Every AI employee is custom-built for your business
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Marketing Manager */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-3xl mb-4">
                📊
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                Marketing Manager
              </h3>
              <p className="text-slate-600 mb-4">
                Handles your entire marketing strategy and execution
              </p>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Write blog posts & articles
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Create social media content
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  SEO research & optimization
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Email campaigns & newsletters
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Analytics & reporting
                </li>
              </ul>
            </div>

            {/* Sales Rep */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-3xl mb-4">
                💼
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                Sales Development Rep
              </h3>
              <p className="text-slate-600 mb-4">
                Finds and nurtures leads automatically
              </p>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Lead research & prospecting
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Outreach campaigns
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Follow-up sequences
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Meeting scheduling
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  CRM updates
                </li>
              </ul>
            </div>

            {/* Executive Assistant */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-3xl mb-4">
                🎯
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                Executive Assistant
              </h3>
              <p className="text-slate-600 mb-4">
                Handles admin tasks so you can focus on growth
              </p>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Calendar management
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Email sorting & responses
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Research & reporting
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Data entry & organization
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Project coordination
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-slate-600 mb-12">
            No hidden fees. No long-term contracts. Cancel anytime.
          </p>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-12 border border-blue-200">
            <div className="text-5xl font-bold text-slate-900 mb-2">
              $500 - $1,000
              <span className="text-2xl text-slate-600 font-normal">/month</span>
            </div>
            <p className="text-lg text-slate-600 mb-8">
              Based on role complexity and workload
            </p>

            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-sm font-semibold text-slate-700 mb-8">
              <span className="text-green-500">✓</span>
              Custom built for your business
            </div>

            <div className="grid md:grid-cols-3 gap-6 text-left mb-8">
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <span className="text-slate-700">Works 24/7, never takes breaks</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <span className="text-slate-700">Integrated with your tools</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <span className="text-slate-700">Dedicated support team</span>
              </div>
            </div>

            <a
              href="#form"
              className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-8 py-4 rounded-lg hover:shadow-xl transition-all"
            >
              Get Your Custom Quote
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <details className="bg-white rounded-lg p-6 shadow-sm">
              <summary className="font-bold text-slate-900 cursor-pointer">
                How is this different from ChatGPT?
              </summary>
              <p className="mt-3 text-slate-600">
                Your AI employee is custom-built for your specific business, trained on your data, and integrated with your tools. It's not a generic chatbot — it's a specialized team member that knows your business inside and out.
              </p>
            </details>

            <details className="bg-white rounded-lg p-6 shadow-sm">
              <summary className="font-bold text-slate-900 cursor-pointer">
                How long does setup take?
              </summary>
              <p className="mt-3 text-slate-600">
                Most AI employees are built and deployed within 3-5 business days after approval. Complex roles may take 7-10 days.
              </p>
            </details>

            <details className="bg-white rounded-lg p-6 shadow-sm">
              <summary className="font-bold text-slate-900 cursor-pointer">
                Can I cancel anytime?
              </summary>
              <p className="mt-3 text-slate-600">
                Yes. There are no long-term contracts. Cancel anytime with 30 days notice.
              </p>
            </details>

            <details className="bg-white rounded-lg p-6 shadow-sm">
              <summary className="font-bold text-slate-900 cursor-pointer">
                What if I need multiple AI employees?
              </summary>
              <p className="mt-3 text-slate-600">
                You can add as many AI employees as you need. Many businesses start with one and expand their AI team over time. We offer bundle discounts for multiple employees.
              </p>
            </details>

            <details className="bg-white rounded-lg p-6 shadow-sm">
              <summary className="font-bold text-slate-900 cursor-pointer">
                Is my data secure?
              </summary>
              <p className="mt-3 text-slate-600">
                Absolutely. Your data is encrypted, never shared with third parties, and you maintain full ownership. We're SOC 2 compliant and follow enterprise security best practices.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Hire Your AI Employee?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join 50+ businesses already scaling with AI
          </p>
          <a
            href="#form"
            className="inline-block bg-white text-blue-600 font-bold px-8 py-4 rounded-lg hover:bg-blue-50 transition-all"
          >
            Get Started Now
          </a>
        </div>
      </section>
    </div>
  );
}

// Chat Interview Component
function ChatInterview({ formData }: { formData: any }) {
  const [messages, setMessages] = useState<Array<{ role: 'ai' | 'user'; text: string }>>([
    {
      role: 'ai',
      text: `Hi ${formData.name}! I'm excited to learn about ${formData.businessName}. Let's dive in — this should only take about 5 minutes.\n\nFirst question: Tell me about your business. What products or services do you offer?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = { role: 'user' as const, text: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    // TODO: Send to AI backend for response
    // For now, simulate with timeout
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: 'Thanks for sharing that! Next question: What are the biggest time-consuming tasks in your business right now?'
      }]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <h2 className="text-2xl font-bold">AI Discovery Interview</h2>
          <p className="text-blue-100">Let's learn about your business needs</p>
        </div>

        {/* Chat Messages */}
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-md rounded-lg p-4 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-900'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-lg p-4">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-slate-200 p-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your answer..."
              className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Call Scheduled Component
function CallScheduled({ formData }: { formData: any }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-12 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">✓</span>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Almost There, {formData.name}!
        </h1>

        <p className="text-lg text-slate-600 mb-8">
          Now let's schedule your AI discovery call. Pick a time that works for you:
        </p>

        {/* TODO: Embed calendar (Calendly or Cal.com) */}
        <div className="bg-slate-100 rounded-lg p-12 mb-8">
          <p className="text-slate-600">
            [Calendar widget will be embedded here]
          </p>
        </div>

        <p className="text-sm text-slate-500">
          You'll receive an SMS confirmation with call details
        </p>
      </div>
    </div>
  );
}
