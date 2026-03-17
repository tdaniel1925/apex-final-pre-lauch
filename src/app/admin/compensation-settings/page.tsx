'use client';

// =============================================
// Compensation Settings Admin Dashboard
// Centralized compensation plan configuration
// =============================================

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import OverviewTab from '@/components/admin/compensation/OverviewTab';
import WaterfallEditor from '@/components/admin/compensation/WaterfallEditor';
import TechRankEditor from '@/components/admin/compensation/TechRankEditor';
import OverrideScheduleEditor from '@/components/admin/compensation/OverrideScheduleEditor';
import BonusProgramToggles from '@/components/admin/compensation/BonusProgramToggles';
import VersionHistory from '@/components/admin/compensation/VersionHistory';

export default function CompensationSettingsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeConfig, setActiveConfig] = useState({
    version: '1.0.0',
    name: 'Default Configuration',
    status: 'active' as 'active' | 'draft' | 'archived',
    effectiveDate: '2026-01-01',
  });

  const handleCreateNewVersion = () => {
    // TODO: Open modal to create new version
    // setShowCreateModal(true);
  };

  const handleActivateConfig = () => {
    // TODO: Confirm and activate draft config
    // if (confirm('Activate this configuration?')) { await activateConfig(); }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Compensation Settings
          </h1>
          <div className="flex items-center gap-3">
            {activeConfig.status === 'draft' && (
              <Button onClick={handleActivateConfig} variant="default">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Activate Configuration
              </Button>
            )}
            <Button onClick={handleCreateNewVersion} variant="outline">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Version
            </Button>
          </div>
        </div>

        {/* Active Config Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-blue-900">
                  {activeConfig.name}
                </h2>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  activeConfig.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : activeConfig.status === 'draft'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {activeConfig.status.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Version {activeConfig.version} • Effective: {new Date(activeConfig.effectiveDate).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-600">Last Modified</p>
              <p className="text-sm font-medium text-blue-900">
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line" className="mb-6 border-b border-gray-200 w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="waterfall">Waterfall</TabsTrigger>
          <TabsTrigger value="tech-ranks">Tech Ranks</TabsTrigger>
          <TabsTrigger value="overrides">Override Schedules</TabsTrigger>
          <TabsTrigger value="bonuses">Bonus Programs</TabsTrigger>
          <TabsTrigger value="history">Version History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>

        {/* Waterfall Tab */}
        <TabsContent value="waterfall">
          <WaterfallEditor />
        </TabsContent>

        {/* Tech Ranks Tab */}
        <TabsContent value="tech-ranks">
          <TechRankEditor />
        </TabsContent>

        {/* Override Schedules Tab */}
        <TabsContent value="overrides">
          <OverrideScheduleEditor />
        </TabsContent>

        {/* Bonus Programs Tab */}
        <TabsContent value="bonuses">
          <BonusProgramToggles />
        </TabsContent>

        {/* Version History Tab */}
        <TabsContent value="history">
          <VersionHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
