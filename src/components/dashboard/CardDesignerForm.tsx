'use client';

// =============================================
// User-Facing Business Card Designer Form
// Auto-generates form from template structure
// =============================================

import { useState, useRef } from 'react';
import CardPreviewRenderer from './CardPreviewRenderer';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface CardElement {
  id: string;
  type: 'text' | 'image';
  field: string | null;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  zIndex: number;
}

interface Template {
  id: string;
  name: string;
  description: string | null;
  preview_front_url: string | null;
  preview_back_url: string | null;
  front_elements: CardElement[];
  back_elements: CardElement[];
  required_fields: string[];
  optional_fields: string[];
}

interface Props {
  distributor: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    slug: string;
  };
  templates: Template[];
}

const FIELD_LABELS: Record<string, string> = {
  name: 'Full Name',
  first_name: 'First Name',
  last_name: 'Last Name',
  title: 'Title/Position',
  email: 'Email',
  phone_primary: 'Phone',
  phone_secondary: 'Phone (Secondary)',
  website: 'Website',
  business_address_line1: 'Address Line 1',
  business_address_line2: 'Address Line 2',
  business_city_state_zip: 'City, State ZIP',
  tagline: 'Tagline/Motto',
};

const TITLE_OPTIONS = [
  'Insurance Agent',
  'Senior Insurance Agent',
  'Independent Agent',
  'Licensed Agent',
  'Financial Advisor',
  'Account Executive',
  'Sales Representative',
  'District Manager',
  'Regional Director',
  'Team Leader',
];

export default function CardDesignerForm({ distributor, templates }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(templates[0]);
  const [step, setStep] = useState<'template' | 'design' | 'order'>('template');
  const [includeQR, setIncludeQR] = useState(true);

  // User form data
  const [formData, setFormData] = useState<Record<string, string>>({
    name: `${distributor.first_name} ${distributor.last_name}`,
    first_name: distributor.first_name,
    last_name: distributor.last_name,
    email: distributor.email,
    phone_primary: distributor.phone || '',
    title: 'Insurance Agent',
  });

  const frontPreviewRef = useRef<HTMLDivElement>(null);
  const backPreviewRef = useRef<HTMLDivElement>(null);

  // Update form field
  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  // Export to PDF
  const exportToPDF = async () => {
    if (!frontPreviewRef.current || !backPreviewRef.current) return;

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'in',
      format: [2, 3.5],
    });

    // Front
    const frontCanvas = await html2canvas(frontPreviewRef.current, {
      scale: 3,
      backgroundColor: null,
    });
    const frontImg = frontCanvas.toDataURL('image/png');
    pdf.addImage(frontImg, 'PNG', 0, 0, 3.5, 2);

    // Back (add new page)
    pdf.addPage();
    const backCanvas = await html2canvas(backPreviewRef.current, {
      scale: 3,
      backgroundColor: null,
    });
    const backImg = backCanvas.toDataURL('image/png');
    pdf.addImage(backImg, 'PNG', 0, 0, 3.5, 2);

    pdf.save(`business-card-${distributor.first_name}-${distributor.last_name}.pdf`);
  };

  // Get all fields needed for this template
  const allFields = [
    ...selectedTemplate.required_fields,
    ...selectedTemplate.optional_fields,
  ];

  return (
    <div>
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className={`flex items-center gap-2 ${step === 'template' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'template' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            1
          </div>
          <span className="font-semibold">Choose Template</span>
        </div>
        <div className="w-12 h-0.5 bg-gray-300" />
        <div className={`flex items-center gap-2 ${step === 'design' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'design' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            2
          </div>
          <span className="font-semibold">Your Information</span>
        </div>
        <div className="w-12 h-0.5 bg-gray-300" />
        <div className={`flex items-center gap-2 ${step === 'order' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'order' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            3
          </div>
          <span className="font-semibold">Order</span>
        </div>
      </div>

      {/* STEP 1: Template Selection */}
      {step === 'template' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Choose Your Template
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  setSelectedTemplate(template);
                  setStep('design');
                }}
                className={`group bg-white rounded-xl border-2 p-4 hover:border-blue-500 transition-all ${
                  selectedTemplate.id === template.id
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200'
                }`}
              >
                {template.preview_front_url ? (
                  <div className="aspect-[3.5/2] bg-gray-100 rounded-lg mb-3 overflow-hidden">
                    <img
                      src={template.preview_front_url}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-[3.5/2] bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-400">
                    {template.name}
                  </div>
                )}
                <h3 className="font-bold text-gray-900 mb-1">{template.name}</h3>
                <p className="text-sm text-gray-600">{template.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: Design/Information */}
      {step === 'design' && (
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left: Form */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Information</h2>

            <div className="space-y-4">
              {allFields.map((field) => {
                const isRequired = selectedTemplate.required_fields.includes(field);
                const label = FIELD_LABELS[field] || field;

                // Special handling for title field
                if (field === 'title') {
                  return (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label} {isRequired && <span className="text-red-500">*</span>}
                      </label>
                      <select
                        value={formData[field] || ''}
                        onChange={(e) => updateField(field, e.target.value)}
                        required={isRequired}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      >
                        {TITLE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                return (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {label} {isRequired && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type={field === 'email' ? 'email' : 'text'}
                      value={formData[field] || ''}
                      onChange={(e) => updateField(field, e.target.value)}
                      required={isRequired}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      placeholder={`Enter ${label.toLowerCase()}`}
                    />
                  </div>
                );
              })}

              {/* QR Code Toggle */}
              <div className="pt-4 border-t border-gray-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeQR}
                    onChange={(e) => setIncludeQR(e.target.checked)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Include QR Code (links to your profile)
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep('template')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep('order')}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                Continue →
              </button>
            </div>
          </div>

          {/* Right: Live Preview */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Live Preview</h3>

            <div className="space-y-6">
              {/* Front Preview */}
              <div>
                <div className="text-sm text-gray-600 mb-2">Front</div>
                <div ref={frontPreviewRef}>
                  <CardPreviewRenderer
                    elements={selectedTemplate.front_elements}
                    userData={formData}
                    side="front"
                    distributorSlug={distributor.slug}
                    includeQR={includeQR}
                  />
                </div>
              </div>

              {/* Back Preview */}
              <div>
                <div className="text-sm text-gray-600 mb-2">Back</div>
                <div ref={backPreviewRef}>
                  <CardPreviewRenderer
                    elements={selectedTemplate.back_elements}
                    userData={formData}
                    side="back"
                    distributorSlug={distributor.slug}
                    includeQR={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Order */}
      {step === 'order' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Order Your Cards
            </h2>

            {/* Final Preview */}
            <div className="mb-8">
              <div className="flex gap-4 justify-center">
                <div>
                  <div className="text-sm text-gray-600 mb-2 text-center">Front</div>
                  <CardPreviewRenderer
                    elements={selectedTemplate.front_elements}
                    userData={formData}
                    side="front"
                    distributorSlug={distributor.slug}
                    includeQR={includeQR}
                  />
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-2 text-center">Back</div>
                  <CardPreviewRenderer
                    elements={selectedTemplate.back_elements}
                    userData={formData}
                    side="back"
                  />
                </div>
              </div>
            </div>

            {/* Order Options */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-4 py-2">
                  <option value="250">250 cards - $25.00</option>
                  <option value="500">500 cards - $45.00</option>
                  <option value="1000">1000 cards - $80.00</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Delivery:</strong> 5-7 business days after order confirmation
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep('design')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
              >
                ← Back
              </button>
              <button
                onClick={exportToPDF}
                className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700"
              >
                Download PDF
              </button>
              <button
                onClick={() => alert('Order feature coming soon!')}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
