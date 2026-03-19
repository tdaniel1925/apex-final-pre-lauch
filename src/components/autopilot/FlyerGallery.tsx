'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Trash2, Loader2, AlertCircle } from 'lucide-react';

interface Flyer {
  id: string;
  flyer_title: string;
  flyer_template_name: string;
  generated_image_url: string;
  status: string;
  created_at: string;
  download_count: number;
}

export function FlyerGallery({ onRefresh }: { onRefresh?: () => void }) {
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFlyers();
  }, []);

  const fetchFlyers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/autopilot/flyers');
      const data = await response.json();

      if (data.success) {
        setFlyers(data.flyers);
      } else {
        setError(data.message || 'Failed to load flyers');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id: string, title: string) => {
    try {
      const response = await fetch(`/api/autopilot/flyers/${id}/download`);
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.svg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      fetchFlyers(); // Refresh to update download count
    } catch (err: any) {
      alert(err.message || 'Failed to download flyer');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this flyer?')) return;

    try {
      const response = await fetch(`/api/autopilot/flyers/${id}`, { method: 'DELETE' });
      const data = await response.json();

      if (data.success) {
        fetchFlyers();
        if (onRefresh) onRefresh();
      } else {
        alert(data.message || 'Failed to delete flyer');
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </Card>
    );
  }

  if (flyers.length === 0) {
    return (
      <Card className="p-12 text-center text-gray-500">
        No flyers yet. Generate your first flyer to get started!
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {flyers.map(flyer => (
        <Card key={flyer.id} className="overflow-hidden">
          <div className="aspect-video bg-gray-100 relative">
            {flyer.status === 'ready' && flyer.generated_image_url ? (
              <img
                src={flyer.generated_image_url}
                alt={flyer.flyer_title}
                className="w-full h-full object-cover"
              />
            ) : flyer.status === 'generating' ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-red-500">
                <AlertCircle className="h-8 w-8" />
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="font-semibold text-lg mb-1">{flyer.flyer_title}</h3>
            <p className="text-sm text-gray-500 mb-3">{flyer.flyer_template_name}</p>

            <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
              <span>{new Date(flyer.created_at).toLocaleDateString()}</span>
              {flyer.download_count > 0 && (
                <span>{flyer.download_count} download{flyer.download_count !== 1 ? 's' : ''}</span>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownload(flyer.id, flyer.flyer_title)}
                disabled={flyer.status !== 'ready'}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(flyer.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
