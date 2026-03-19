'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare, Bell, Eye, Loader2 } from 'lucide-react';

interface Broadcast {
  id: string;
  broadcast_type: string;
  subject: string | null;
  content: string;
  status: string;
  total_recipients: number;
  total_sent: number;
  total_delivered: number;
  total_opened: number;
  total_clicked: number;
  sent_at: string | null;
  created_at: string;
}

export function BroadcastList() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const fetchBroadcasts = async () => {
    try {
      const response = await fetch('/api/autopilot/team/broadcasts');
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch broadcasts');
      }

      setBroadcasts(data.broadcasts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'sms':
        return <MessageSquare className="w-4 h-4" />;
      case 'in_app':
        return <Bell className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'gray', label: 'Draft' },
      scheduled: { color: 'blue', label: 'Scheduled' },
      sending: { color: 'yellow', label: 'Sending' },
      sent: { color: 'green', label: 'Sent' },
      failed: { color: 'red', label: 'Failed' },
      canceled: { color: 'gray', label: 'Canceled' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant="outline">{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center text-red-600">
        <p>Error: {error}</p>
      </Card>
    );
  }

  if (broadcasts.length === 0) {
    return (
      <Card className="p-12 text-center text-gray-500">
        <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No broadcasts yet</p>
        <p className="text-sm mt-2">Send your first team broadcast to get started</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {broadcasts.map((broadcast) => (
        <Card key={broadcast.id} className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {getTypeIcon(broadcast.broadcast_type)}
                <h3 className="font-semibold">
                  {broadcast.subject || `${broadcast.broadcast_type.toUpperCase()} Broadcast`}
                </h3>
                {getStatusBadge(broadcast.status)}
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{broadcast.content}</p>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span>Recipients: {broadcast.total_recipients}</span>
                <span>Sent: {broadcast.total_sent}</span>
                <span>Delivered: {broadcast.total_delivered}</span>
                {broadcast.broadcast_type === 'email' && (
                  <>
                    <span>Opened: {broadcast.total_opened}</span>
                    <span>Clicked: {broadcast.total_clicked}</span>
                  </>
                )}
              </div>

              <p className="text-xs text-gray-400 mt-2">
                {broadcast.sent_at
                  ? `Sent: ${new Date(broadcast.sent_at).toLocaleString()}`
                  : `Created: ${new Date(broadcast.created_at).toLocaleString()}`}
              </p>
            </div>

            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              View
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
