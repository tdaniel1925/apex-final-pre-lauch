'use client';

// =============================================
// Email Management System with AI
// Two-tab system: Send Email & Customize Template
// =============================================

import { useState } from 'react';
import SendEmailTab from './email-system/SendEmailTab';
import CustomizeTemplateTab from './email-system/CustomizeTemplateTab';

interface EmailManagementSystemProps {
  adminId: string;
}

export default function EmailManagementSystem({ adminId }: EmailManagementSystemProps) {
  const [activeTab, setActiveTab] = useState<'send' | 'customize'>('send');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('send')}
            className={`
              px-6 py-4 text-sm font-medium border-b-2 transition-colors
              ${activeTab === 'send'
                ? 'border-[#2c5aa0] text-[#2c5aa0]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Send Email
          </button>
          <button
            onClick={() => setActiveTab('customize')}
            className={`
              px-6 py-4 text-sm font-medium border-b-2 transition-colors
              ${activeTab === 'customize'
                ? 'border-[#2c5aa0] text-[#2c5aa0]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Customize Template
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'send' && <SendEmailTab adminId={adminId} />}
        {activeTab === 'customize' && <CustomizeTemplateTab adminId={adminId} />}
      </div>
    </div>
  );
}
