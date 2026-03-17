'use client';

// =============================================
// Compensation Settings Admin Dashboard
// Centralized compensation plan configuration
// =============================================

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
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
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Configuration Overview
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Waterfall Summary */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Waterfall Configuration
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">BotMakers Fee:</span>
                    <span className="font-medium">5.0%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Apex Take:</span>
                    <span className="font-medium">10.0%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bonus Pool:</span>
                    <span className="font-medium">10.0%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Leadership Pool:</span>
                    <span className="font-medium">5.0%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Seller Commission:</span>
                    <span className="font-medium">35.0%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Override Pool:</span>
                    <span className="font-medium">35.0%</span>
                  </div>
                </div>
              </div>

              {/* Tech Ranks Summary */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Tech Ladder Ranks
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">Total Ranks: <span className="font-medium text-gray-900">9</span></p>
                  <p className="text-gray-600">Highest Rank: <span className="font-medium text-gray-900">Elite</span></p>
                  <p className="text-gray-600">Entry Requirement: <span className="font-medium text-gray-900">1 Personal Credit</span></p>
                </div>
              </div>

              {/* Bonus Programs Summary */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Active Bonus Programs
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Fast Start Bonus</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Rank Advancement Bonus</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span>Car Allowance (Disabled)</span>
                  </div>
                </div>
              </div>

              {/* Override Schedule Summary */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                  </svg>
                  Override Configuration
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">Max Override Levels: <span className="font-medium text-gray-900">5</span></p>
                  <p className="text-gray-600">Elite L1 Override: <span className="font-medium text-gray-900">20%</span></p>
                  <p className="text-gray-600">Compression: <span className="font-medium text-gray-900">Enabled</span></p>
                </div>
              </div>
            </div>
          </div>
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
