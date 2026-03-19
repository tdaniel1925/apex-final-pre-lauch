'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Copy } from 'lucide-react';

interface EventTemplate {
  id: string;
  name: string;
  description: string | null;
  event_type: string;
  default_title: string;
  default_description: string | null;
  default_location: string | null;
  default_duration_minutes: number;
  default_max_attendees: number | null;
  default_status: string;
  usage_count: number;
  is_active: boolean;
  created_at: string;
}

export function TemplatesList() {
  const [templates, setTemplates] = useState<EventTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EventTemplate | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/event-templates');
      const result = await response.json();
      if (result.data) {
        setTemplates(result.data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/event-templates/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchTemplates();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template');
    }
  };

  const toggleActive = async (template: EventTemplate) => {
    try {
      const response = await fetch(`/api/admin/event-templates/${template.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_active: !template.is_active,
        }),
      });

      if (response.ok) {
        fetchTemplates();
      }
    } catch (error) {
      console.error('Error toggling template:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-600">Loading templates...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div className="text-sm text-slate-600">
          {templates.length} template{templates.length !== 1 ? 's' : ''} total
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <div className="text-slate-400 mb-4">
            <Copy className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No templates yet</h3>
          <p className="text-slate-600 mb-6">
            Create your first event template to save time when creating similar events
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Template
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {template.name}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        template.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {template.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                      {template.event_type}
                    </span>
                  </div>

                  {template.description && (
                    <p className="text-slate-600 mb-3">{template.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Default Title:</span>
                      <div className="font-medium text-slate-900">
                        {template.default_title}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500">Duration:</span>
                      <div className="font-medium text-slate-900">
                        {template.default_duration_minutes} minutes
                      </div>
                    </div>
                    {template.default_location && (
                      <div>
                        <span className="text-slate-500">Location:</span>
                        <div className="font-medium text-slate-900">
                          {template.default_location}
                        </div>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-500">Times Used:</span>
                      <div className="font-medium text-slate-900">
                        {template.usage_count}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(template)}
                  >
                    {template.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(template.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal would go here - simplified for now */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-semibold mb-4">Create Template</h2>
            <p className="text-slate-600 mb-4">
              Template creation form coming soon. For now, use the API directly or create an
              event and save it as a template.
            </p>
            <Button onClick={() => setShowCreateModal(false)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}
