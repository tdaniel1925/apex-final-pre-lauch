'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Video, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface TrainingShare {
  id: string;
  shared_by_name: string | null;
  shared_with_name: string | null;
  training_title: string | null;
  personal_message: string | null;
  accessed: boolean;
  completed: boolean;
  watch_progress_percent: number;
  created_at: string;
}

export function TrainingSharesList() {
  const [shares, setShares] = useState<TrainingShare[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sent');

  useEffect(() => {
    fetchShares(activeTab);
  }, [activeTab]);

  const fetchShares = async (direction: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/autopilot/team/training/shared?direction=${direction}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setShares(data.shares);
      }
    } catch (error) {
      console.error('Error fetching shares:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderShare = (share: TrainingShare) => (
    <Card key={share.id} className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Video className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold">{share.training_title || 'Training Video'}</h3>
            {share.completed ? (
              <Badge variant="outline" className="bg-green-50">
                <CheckCircle className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            ) : share.accessed ? (
              <Badge variant="outline" className="bg-blue-50">
                In Progress ({share.watch_progress_percent}%)
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-50">
                Not Started
              </Badge>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-2">
            {activeTab === 'sent' ? `Shared with: ${share.shared_with_name}` : `Shared by: ${share.shared_by_name}`}
          </p>

          {share.personal_message && (
            <p className="text-sm text-gray-500 italic mb-2">"{share.personal_message}"</p>
          )}

          <p className="text-xs text-gray-400">{new Date(share.created_at).toLocaleString()}</p>
        </div>
      </div>
    </Card>
  );

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="sent">Sent</TabsTrigger>
        <TabsTrigger value="received">Received</TabsTrigger>
      </TabsList>

      <TabsContent value="sent" className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : shares.length === 0 ? (
          <Card className="p-12 text-center text-gray-500">
            <Video className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No training videos shared yet</p>
          </Card>
        ) : (
          shares.map(renderShare)
        )}
      </TabsContent>

      <TabsContent value="received" className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : shares.length === 0 ? (
          <Card className="p-12 text-center text-gray-500">
            <Video className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No training videos received yet</p>
          </Card>
        ) : (
          shares.map(renderShare)
        )}
      </TabsContent>
    </Tabs>
  );
}
