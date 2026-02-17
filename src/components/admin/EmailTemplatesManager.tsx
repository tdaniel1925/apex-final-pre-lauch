'use client';

// =============================================
// Email Templates Manager Component
// List, create, edit, delete templates with AI
// =============================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { EmailTemplate, LicensingStatusForEmail } from '@/lib/types/email';

export default function EmailTemplatesManager() {
  const router = useRouter();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<LicensingStatusForEmail | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load templates
  useEffect(() => {
    loadTemplates();
  }, [filterStatus]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== 'all') {
        params.append('licensing_status', filterStatus);
      }

      const response = await fetch(`/api/admin/email-templates?${params}`);
      const data = await response.json();

      if (data.success) {
        setTemplates(data.data.templates);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to load templates' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load templates' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const response = await fetch(`/api/admin/email-templates/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Template deleted successfully' });
        loadTemplates();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to delete template' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete template' });
    }
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingTemplate(null);
  };

  const handleSuccess = () => {
    setMessage({ type: 'success', text: editingTemplate ? 'Template updated' : 'Template created' });
    handleCloseModal();
    loadTemplates();
  };

  return (
    <div>
      {/* Message */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-md text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Header Actions */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as LicensingStatusForEmail | 'all')}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Templates</option>
            <option value="licensed">Licensed Only</option>
            <option value="non_licensed">Non-Licensed Only</option>
          </select>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <span className="text-lg">+</span>
          Create Template
        </button>
      </div>

      {/* Templates List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading templates...</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No templates found. Create your first template!
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <TemplateModal
          template={editingTemplate}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}

// Template Card Component
interface TemplateCardProps {
  template: EmailTemplate;
  onEdit: (template: EmailTemplate) => void;
  onDelete: (id: string) => void;
}

function TemplateCard({ template, onEdit, onDelete }: TemplateCardProps) {
  const statusColors = {
    licensed: 'bg-blue-100 text-blue-800',
    non_licensed: 'bg-gray-100 text-gray-800',
    all: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900">{template.template_name}</h3>
            <span
              className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                statusColors[template.licensing_status]
              }`}
            >
              {template.licensing_status === 'licensed'
                ? 'Licensed'
                : template.licensing_status === 'non_licensed'
                ? 'Non-Licensed'
                : 'All'}
            </span>
            {template.ai_generated && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                ✨ AI
              </span>
            )}
            {!template.is_active && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                Inactive
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-2">
            <strong>Subject:</strong> {template.subject}
          </p>

          {template.description && (
            <p className="text-xs text-gray-500 mb-2">{template.description}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Sequence: #{template.sequence_order}</span>
            <span>
              Send: {template.delay_days === 0 ? 'Immediately' : `${template.delay_days} days after signup`}
            </span>
            {template.variables_used.length > 0 && (
              <span>Variables: {template.variables_used.length}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => onEdit(template)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(template.id)}
            className="px-3 py-1.5 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Template Modal Component
interface TemplateModalProps {
  template: EmailTemplate | null;
  onClose: () => void;
  onSuccess: () => void;
}

function TemplateModal({ template, onClose, onSuccess }: TemplateModalProps) {
  const isEditing = !!template;

  const [formData, setFormData] = useState({
    template_name: template?.template_name || '',
    description: template?.description || '',
    subject: template?.subject || '',
    body: template?.body || '',
    preview_text: template?.preview_text || '',
    licensing_status: template?.licensing_status || ('licensed' as LicensingStatusForEmail),
    sequence_order: template?.sequence_order ?? 1,
    delay_days: template?.delay_days ?? 3,
    is_active: template?.is_active ?? true,
  });

  const [showAIModal, setShowAIModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAIGenerated = (generated: {
    subject: string;
    body: string;
    preview_text?: string;
    variables_used: string[];
  }) => {
    setFormData({
      ...formData,
      subject: generated.subject,
      body: generated.body,
      preview_text: generated.preview_text || '',
    });
    setShowAIModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const url = isEditing
        ? `/api/admin/email-templates/${template.id}`
        : '/api/admin/email-templates';

      const method = isEditing ? 'PATCH' : 'POST';

      // Extract variables from body
      const variablesUsed = extractVariables(formData.body);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          variables_used: variablesUsed,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
      } else {
        setError(data.message || 'Failed to save template');
      }
    } catch (err) {
      setError('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {isEditing ? 'Edit Template' : 'Create Template'}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-800 text-sm rounded-md border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Template Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={formData.template_name}
                  onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Welcome Email - Licensed"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Internal description of this template"
                />
              </div>

              {/* Grid: Licensing Status, Sequence, Delay */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Licensing Status *
                  </label>
                  <select
                    value={formData.licensing_status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        licensing_status: e.target.value as LicensingStatusForEmail,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="licensed">Licensed</option>
                    <option value="non_licensed">Non-Licensed</option>
                    <option value="all">All</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sequence Order *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.sequence_order}
                    onChange={(e) =>
                      setFormData({ ...formData, sequence_order: parseInt(e.target.value) })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <p className="text-xs text-gray-500 mt-1">0 = welcome email</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delay (days) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.delay_days}
                    onChange={(e) =>
                      setFormData({ ...formData, delay_days: parseInt(e.target.value) })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <p className="text-xs text-gray-500 mt-1">0 = immediate</p>
                </div>
              </div>

              {/* AI Generation Button */}
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">✨ Generate with AI</h3>
                    <p className="text-sm text-gray-600">
                      Describe the email you want and let AI create it for you
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAIModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Generate ✨
                  </button>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Welcome to Apex, {first_name}!"
                />
              </div>

              {/* Preview Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preview Text (Optional)
                </label>
                <input
                  type="text"
                  value={formData.preview_text}
                  onChange={(e) => setFormData({ ...formData, preview_text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Shown in email inbox preview"
                />
              </div>

              {/* Email Body */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Email Body (HTML) *</label>
                  <VariableHelper onInsert={(variable) => setFormData({ ...formData, body: formData.body + variable })} />
                </div>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  required
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                  placeholder="<h2>Hi {first_name},</h2><p>Welcome to...</p>"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Active (will send to new signups)
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : isEditing ? 'Update Template' : 'Create Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* AI Generation Modal */}
      {showAIModal && (
        <AIGenerationModal
          licensingStatus={formData.licensing_status}
          sequenceOrder={formData.sequence_order}
          onClose={() => setShowAIModal(false)}
          onGenerated={handleAIGenerated}
        />
      )}
    </>
  );
}

// AI Generation Modal
interface AIGenerationModalProps {
  licensingStatus: LicensingStatusForEmail;
  sequenceOrder: number;
  onClose: () => void;
  onGenerated: (generated: {
    subject: string;
    body: string;
    preview_text?: string;
    variables_used: string[];
  }) => void;
}

function AIGenerationModal({
  licensingStatus,
  sequenceOrder,
  onClose,
  onGenerated,
}: AIGenerationModalProps) {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please describe the email you want');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/email-templates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          licensing_status: licensingStatus,
          sequence_order: sequenceOrder,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onGenerated(data.data);
      } else {
        setError(data.message || 'Failed to generate email');
      }
    } catch (err) {
      setError('Failed to generate email');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">✨ AI Email Generator</h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-800 text-sm rounded-md border border-red-200">
            {error}
          </div>
        )}

        <p className="text-sm text-gray-600 mb-4">
          Describe the email you want and AI will generate a complete template with subject, body,
          and personalization variables.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What kind of email do you want?
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: A welcome email for licensed agents that explains how to verify their license and get started with building their team. Include next steps and encouragement."
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-xs text-blue-800">
            <strong>Context:</strong> Generating for{' '}
            <strong>
              {licensingStatus === 'licensed'
                ? 'Licensed Agents'
                : licensingStatus === 'non_licensed'
                ? 'Non-Licensed Distributors'
                : 'All Users'}
            </strong>{' '}
            • Sequence #{sequenceOrder} (
            {sequenceOrder === 0 ? 'Welcome email' : `Day ${sequenceOrder * 3}`})
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={generating}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating || !prompt.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {generating ? (
              <>
                <span className="animate-spin">⏳</span>
                Generating...
              </>
            ) : (
              <>
                <span>✨</span>
                Generate Email
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Variable Helper Component
function VariableHelper({ onInsert }: { onInsert: (variable: string) => void }) {
  const [showDropdown, setShowDropdown] = useState(false);

  const variables = [
    'first_name',
    'last_name',
    'email',
    'company_name',
    'licensing_status',
    'dashboard_link',
    'profile_link',
    'referral_link',
    'team_link',
    'unsubscribe_link',
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
      >
        Insert Variable ▼
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
            {variables.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  onInsert(`{${v}}`);
                  setShowDropdown(false);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 font-mono"
              >
                {`{${v}}`}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Helper function to extract variables from email body
function extractVariables(body: string): string[] {
  const matches = body.match(/\{([a-z_]+)\}/g);
  if (!matches) return [];

  const variables = matches.map((m) => m.replace(/[{}]/g, ''));
  return Array.from(new Set(variables)); // Remove duplicates
}
