'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TreeNode {
  id: number;
  name: string;
  slug: string;
  level: number;
  directSponsors: number;
  totalDownline: number;
  joined: string;
  children: TreeNode[];
  expanded?: boolean;
}

export default function GenealogyV2() {
  const [maxDepth, setMaxDepth] = useState(7);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set([1]));

  // Mock genealogy tree data
  const treeData: TreeNode = {
    id: 1,
    name: 'Sarah Wilson',
    slug: 'swilson',
    level: 3,
    directSponsors: 4,
    totalDownline: 18,
    joined: '2023-01-15',
    children: [
      {
        id: 2,
        name: 'Jennifer Lee',
        slug: 'jlee',
        level: 4,
        directSponsors: 3,
        totalDownline: 8,
        joined: '2023-02-20',
        children: [
          {
            id: 5,
            name: 'David Kim',
            slug: 'dkim',
            level: 5,
            directSponsors: 2,
            totalDownline: 3,
            joined: '2023-03-15',
            children: []
          },
          {
            id: 6,
            name: 'Lisa Chen',
            slug: 'lchen',
            level: 5,
            directSponsors: 1,
            totalDownline: 2,
            joined: '2023-04-01',
            children: []
          }
        ]
      },
      {
        id: 3,
        name: 'Robert Taylor',
        slug: 'rtaylor',
        level: 4,
        directSponsors: 2,
        totalDownline: 5,
        joined: '2023-02-28',
        children: [
          {
            id: 7,
            name: 'Michael Brown',
            slug: 'mbrown',
            level: 5,
            directSponsors: 0,
            totalDownline: 0,
            joined: '2023-05-10',
            children: []
          }
        ]
      },
      {
        id: 4,
        name: 'Amanda White',
        slug: 'awhite',
        level: 4,
        directSponsors: 1,
        totalDownline: 2,
        joined: '2023-03-10',
        children: []
      }
    ]
  };

  const stats = {
    totalMembers: 18,
    activeMembers: 16,
    newThisMonth: 3,
    maxDepth: 5,
    directSponsors: 4
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Chart) {
      const Chart = (window as any).Chart;

      // Level Distribution Donut Chart
      const ctx1 = (document.getElementById('levelDistChart') as HTMLCanvasElement)?.getContext('2d');
      if (ctx1) {
        new Chart(ctx1, {
          type: 'doughnut',
          data: {
            labels: ['Level 4', 'Level 5', 'Level 6', 'Level 7'],
            datasets: [{
              data: [4, 8, 4, 2],
              backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'],
              borderWidth: 0,
              hoverOffset: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#1e293b',
                padding: 10,
                titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
                bodyFont: { family: "'Inter', sans-serif", size: 11 },
                cornerRadius: 8
              }
            }
          }
        });
      }

      // Growth Timeline Chart
      const ctx2 = (document.getElementById('growthTimelineChart') as HTMLCanvasElement)?.getContext('2d');
      if (ctx2) {
        const gradient = ctx2.createLinearGradient(0, 0, 0, 180);
        gradient.addColorStop(0, 'rgba(16,185,129,0.2)');
        gradient.addColorStop(1, 'rgba(16,185,129,0)');

        new Chart(ctx2, {
          type: 'bar',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              label: 'New Members',
              data: [2, 3, 4, 2, 5, 2],
              backgroundColor: '#10b981',
              borderRadius: 6,
              barThickness: 20
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#1e293b',
                padding: 10,
                titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
                bodyFont: { family: "'Inter', sans-serif", size: 11 },
                cornerRadius: 8
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: '#f1f5f9', drawBorder: false },
                ticks: {
                  font: { family: "'Inter', sans-serif", size: 11 },
                  color: '#94a3b8',
                  stepSize: 2
                }
              },
              x: {
                grid: { display: false, drawBorder: false },
                ticks: { font: { family: "'Inter', sans-serif", size: 11 }, color: '#94a3b8' }
              }
            }
          }
        });
      }
    }
  }, []);

  const toggleNode = (nodeId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderTreeNode = (node: TreeNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isRoot = depth === 0;

    return (
      <div key={node.id} className="relative">
        {/* Node Card */}
        <div
          className={`relative inline-flex flex-col items-center ${
            depth > 0 ? 'ml-12' : ''
          }`}
        >
          {/* Connector Line */}
          {depth > 0 && (
            <>
              <div className="absolute -left-12 top-1/2 w-12 h-0.5 bg-neutral-300"></div>
              <div className="absolute -left-12 top-0 w-0.5 h-1/2 bg-neutral-300"></div>
            </>
          )}

          <div
            className={`relative p-4 rounded-large shadow-custom transition-all cursor-pointer hover:shadow-custom-hover ${
              isRoot
                ? 'bg-gradient-to-br from-primary-500 to-primary-700 text-white border-2 border-primary-600'
                : 'bg-white border-2 border-neutral-200 hover:border-primary-200'
            } ${isExpanded && hasChildren ? 'mb-6' : ''}`}
            onClick={() => hasChildren && toggleNode(node.id)}
          >
            {/* Avatar */}
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-custom ${
                  isRoot
                    ? 'bg-white text-primary-600'
                    : 'bg-gradient-to-br from-blue-500 to-blue-700 text-white'
                }`}
              >
                {node.name.charAt(0)}
              </div>
              <div>
                <p className={`font-semibold text-sm ${isRoot ? 'text-white' : 'text-neutral-900'}`}>
                  {node.name}
                </p>
                <p className={`text-xs ${isRoot ? 'text-primary-100' : 'text-neutral-500'}`}>
                  @{node.slug}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className={`p-2 rounded ${isRoot ? 'bg-white/20' : 'bg-neutral-50'}`}>
                <p className={`text-xs ${isRoot ? 'text-primary-100' : 'text-neutral-500'}`}>Level</p>
                <p className={`text-sm font-bold ${isRoot ? 'text-white' : 'text-neutral-900'}`}>
                  {node.level}
                </p>
              </div>
              <div className={`p-2 rounded ${isRoot ? 'bg-white/20' : 'bg-neutral-50'}`}>
                <p className={`text-xs ${isRoot ? 'text-primary-100' : 'text-neutral-500'}`}>Direct</p>
                <p className={`text-sm font-bold ${isRoot ? 'text-white' : 'text-neutral-900'}`}>
                  {node.directSponsors}
                </p>
              </div>
              <div className={`p-2 rounded ${isRoot ? 'bg-white/20' : 'bg-neutral-50'}`}>
                <p className={`text-xs ${isRoot ? 'text-primary-100' : 'text-neutral-500'}`}>Total</p>
                <p className={`text-sm font-bold ${isRoot ? 'text-white' : 'text-neutral-900'}`}>
                  {node.totalDownline}
                </p>
              </div>
            </div>

            {/* Expand Button */}
            {hasChildren && (
              <div className="mt-3 pt-3 border-t border-neutral-200">
                <div className="flex items-center justify-center gap-2 text-xs">
                  <i className={`${isExpanded ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} ${isRoot ? 'text-white' : 'text-neutral-400'}`}></i>
                  <span className={isRoot ? 'text-white' : 'text-neutral-600'}>
                    {isExpanded ? 'Collapse' : `View ${node.children.length} member${node.children.length > 1 ? 's' : ''}`}
                  </span>
                </div>
              </div>
            )}

            {isRoot && (
              <div className="absolute -top-2 -right-2">
                <span className="flex items-center gap-1 px-2 py-1 bg-secondary-500 text-white text-xs font-bold rounded-full shadow-custom">
                  <i className="ri-user-star-line"></i>
                  You
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Children */}
        {isExpanded && hasChildren && (
          <div className="ml-8 mt-4 space-y-4 relative">
            {/* Vertical connector for children */}
            <div className="absolute left-0 top-0 bottom-4 w-0.5 bg-neutral-300"></div>
            {node.children.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-neutral-50">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 bg-white border-r border-neutral-200 flex flex-col z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-neutral-900 rounded-small flex items-center justify-center text-white">
            <i className="ri-bar-chart-box-fill text-xl"></i>
          </div>
          <span className="font-heading font-bold text-xl text-neutral-900">SmartViz</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <div className="mb-6">
            <p className="px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Main</p>
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-small transition-all">
              <i className="ri-dashboard-line"></i>
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link href="/matrix-v2" className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-small transition-all">
              <i className="ri-organization-chart"></i>
              <span className="font-medium">Matrix</span>
            </Link>
            <Link href="/genealogy-v2" className="flex items-center gap-3 px-4 py-3 bg-neutral-900 text-white rounded-small shadow-custom transition-all">
              <i className="ri-git-branch-line"></i>
              <span className="font-medium">Genealogy</span>
            </Link>
          </div>

          <div className="mb-6">
            <p className="px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Management</p>
            <Link href="/profile-v2" className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-small transition-all">
              <i className="ri-user-settings-line"></i>
              <span className="font-medium">Profile &amp; Plan</span>
            </Link>
            <Link href="/reports-v2" className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-small transition-all">
              <i className="ri-file-chart-line"></i>
              <span className="font-medium">Reports</span>
            </Link>
          </div>
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-primary-500 rounded-large p-5 text-white relative overflow-hidden shadow-custom">
            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-white opacity-20 rounded-full"></div>
            <div className="relative z-10">
              <h4 className="font-heading font-bold text-lg mb-1">Grow Your Tree</h4>
              <p className="text-primary-50 text-sm mb-3 opacity-90">Sponsor new members</p>
              <button className="w-full bg-white text-primary-600 font-bold py-2 rounded-small text-sm hover:bg-primary-50 transition-colors">Share Link</button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-heading text-2xl font-bold text-neutral-900">Genealogy Tree</h1>
                <p className="text-sm text-neutral-500 mt-0.5">Your personal downline - members you've sponsored</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100">
                  <i className="ri-git-branch-line mr-1.5"></i>
                  {stats.maxDepth} Levels Deep
                </span>
              </div>
            </div>
          </div>

          {/* Depth Filter */}
          <div className="px-6 pb-4 flex items-center gap-2">
            <span className="text-sm text-neutral-600 font-medium">View Depth:</span>
            {[7, 10, 15, 20].map((depth) => (
              <button
                key={depth}
                onClick={() => setMaxDepth(depth)}
                className={`px-3 py-1.5 rounded-small text-xs font-semibold transition-colors ${
                  maxDepth === depth
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {depth} Levels
              </button>
            ))}
          </div>
        </header>

        <div className="flex-1 p-6">
          {/* Stats Row */}
          <section className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-large shadow-custom p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
                  <i className="ri-group-line"></i>
                </div>
                <span className="text-sm text-neutral-500">Total Team</span>
              </div>
              <p className="font-heading text-2xl font-bold text-neutral-900">{stats.totalMembers}</p>
              <p className="text-xs text-neutral-400 mt-1">All generations</p>
            </div>

            <div className="bg-white rounded-large shadow-custom p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                  <i className="ri-checkbox-circle-line"></i>
                </div>
                <span className="text-sm text-neutral-500">Active</span>
              </div>
              <p className="font-heading text-2xl font-bold text-neutral-900">{stats.activeMembers}</p>
              <p className="text-xs text-neutral-400 mt-1">{stats.totalMembers - stats.activeMembers} inactive</p>
            </div>

            <div className="bg-white rounded-large shadow-custom p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <i className="ri-user-add-line"></i>
                </div>
                <span className="text-sm text-neutral-500">New (30d)</span>
              </div>
              <p className="font-heading text-2xl font-bold text-neutral-900">{stats.newThisMonth}</p>
              <p className="text-xs text-neutral-400 mt-1">This month</p>
            </div>

            <div className="bg-white rounded-large shadow-custom p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                  <i className="ri-stack-line"></i>
                </div>
                <span className="text-sm text-neutral-500">Max Depth</span>
              </div>
              <p className="font-heading text-2xl font-bold text-neutral-900">{stats.maxDepth}</p>
              <p className="text-xs text-neutral-400 mt-1">Generations</p>
            </div>

            <div className="bg-white rounded-large shadow-custom p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-secondary-50 text-secondary-600 flex items-center justify-center">
                  <i className="ri-user-star-line"></i>
                </div>
                <span className="text-sm text-neutral-500">Direct</span>
              </div>
              <p className="font-heading text-2xl font-bold text-neutral-900">{stats.directSponsors}</p>
              <p className="text-xs text-neutral-400 mt-1">Your sponsors</p>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Charts Column */}
            <div className="space-y-6">
              {/* Level Distribution */}
              <div className="bg-white rounded-large shadow-custom p-6">
                <div className="flex items-center gap-2 mb-4">
                  <i className="ri-pie-chart-line text-primary-500"></i>
                  <h2 className="font-heading text-base font-bold text-neutral-900">Level Distribution</h2>
                </div>
                <div className="h-40 flex items-center justify-center">
                  <canvas id="levelDistChart"></canvas>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary-500"></span>
                      <span className="text-neutral-600">Level 4</span>
                    </div>
                    <span className="font-bold text-neutral-900">4</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                      <span className="text-neutral-600">Level 5</span>
                    </div>
                    <span className="font-bold text-neutral-900">8</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                      <span className="text-neutral-600">Level 6</span>
                    </div>
                    <span className="font-bold text-neutral-900">4</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                      <span className="text-neutral-600">Level 7</span>
                    </div>
                    <span className="font-bold text-neutral-900">2</span>
                  </div>
                </div>
              </div>

              {/* Growth Timeline */}
              <div className="bg-white rounded-large shadow-custom p-6">
                <div className="flex items-center gap-2 mb-4">
                  <i className="ri-bar-chart-line text-primary-500"></i>
                  <h2 className="font-heading text-base font-bold text-neutral-900">Growth Timeline</h2>
                </div>
                <div className="h-48">
                  <canvas id="growthTimelineChart"></canvas>
                </div>
              </div>
            </div>

            {/* Tree Column */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-large shadow-custom p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <i className="ri-node-tree text-primary-500"></i>
                    <h2 className="font-heading text-base font-bold text-neutral-900">Organization Tree</h2>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-small text-sm font-medium hover:bg-neutral-200 transition-colors">
                    <i className="ri-download-line"></i>
                    Export Tree
                  </button>
                </div>

                {/* Tree Visualization */}
                <div className="overflow-x-auto pb-6">
                  <div className="inline-block min-w-full">
                    {renderTreeNode(treeData)}
                  </div>
                </div>

                {/* Help Text */}
                <div className="mt-6 bg-primary-50 border border-primary-100 rounded-large p-4 flex items-start gap-3">
                  <i className="ri-information-line text-primary-600 text-xl shrink-0"></i>
                  <div>
                    <p className="text-xs font-semibold text-primary-900 mb-1">Tree Navigation</p>
                    <p className="text-xs text-primary-700">
                      Click on any member card to expand or collapse their downline. The tree shows your direct sponsors and their sponsored members across all generations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
