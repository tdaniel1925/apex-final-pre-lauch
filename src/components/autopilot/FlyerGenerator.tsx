'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  previewImageUrl: string;
}

interface FlyerGeneratorProps {
  onSuccess?: () => void;
}

export function FlyerGenerator({ onSuccess }: FlyerGeneratorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null);

  const [formData, setFormData] = useState({
    flyer_title: '',
    event_date: '',
    event_time: '',
    event_location: '',
    event_description: '',
    contact_phone: '',
    contact_email: '',
  });

  useEffect(() => {
    fetchTemplates();
    fetchUsage();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/autopilot/flyers/templates');
      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates);
        if (data.templates.length > 0) {
          setSelectedTemplate(data.templates[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/autopilot/flyers?limit=1');
      if (response.ok) {
        const data = await response.json();
        if (data.usage) {
          setUsage(data.usage);
        }
      }
    } catch (err) {
      console.error('Error fetching usage:', err);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!selectedTemplate) {
      setError('Please select a template');
      return;
    }

    if (!formData.flyer_title.trim()) {
      setError('Flyer title is required');
      return;
    }

    setGenerating(true);

    try {
      const response = await fetch('/api/autopilot/flyers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flyer_template_id: selectedTemplate,
          ...formData,
          event_date: formData.event_date ? new Date(formData.event_date).toISOString() : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || 'Failed to generate flyer');
        return;
      }

      setSuccess(true);
      fetchUsage();

      setTimeout(() => {
        setFormData({
          flyer_title: '',
          event_date: '',
          event_time: '',
          event_location: '',
          event_description: '',
          contact_phone: '',
          contact_email: '',
        });
        setSuccess(false);
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setGenerating(false);
    }
  };

  const isAtLimit = usage && usage.limit !== -1 && usage.used >= usage.limit;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <Label>Select Template</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
              {templates.map(template => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
                    selectedTemplate === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded mb-2" />
                  <h3 className="font-medium text-sm">{template.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="flyer_title">Event Title *</Label>
              <Input
                id="flyer_title"
                value={formData.flyer_title}
                onChange={(e) => handleChange('flyer_title', e.target.value)}
                placeholder="Annual Business Meeting"
                required
                disabled={isAtLimit ?? undefined}
              />
            </div>
            <div>
              <Label htmlFor="event_date">Event Date</Label>
              <Input
                id="event_date"
                type="date"
                value={formData.event_date}
                onChange={(e) => handleChange('event_date', e.target.value)}
                disabled={isAtLimit ?? undefined}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="event_time">Event Time</Label>
              <Input
                id="event_time"
                type="time"
                value={formData.event_time}
                onChange={(e) => handleChange('event_time', e.target.value)}
                disabled={isAtLimit ?? undefined}
              />
            </div>
            <div>
              <Label htmlFor="event_location">Event Location</Label>
              <Input
                id="event_location"
                value={formData.event_location}
                onChange={(e) => handleChange('event_location', e.target.value)}
                placeholder="Conference Center"
                disabled={isAtLimit ?? undefined}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="event_description">Description</Label>
            <Textarea
              id="event_description"
              value={formData.event_description}
              onChange={(e) => handleChange('event_description', e.target.value)}
              placeholder="Join us for an exciting event..."
              rows={3}
              disabled={isAtLimit ?? undefined}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => handleChange('contact_phone', e.target.value)}
                placeholder="(555) 123-4567"
                disabled={isAtLimit ?? undefined}
              />
            </div>
            <div>
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                placeholder="contact@example.com"
                disabled={isAtLimit ?? undefined}
              />
            </div>
          </div>

          {usage && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Flyers this month:</span>
                <span className="text-sm font-medium">
                  {usage.used} / {usage.limit === -1 ? '∞' : usage.limit}
                </span>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-900 border-green-200">
              <AlertDescription>Flyer generated successfully!</AlertDescription>
            </Alert>
          )}

          {isAtLimit && (
            <Alert variant="destructive">
              <AlertDescription>
                You have reached your monthly limit. Please upgrade to generate more flyers.
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={generating || (isAtLimit ?? false)} className="w-full">
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Flyer...
              </>
            ) : (
              'Generate Flyer'
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
