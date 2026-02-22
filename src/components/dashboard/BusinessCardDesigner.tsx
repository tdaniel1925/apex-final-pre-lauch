'use client';

// =============================================
// Business Card Designer
// Live preview with auto-fitting text
// =============================================

import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { TITLE_OPTIONS } from '@/lib/business-card-templates';

interface DbTemplate {
  id: string;
  name: string;
  description: string | null;
  preview_front_url: string | null;
  preview_back_url: string | null;
  layout_config: {
    namePosition: string;
    nameAlign: string;
    titlePosition: string;
    contactLayout: string;
    logoPosition: string;
  };
  colors: {
    background: string;
    nameColor: string;
    titleColor: string;
    contactColor: string;
    accentColor: string;
  };
  fonts: {
    nameSize: number;
    nameWeight: number;
    titleSize: number;
    contactSize: number;
  };
}

interface Props {
  distributor: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    slug: string;
  };
  templates: DbTemplate[];
}

type Step = 'template' | 'design' | 'order';

export default function BusinessCardDesigner({ distributor, templates }: Props) {
  const [step, setStep] = useState<Step>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<DbTemplate>(
    templates[0] || {
      id: 'default',
      name: 'Default',
      description: 'Default template',
      preview_front_url: null,
      preview_back_url: null,
      layout_config: {
        namePosition: 'center',
        nameAlign: 'center',
        titlePosition: 'below-name',
        contactLayout: 'grid',
        logoPosition: 'top-left',
      },
      colors: {
        background: '#F5F5F7',
        nameColor: '#2B4C7E',
        titleColor: '#E9546B',
        contactColor: '#2B4C7E',
        accentColor: '#E9546B',
      },
      fonts: {
        nameSize: 22,
        nameWeight: 700,
        titleSize: 11,
        contactSize: 9,
      },
    }
  );

  // Form fields
  const [name, setName] = useState(`${distributor.first_name} ${distributor.last_name}`);
  const [title, setTitle] = useState('Insurance Agent');
  const [phone, setPhone] = useState(distributor.phone || '');
  const [email, setEmail] = useState(distributor.email);
  const [tagline, setTagline] = useState('');
  const [includeQR, setIncludeQR] = useState(true);

  // Auto-calculated
  const website = `theapexway.net/${distributor.slug}`;
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [nameFontSize, setNameFontSize] = useState(selectedTemplate.fonts.nameSize);

  const cardPreviewRef = useRef<HTMLDivElement>(null);

  // Generate QR code
  useEffect(() => {
    if (includeQR) {
      QRCode.toDataURL(`https://theapexway.net/${distributor.slug}`, {
        width: 120,
        margin: 1,
        color: {
          dark: selectedTemplate.colors.nameColor,
          light: '#00000000' // Transparent
        }
      }).then(setQrDataUrl);
    }
  }, [includeQR, distributor.slug, selectedTemplate]);

  // Auto-fit name text
  useEffect(() => {
    const baseSize = selectedTemplate.fonts.nameSize;
    const length = name.length;

    let calculatedSize = baseSize;
    if (length > 25) calculatedSize = baseSize * 0.6;
    else if (length > 18) calculatedSize = baseSize * 0.75;
    else if (length > 12) calculatedSize = baseSize * 0.9;

    setNameFontSize(calculatedSize);
  }, [name, selectedTemplate]);

  // Export to PDF
  const exportToPDF = async () => {
    if (!cardPreviewRef.current) return;

    const canvas = await html2canvas(cardPreviewRef.current, {
      scale: 3, // 300 DPI
      backgroundColor: null,
    });

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'in',
      format: [2, 3.5]
    });

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, 3.5, 2);
    pdf.save(`business-card-${name.replace(/\s/g, '-').toLowerCase()}.pdf`);
  };

  // Character warnings
  const nameWarning = name.length > 25
    ? '⚠️ Name is long - text will be smaller'
    : name.length > 18
    ? 'ℹ️ Name will be medium-sized'
    : null;

  const taglineWarning = tagline.length > 40
    ? '⚠️ Tagline too long - max 40 characters'
    : null;

  return (
    <div className="max-w-6xl mx-auto">
      {/* STEP 1: Template Selection */}
      {step === 'template' && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Template</h2>
            <p className="text-gray-600">Select a design that represents your professional style</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  setSelectedTemplate(template);
                  setStep('design');
                }}
                className={`group relative bg-white rounded-xl border-2 p-4 hover:border-[#2B4C7E] transition-all ${
                  selectedTemplate.id === template.id ? 'border-[#2B4C7E] ring-2 ring-blue-200' : 'border-gray-200'
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
                <div className="mt-3 text-sm font-semibold text-[#2B4C7E] group-hover:underline">
                  Select Template →
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: Design Editor */}
      {step === 'design' && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Design Your Card</h2>
              <p className="text-gray-600">Template: {selectedTemplate.name}</p>
            </div>
            <button
              onClick={() => setStep('template')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Change Template
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left: Edit Fields */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h3 className="font-bold text-gray-900 mb-4">Card Information</h3>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={30}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500">{name.length}/30 chars</span>
                  {nameWarning && <span className="text-xs text-orange-600">{nameWarning}</span>}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <select
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  {TITLE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {/* Website (auto) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website (auto-generated)
                </label>
                <input
                  type="text"
                  value={website}
                  disabled
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-600"
                />
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tagline (optional)
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  maxLength={40}
                  placeholder="Your success is my priority"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500">{tagline.length}/40 chars</span>
                  {taglineWarning && <span className="text-xs text-orange-600">{taglineWarning}</span>}
                </div>
              </div>

              {/* QR Code */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeQR}
                    onChange={(e) => setIncludeQR(e.target.checked)}
                    className="w-4 h-4 text-[#2B4C7E] rounded focus:ring-2 focus:ring-blue-200"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Include QR code linking to your website
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="pt-4 space-y-2">
                <button
                  onClick={exportToPDF}
                  className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  📥 Download Preview PDF
                </button>
                <button
                  onClick={() => setStep('order')}
                  className="w-full bg-[#2B4C7E] text-white py-2.5 rounded-lg font-semibold hover:bg-[#1e3a5f] transition-colors"
                >
                  Continue to Order →
                </button>
              </div>
            </div>

            {/* Right: Live Preview */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Live Preview</h3>

              <div className="flex flex-col items-center gap-4">
                {/* Front */}
                <div>
                  <div className="text-xs text-gray-500 mb-2 text-center">FRONT</div>
                  <div
                    ref={cardPreviewRef}
                    style={{
                      width: '350px',
                      height: '200px',
                      background: selectedTemplate.colors.background,
                      borderRadius: '12px',
                      position: 'relative',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Apex Logo */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '16px',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: selectedTemplate.colors.nameColor,
                      opacity: 0.8,
                    }}>
                      APEX AFFINITY GROUP
                    </div>

                    {/* Name - Auto-sized */}
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: selectedTemplate.layout_config.nameAlign as 'left' | 'center' | 'right',
                      width: '90%',
                      maxWidth: '300px',
                    }}>
                      <div style={{
                        fontSize: `${nameFontSize}px`,
                        fontWeight: selectedTemplate.fonts.nameWeight,
                        color: selectedTemplate.colors.nameColor,
                        textTransform: 'uppercase',
                        lineHeight: 1.2,
                        marginBottom: '6px',
                        wordWrap: 'break-word',
                      }}>
                        {name || 'Your Name'}
                      </div>
                      <div style={{
                        fontSize: `${selectedTemplate.fonts.titleSize}px`,
                        fontWeight: 600,
                        color: selectedTemplate.colors.titleColor,
                        letterSpacing: '0.5px',
                      }}>
                        {title}
                      </div>
                      {tagline && (
                        <div style={{
                          fontSize: '8px',
                          color: selectedTemplate.colors.contactColor,
                          marginTop: '4px',
                          fontStyle: 'italic',
                          opacity: 0.8,
                        }}>
                          {tagline}
                        </div>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div style={{
                      position: 'absolute',
                      bottom: '16px',
                      left: '16px',
                      right: '16px',
                      display: 'grid',
                      gridTemplateColumns: includeQR ? '1fr auto' : '1fr 1fr',
                      gap: '12px',
                      fontSize: `${selectedTemplate.fonts.contactSize}px`,
                    }}>
                      <div>
                        <div style={{
                          color: selectedTemplate.colors.accentColor,
                          fontWeight: 700,
                          marginBottom: '3px',
                          fontSize: '8px',
                          letterSpacing: '0.5px',
                        }}>
                          PHONE
                        </div>
                        <div style={{
                          color: selectedTemplate.colors.contactColor,
                          fontWeight: 600,
                        }}>
                          {phone || '(XXX) XXX-XXXX'}
                        </div>
                      </div>
                      {!includeQR && (
                        <div style={{ textAlign: 'right' }}>
                          <div style={{
                            color: selectedTemplate.colors.accentColor,
                            fontWeight: 700,
                            marginBottom: '3px',
                            fontSize: '8px',
                            letterSpacing: '0.5px',
                          }}>
                            WEB
                          </div>
                          <div style={{
                            color: selectedTemplate.colors.contactColor,
                            fontWeight: 600,
                          }}>
                            {website}
                          </div>
                        </div>
                      )}
                      {includeQR && qrDataUrl && (
                        <img
                          src={qrDataUrl}
                          alt="QR Code"
                          style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '4px',
                          }}
                        />
                      )}
                    </div>

                    {/* Email at top right */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '16px',
                      fontSize: '8px',
                      color: selectedTemplate.colors.contactColor,
                      opacity: 0.8,
                    }}>
                      {email}
                    </div>
                  </div>
                </div>

                {/* Back */}
                <div>
                  <div className="text-xs text-gray-500 mb-2 text-center">BACK</div>
                  <div
                    style={{
                      width: '350px',
                      height: '200px',
                      backgroundImage: selectedTemplate.preview_back_url
                        ? `url(${selectedTemplate.preview_back_url})`
                        : 'linear-gradient(135deg, #2B4C7E 0%, #567EBB 100%)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                    }}
                  />
                </div>

                <p className="text-xs text-gray-500 text-center mt-2">
                  * Final print will be 3.5" × 2" (standard business card size)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Order (placeholder - will integrate with existing order flow) */}
      {step === 'order' && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center max-w-md mx-auto">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Design Complete!</h2>
          <p className="text-gray-600 mb-6">
            Your business card design is ready. Now select quantity and shipping.
          </p>
          <button
            onClick={() => setStep('design')}
            className="text-sm text-[#2B4C7E] hover:underline"
          >
            ← Back to Edit
          </button>
          <p className="text-xs text-gray-500 mt-6">
            (Quantity selection and checkout flow will appear here)
          </p>
        </div>
      )}
    </div>
  );
}
