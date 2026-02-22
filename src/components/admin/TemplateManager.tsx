'use client';

// =============================================
// Business Card Template Manager
// Admin interface for template configuration
// =============================================

import { useState } from 'react';

interface TemplateConfig {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  is_default: boolean;
  sort_order: number;
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
  templates: TemplateConfig[];
}

export default function TemplateManager({ templates }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig | null>(
    templates[0] || null
  );
  const [editedTemplate, setEditedTemplate] = useState<TemplateConfig | null>(
    templates[0] || null
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!editedTemplate) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/business-card-templates/${editedTemplate.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editedTemplate.name,
          description: editedTemplate.description,
          is_active: editedTemplate.is_active,
          is_default: editedTemplate.is_default,
          layout_config: editedTemplate.layout_config,
          colors: editedTemplate.colors,
          fonts: editedTemplate.fonts,
        }),
      });

      if (response.ok) {
        alert('Template saved successfully!');
        window.location.reload();
      } else {
        alert('Failed to save template');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Error saving template');
    } finally {
      setSaving(false);
    }
  };

  const updateColor = (key: keyof TemplateConfig['colors'], value: string) => {
    if (!editedTemplate) return;
    setEditedTemplate({
      ...editedTemplate,
      colors: { ...editedTemplate.colors, [key]: value },
    });
  };

  const updateFont = (key: keyof TemplateConfig['fonts'], value: number) => {
    if (!editedTemplate) return;
    setEditedTemplate({
      ...editedTemplate,
      fonts: { ...editedTemplate.fonts, [key]: value },
    });
  };

  const updateLayout = (key: keyof TemplateConfig['layout_config'], value: string) => {
    if (!editedTemplate) return;
    setEditedTemplate({
      ...editedTemplate,
      layout_config: { ...editedTemplate.layout_config, [key]: value },
    });
  };

  if (!editedTemplate) {
    return (
      <div className="text-center py-12 text-gray-500">
        No templates found. Create one first.
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Left: Template List */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="font-bold text-gray-900 mb-4">Templates</h2>
          <div className="space-y-2">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  setSelectedTemplate(template);
                  setEditedTemplate(template);
                }}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedTemplate?.id === template.id
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="font-semibold text-gray-900">{template.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {template.is_default && (
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full mr-2">
                      Default
                    </span>
                  )}
                  {!template.is_active && (
                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Middle: Configuration Editor */}
      <div className="lg:col-span-1 space-y-4">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-bold text-gray-900 mb-4">Basic Info</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Name
              </label>
              <input
                type="text"
                value={editedTemplate.name}
                onChange={(e) =>
                  setEditedTemplate({ ...editedTemplate, name: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={editedTemplate.description || ''}
                onChange={(e) =>
                  setEditedTemplate({ ...editedTemplate, description: e.target.value })
                }
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editedTemplate.is_active}
                  onChange={(e) =>
                    setEditedTemplate({ ...editedTemplate, is_active: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editedTemplate.is_default}
                  onChange={(e) =>
                    setEditedTemplate({ ...editedTemplate, is_default: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">Default</span>
              </label>
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-bold text-gray-900 mb-4">Colors</h3>

          <div className="space-y-3">
            {Object.entries(editedTemplate.colors).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => updateColor(key as any, e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateColor(key as any, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fonts */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-bold text-gray-900 mb-4">Typography</h3>

          <div className="space-y-3">
            {Object.entries(editedTemplate.fonts).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => updateFont(key as any, parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Layout */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-bold text-gray-900 mb-4">Layout</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name Position
              </label>
              <select
                value={editedTemplate.layout_config.namePosition}
                onChange={(e) => updateLayout('namePosition', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="center">Center</option>
                <option value="top-left">Top Left</option>
                <option value="top-center">Top Center</option>
                <option value="bottom-left">Bottom Left</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name Alignment
              </label>
              <select
                value={editedTemplate.layout_config.nameAlign}
                onChange={(e) => updateLayout('nameAlign', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Layout
              </label>
              <select
                value={editedTemplate.layout_config.contactLayout}
                onChange={(e) => updateLayout('contactLayout', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="grid">Grid</option>
                <option value="vertical">Vertical</option>
                <option value="horizontal">Horizontal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        >
          {saving ? 'Saving...' : 'Save Template'}
        </button>
      </div>

      {/* Right: Live Preview */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-4">
          <h3 className="font-bold text-gray-900 mb-4">Preview</h3>

          <div className="space-y-4">
            {/* Color Swatches */}
            <div>
              <div className="text-xs text-gray-500 mb-2">Color Palette</div>
              <div className="flex gap-2">
                {Object.entries(editedTemplate.colors).map(([key, value]) => (
                  <div
                    key={key}
                    style={{ backgroundColor: value }}
                    className="w-10 h-10 rounded border border-gray-300"
                    title={key}
                  />
                ))}
              </div>
            </div>

            {/* Typography Preview */}
            <div>
              <div className="text-xs text-gray-500 mb-2">Typography</div>
              <div className="space-y-2">
                <div
                  style={{
                    fontSize: `${editedTemplate.fonts.nameSize}px`,
                    fontWeight: editedTemplate.fonts.nameWeight,
                    color: editedTemplate.colors.nameColor,
                  }}
                >
                  John Doe
                </div>
                <div
                  style={{
                    fontSize: `${editedTemplate.fonts.titleSize}px`,
                    color: editedTemplate.colors.titleColor,
                  }}
                >
                  Insurance Agent
                </div>
                <div
                  style={{
                    fontSize: `${editedTemplate.fonts.contactSize}px`,
                    color: editedTemplate.colors.contactColor,
                  }}
                >
                  (555) 123-4567
                </div>
              </div>
            </div>

            {/* Card Images */}
            {editedTemplate.preview_front_url && (
              <div>
                <div className="text-xs text-gray-500 mb-2">Front Design</div>
                <img
                  src={editedTemplate.preview_front_url}
                  alt="Front preview"
                  className="w-full rounded-lg border border-gray-200"
                />
              </div>
            )}

            {editedTemplate.preview_back_url && (
              <div>
                <div className="text-xs text-gray-500 mb-2">Back Design</div>
                <img
                  src={editedTemplate.preview_back_url}
                  alt="Back preview"
                  className="w-full rounded-lg border border-gray-200"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
