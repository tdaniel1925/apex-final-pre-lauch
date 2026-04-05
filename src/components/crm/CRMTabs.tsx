'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Users, UserPlus, Phone, CheckSquare, TrendingUp, AlertCircle, Calendar } from 'lucide-react';
import ActivitiesContent from './ActivitiesContent';
import TasksContent from './TasksContent';
import HelpSection from '@/components/business-center/HelpSection';

interface CRMTabsProps {
  stats: {
    totalLeads: number;
    activeContacts: number;
    pendingTasks: number;
    totalActivities: number;
    overdueTasks: number;
    recentLeads: number;
  };
  upcomingTasks: any[];
  allTasks: any[];
  activities: any[];
}

type TabType = 'overview' | 'activities' | 'tasks';

export default function CRMTabs({ stats, upcomingTasks, allTasks, activities }: CRMTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  return (
    <div>
      {/* Tab Navigation */}
      <div className="mb-8 border-b border-slate-200">
        <nav className="flex gap-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'activities'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            Activities
            <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs">
              {stats.totalActivities}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'tasks'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            Tasks
            <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs">
              {stats.pendingTasks}
            </span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div>
            {/* Help Section */}
            <HelpSection
              title="How to Use Your CRM"
              description="Your CRM helps you track prospects from first contact to customer. Use Leads for new prospects, Contacts for established relationships, Activities to log interactions, and Tasks to stay organized."
              steps={[
                'Add Leads when you meet new prospects or collect contact information',
                'Convert Leads to Contacts when they become active customers or partners',
                'Log Activities (calls, emails, meetings) to track all interactions',
                'Create Tasks to follow up with prospects at the right time',
              ]}
              tips={[
                'Free tier: 50 leads, 100 contacts, 20 tasks. Business Center: Unlimited',
                'Use tags to organize leads by source, interest level, or campaign',
                'Set task due dates to ensure timely follow-up with hot prospects',
                'Review Activities tab to see your full interaction history',
              ]}
              collapsible={true}
              defaultExpanded={false}
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Leads */}
              <Link
                href="/dashboard/crm/leads"
                className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <UserPlus className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900">{stats.totalLeads}</div>
                    <div className="text-sm text-slate-600">Total Leads</div>
                  </div>
                </div>
                {stats.recentLeads > 0 && (
                  <div className="text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {stats.recentLeads} new this week
                  </div>
                )}
              </Link>

              {/* Active Contacts */}
              <Link
                href="/dashboard/crm/contacts"
                className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900">{stats.activeContacts}</div>
                    <div className="text-sm text-slate-600">Active Contacts</div>
                  </div>
                </div>
              </Link>

              {/* Pending Tasks */}
              <button
                onClick={() => setActiveTab('tasks')}
                className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow text-left"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <CheckSquare className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900">{stats.pendingTasks}</div>
                    <div className="text-sm text-slate-600">Pending Tasks</div>
                  </div>
                </div>
                {stats.overdueTasks > 0 && (
                  <div className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {stats.overdueTasks} overdue
                  </div>
                )}
              </button>

              {/* Total Activities */}
              <button
                onClick={() => setActiveTab('activities')}
                className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow text-left"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Phone className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900">{stats.totalActivities}</div>
                    <div className="text-sm text-slate-600">Activities Logged</div>
                  </div>
                </div>
              </button>
            </div>

            {/* Quick Actions + Upcoming Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/dashboard/crm/leads/new"
                    className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <UserPlus className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Add Lead</span>
                  </Link>
                  <Link
                    href="/dashboard/crm/contacts/new"
                    className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <Users className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Add Contact</span>
                  </Link>
                  <Link
                    href="/dashboard/crm/tasks/new"
                    className="flex items-center gap-3 p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
                  >
                    <CheckSquare className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-900">Create Task</span>
                  </Link>
                  <Link
                    href="/dashboard/crm/activities/new"
                    className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                  >
                    <Phone className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">Log Activity</span>
                  </Link>
                </div>
              </div>

              {/* Upcoming Tasks */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">Upcoming Tasks</h2>
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    View all
                  </button>
                </div>

                {upcomingTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">No upcoming tasks</p>
                    <Link
                      href="/dashboard/crm/tasks/new"
                      className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block"
                    >
                      Create your first task
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingTasks.map((task) => {
                      const isOverdue = task.due_date && new Date(task.due_date) < new Date();
                      return (
                        <Link
                          key={task.id}
                          href={`/dashboard/crm/tasks/${task.id}`}
                          className="block p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="font-medium text-slate-900 text-sm">{task.title}</div>
                              {task.due_date && (
                                <div
                                  className={`text-xs mt-1 ${
                                    isOverdue ? 'text-red-600 font-medium' : 'text-slate-500'
                                  }`}
                                >
                                  {isOverdue && '⚠️ '}
                                  Due: {new Date(task.due_date).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded ${
                                task.priority === 'urgent'
                                  ? 'bg-red-100 text-red-800'
                                  : task.priority === 'high'
                                    ? 'bg-orange-100 text-orange-800'
                                    : task.priority === 'medium'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {task.priority}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activities' && <ActivitiesContent activities={activities} />}

        {activeTab === 'tasks' && <TasksContent tasks={allTasks} />}
      </div>
    </div>
  );
}
