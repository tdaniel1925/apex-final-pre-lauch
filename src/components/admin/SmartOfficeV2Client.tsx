'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  RefreshCw,
  Users,
  FileText,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Clock,
  Database,
  Play,
  Loader2,
} from 'lucide-react';

interface Stats {
  totalAgents: number;
  mappedAgents: number;
  unmappedAgents: number;
  totalPolicies: number;
  totalCommissions: number;
  lastSync: {
    completed_at: string;
    status: string;
    agents_synced: number;
    policies_synced: number;
  } | null;
}

interface SmartOfficeV2ClientProps {
  initialStats: Stats;
  isConfigured: boolean;
  config: {
    api_url: string;
    sitename: string;
    username: string;
    sync_frequency_hours: number;
  } | null;
}

export default function SmartOfficeV2Client({
  initialStats,
  isConfigured,
  config,
}: SmartOfficeV2ClientProps) {
  const [stats, setStats] = useState<Stats>(initialStats);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleRunSync = async () => {
    setSyncing(true);
    setSyncMessage(null);

    console.log('[SmartOffice] Starting sync...');

    try {
      // Show progress message
      setSyncMessage({
        type: 'success',
        message: 'Connecting to SmartOffice API...',
      });

      const response = await fetch('/api/admin/smartoffice/sync', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        console.log('[SmartOffice] Sync completed:', data);
        setSyncMessage({
          type: 'success',
          message: `✅ Sync completed! Synced ${data.agents || 0} agents, ${data.policies || 0} policies, and ${data.commissions || 0} commissions in ${Math.round((data.duration_ms || 0) / 1000)}s`,
        });

        // Refresh stats
        console.log('[SmartOffice] Refreshing stats...');
        const statsResponse = await fetch('/api/admin/smartoffice/stats');
        if (statsResponse.ok) {
          const newStats = await statsResponse.json();
          console.log('[SmartOffice] Updated stats:', newStats);
          setStats({
            totalAgents: newStats.totalAgents || 0,
            mappedAgents: newStats.mappedAgents || 0,
            unmappedAgents: newStats.unmappedAgents || 0,
            totalPolicies: newStats.totalPolicies || 0,
            totalCommissions: newStats.totalCommissions || 0,
            lastSync: {
              completed_at: new Date().toISOString(),
              status: 'success',
              agents_synced: data.agents || 0,
              policies_synced: data.policies || 0,
            },
          });
        }
      } else {
        console.error('[SmartOffice] Sync failed:', data.error);
        setSyncMessage({
          type: 'error',
          message: `❌ ${data.error || 'Sync failed. Please try again.'}`,
        });
      }
    } catch (error) {
      console.error('[SmartOffice] Sync error:', error);
      setSyncMessage({
        type: 'error',
        message: '❌ Failed to connect to SmartOffice API. Please check your configuration and try again.',
      });
    } finally {
      setSyncing(false);
      console.log('[SmartOffice] Sync process finished');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SmartOffice CRM</h1>
          <p className="text-gray-600 mt-1">
            Manage SmartOffice integration, sync agents, policies, and commissions
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isConfigured ? (
            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge variant="destructive">
              <AlertCircle className="w-3 h-3 mr-1" />
              Not Configured
            </Badge>
          )}
        </div>
      </div>

      {/* Configuration Warning */}
      {!isConfigured && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              SmartOffice Not Configured
            </CardTitle>
            <CardDescription className="text-amber-700">
              SmartOffice credentials are not configured or inactive. Please configure the
              integration to start syncing data.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Agents</CardTitle>
            <Users className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAgents}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.mappedAgents} mapped • {stats.unmappedAgents} unmapped
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Policies</CardTitle>
            <FileText className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPolicies}</div>
            <p className="text-xs text-gray-500 mt-1">Active policies from SmartOffice</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Commissions</CardTitle>
            <DollarSign className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCommissions}</div>
            <p className="text-xs text-gray-500 mt-1">Commission records tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Last Sync</CardTitle>
            <Clock className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold">
              {stats.lastSync ? formatDate(stats.lastSync.completed_at) : 'Never'}
            </div>
            {stats.lastSync && (
              <p className="text-xs text-gray-500 mt-1">
                {stats.lastSync.agents_synced} agents • {stats.lastSync.policies_synced} policies
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sync Action Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <RefreshCw className="w-5 h-5" />
            Sync Data from SmartOffice
          </CardTitle>
          <CardDescription className="text-gray-700">
            Pull the latest agents, policies, and commission data from SmartOffice CRM
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {syncMessage && (
            <div
              className={`p-4 rounded-lg border-2 ${
                syncMessage.type === 'success'
                  ? 'bg-green-50 border-green-300 text-green-900'
                  : 'bg-red-50 border-red-300 text-red-900'
              }`}
            >
              <div className="flex items-center gap-3">
                {syncMessage.type === 'success' ? (
                  syncing ? (
                    <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
                  ) : (
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  )
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-base">{syncMessage.message}</p>
                  {syncing && (
                    <p className="text-sm mt-1 opacity-80">
                      Please wait, this may take 30-60 seconds...
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <Button
              size="lg"
              onClick={handleRunSync}
              disabled={!isConfigured || syncing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {syncing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Full Sync
                </>
              )}
            </Button>

            {config && (
              <div className="text-sm text-gray-600">
                <p>Auto-sync every {config.sync_frequency_hours} hours</p>
                <p className="text-xs text-gray-500 mt-1">
                  Connected to: {config.sitename}
                </p>
              </div>
            )}
          </div>

          {!isConfigured && (
            <p className="text-sm text-amber-600">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              Configure SmartOffice credentials in the Configuration tab to enable syncing
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="agents" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="agents">
            <Users className="w-4 h-4 mr-2" />
            Agents ({stats.totalAgents})
          </TabsTrigger>
          <TabsTrigger value="policies">
            <FileText className="w-4 h-4 mr-2" />
            Policies ({stats.totalPolicies})
          </TabsTrigger>
          <TabsTrigger value="config">
            <Database className="w-4 h-4 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="logs">
            <Clock className="w-4 h-4 mr-2" />
            Sync Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>SmartOffice Agents</CardTitle>
              <CardDescription>
                Agents synced from SmartOffice CRM - {stats.mappedAgents} mapped to Apex
                distributors
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.totalAgents === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Agents Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Run a sync to import agents from SmartOffice
                  </p>
                  <Button onClick={handleRunSync} disabled={!isConfigured || syncing}>
                    <Play className="w-4 h-4 mr-2" />
                    Run First Sync
                  </Button>
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  <p>Agent data will be displayed here after sync completes.</p>
                  <p className="mt-2">
                    Total: {stats.totalAgents} agents • Mapped: {stats.mappedAgents} • Unmapped:{' '}
                    {stats.unmappedAgents}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>SmartOffice Policies</CardTitle>
              <CardDescription>Insurance policies synced from SmartOffice CRM</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.totalPolicies === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Policies Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Run a sync to import policies from SmartOffice
                  </p>
                  <Button onClick={handleRunSync} disabled={!isConfigured || syncing}>
                    <Play className="w-4 h-4 mr-2" />
                    Run First Sync
                  </Button>
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  <p>Policy data will be displayed here after sync completes.</p>
                  <p className="mt-2">Total: {stats.totalPolicies} policies synced</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>SmartOffice Configuration</CardTitle>
              <CardDescription>
                SmartOffice API credentials and sync settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {config ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">API URL</label>
                      <p className="text-sm text-gray-600 mt-1">{config.api_url}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Sitename</label>
                      <p className="text-sm text-gray-600 mt-1">{config.sitename}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Username</label>
                      <p className="text-sm text-gray-600 mt-1">{config.username}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Sync Frequency</label>
                      <p className="text-sm text-gray-600 mt-1">
                        Every {config.sync_frequency_hours} hours
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Configuration Active
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 mx-auto text-amber-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Configuration Required
                  </h3>
                  <p className="text-gray-600">
                    SmartOffice credentials need to be configured in the database
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Sync History</CardTitle>
              <CardDescription>History of SmartOffice sync operations</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.lastSync ? (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-semibold">Last Sync Completed</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(stats.lastSync.completed_at)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div>
                        <span className="text-gray-600">Agents Synced:</span>
                        <span className="ml-2 font-semibold">{stats.lastSync.agents_synced}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Policies Synced:</span>
                        <span className="ml-2 font-semibold">
                          {stats.lastSync.policies_synced}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sync History</h3>
                  <p className="text-gray-600 mb-4">
                    No syncs have been run yet. Run your first sync to see history here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
