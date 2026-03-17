'use client';

// =============================================
// Settings Client Component
// Database-backed system configuration management
// =============================================

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Setting {
  id: string;
  category: string;
  key: string;
  value: string | null;
  value_type: 'string' | 'number' | 'boolean' | 'json' | 'encrypted';
  is_secret: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface SettingsClientProps {
  settingsByCategory: Record<string, Setting[]>;
}

const CATEGORY_LABELS: Record<string, string> = {
  general: 'General',
  branding: 'Branding',
  email: 'Email',
  compensation: 'Compensation',
  matrix: 'Matrix',
  notifications: 'Notifications',
  api_keys: 'API Keys',
  features: 'Features',
};

const CATEGORY_ICONS: Record<string, string> = {
  general: '⚙️',
  branding: '🎨',
  email: '📧',
  compensation: '💰',
  matrix: '🔗',
  notifications: '🔔',
  api_keys: '🔑',
  features: '🚀',
};

export default function SettingsClient({ settingsByCategory }: SettingsClientProps) {
  const categories = Object.keys(settingsByCategory);
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || 'general');
  const [formValues, setFormValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    Object.values(settingsByCategory).flat().forEach(setting => {
      initial[setting.key] = setting.value || '';
    });
    return initial;
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const currentSettings = settingsByCategory[selectedCategory] || [];

  const handleValueChange = (key: string, value: string) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
    setSaveMessage(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Get all changed settings in current category
      const updates = currentSettings
        .filter(setting => {
          const originalValue = setting.value || '';
          const newValue = formValues[setting.key] || '';
          return originalValue !== newValue;
        })
        .map(setting => ({
          key: setting.key,
          value: formValues[setting.key],
        }));

      if (updates.length === 0) {
        setSaveMessage({ type: 'success', text: 'No changes to save' });
        setIsSaving(false);
        return;
      }

      const response = await fetch('/api/admin/settings/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });

      const result = await response.json();

      if (response.ok) {
        setSaveMessage({ type: 'success', text: `Saved ${updates.length} setting(s) successfully` });
        setHasChanges(false);

        // Update local state with saved values instead of reloading
        // This preserves scroll position and client state
        setTimeout(() => {
          setSaveMessage(null);
        }, 3000);
      } else {
        setSaveMessage({ type: 'error', text: result.error || 'Failed to save settings' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage({ type: 'error', text: 'An error occurred while saving' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    // Reset form values to original
    const reset: Record<string, string> = {};
    currentSettings.forEach(setting => {
      reset[setting.key] = setting.value || '';
    });
    setFormValues(prev => ({ ...prev, ...reset }));
    setHasChanges(false);
    setSaveMessage(null);
  };

  const renderField = (setting: Setting) => {
    const value = formValues[setting.key] || '';

    switch (setting.value_type) {
      case 'boolean':
        return (
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={value === 'true'}
              onChange={(e) => handleValueChange(setting.key, String(e.target.checked))}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              {value === 'true' ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleValueChange(setting.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'json':
        return (
          <textarea
            value={value}
            onChange={(e) => handleValueChange(setting.key, e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder='{"key": "value"}'
          />
        );

      case 'encrypted':
        return (
          <input
            type="password"
            value={value}
            onChange={(e) => handleValueChange(setting.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="[ENCRYPTED]"
          />
        );

      case 'string':
      default:
        // Color picker for color fields
        if (setting.key.includes('color')) {
          return (
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={value}
                onChange={(e) => handleValueChange(setting.key, e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={value}
                onChange={(e) => handleValueChange(setting.key, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#3b82f6"
              />
            </div>
          );
        }

        // Text area for long descriptions
        if (setting.key.includes('description') || setting.key.includes('tagline')) {
          return (
            <textarea
              value={value}
              onChange={(e) => handleValueChange(setting.key, e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          );
        }

        // Regular text input
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleValueChange(setting.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure system settings and preferences
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <nav className="space-y-1 p-2">
              {categories.map((category) => {
                const isActive = selectedCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-4 py-3 rounded-md flex items-center gap-3 transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xl">{CATEGORY_ICONS[category]}</span>
                    <span>{CATEGORY_LABELS[category]}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Settings Form */}
        <div className="flex-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {CATEGORY_ICONS[selectedCategory]} {CATEGORY_LABELS[selectedCategory]}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {currentSettings.length} setting{currentSettings.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={!hasChanges || isSaving}
                >
                  Reset
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>

            {/* Save Message */}
            {saveMessage && (
              <div className={`mb-4 p-3 rounded-md ${
                saveMessage.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {saveMessage.text}
              </div>
            )}

            {/* Settings Fields */}
            <div className="space-y-6">
              {currentSettings.map((setting) => (
                <div key={setting.key} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                  <label className="block mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {setting.key.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-gray-400 uppercase">{setting.value_type}</span>
                    </div>
                    {setting.description && (
                      <p className="text-xs text-gray-500 mb-2">{setting.description}</p>
                    )}
                    {renderField(setting)}
                  </label>
                </div>
              ))}
            </div>

            {currentSettings.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No settings found in this category
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
