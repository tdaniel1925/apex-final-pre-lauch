'use client';

import { useState } from 'react';
import type { Distributor } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  GitBranch,
  Users,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronRight,
  Calendar
} from 'lucide-react';

interface GenealogyV4ClientProps {
  data: {
    distributor: Distributor;
    directReferrals: Distributor[];
  };
}

export default function GenealogyV4Client({ data }: GenealogyV4ClientProps) {
  const { distributor, directReferrals } = data;
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const totalDownline = directReferrals.length;
  const activeMembers = directReferrals.filter(r => r.licensing_status === 'licensed').length;
  const recentJoins = directReferrals.filter(r => {
    const joinDate = new Date(r.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return joinDate > thirtyDaysAgo;
  }).length;

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Genealogy Tree</h1>
        <p className="text-muted-foreground">
          Your sponsor-based downline organization
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Team</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDownline}</div>
            <p className="text-xs text-muted-foreground">Direct referrals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMembers}</div>
            <p className="text-xs text-muted-foreground">Licensed members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentJoins}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Level</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{distributor.matrix_depth}</div>
            <p className="text-xs text-muted-foreground">Matrix depth</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tree View */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Organization Tree</CardTitle>
              <CardDescription>
                Click to expand and view downline details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Root - You */}
              <div className="relative">
                <div className="bg-primary/10 rounded-lg p-4 border-2 border-primary">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(distributor.first_name, distributor.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">
                        {distributor.first_name} {distributor.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        YOU • Rep #{distributor.rep_number || 'N/A'}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">Level {distributor.matrix_depth}</Badge>
                        <Badge variant="secondary">{totalDownline} Direct</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Referrals */}
                {directReferrals.length > 0 && (
                  <div className="mt-4 ml-8 space-y-3 border-l-2 border-muted pl-6">
                    {directReferrals.map((referral, idx) => {
                      const isExpanded = expandedNodes.has(referral.id);

                      return (
                        <div key={referral.id} className="relative">
                          {/* Connector Line */}
                          <div className="absolute left-0 top-6 w-6 h-px bg-muted -ml-6"></div>

                          <div
                            onClick={() => toggleNode(referral.id)}
                            className="bg-card rounded-lg p-4 border hover:border-primary/50 transition-all cursor-pointer hover:shadow-md"
                          >
                            <div className="flex items-center gap-3">
                              <button className="flex-shrink-0">
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                )}
                              </button>
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-accent text-accent-foreground">
                                  {getInitials(referral.first_name, referral.last_name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-medium">
                                  {referral.first_name} {referral.last_name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Rep #{referral.rep_number || 'N/A'} • Level {referral.matrix_depth}
                                </p>
                              </div>
                              <Badge variant={referral.licensing_status === 'licensed' ? 'default' : 'secondary'}>
                                {referral.licensing_status === 'licensed' ? 'Licensed' : 'Pending'}
                              </Badge>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                              <div className="mt-4 pt-4 border-t space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Calendar className="h-4 w-4" />
                                  <span>Joined {new Date(referral.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="bg-muted/50 rounded-md p-3 mt-2">
                                  <p className="text-xs text-muted-foreground mb-1">Downline Summary</p>
                                  <p className="text-xs">
                                    This member's downline tree would appear here in the full version.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {directReferrals.length === 0 && (
                  <div className="mt-8 text-center py-8 text-muted-foreground">
                    <GitBranch className="mx-auto h-12 w-12 mb-2 opacity-50" />
                    <p className="text-sm">No direct referrals yet</p>
                    <p className="text-xs mt-1">Share your referral link to start building your team</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Team Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Licensed</span>
                  <Badge variant="default">{activeMembers}</Badge>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <Badge variant="secondary">{totalDownline - activeMembers}</Badge>
                </div>
                <Separator className="my-3" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Direct</span>
                  <span className="text-lg font-bold">{totalDownline}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Joins */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Joins</CardTitle>
              <CardDescription>Last 5 team members</CardDescription>
            </CardHeader>
            <CardContent>
              {directReferrals.length > 0 ? (
                <div className="space-y-3">
                  {directReferrals.slice(0, 5).map((referral) => (
                    <div key={referral.id} className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-xs bg-accent">
                          {getInitials(referral.first_name, referral.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {referral.first_name} {referral.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(referral.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm">No team members yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Growth</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">This Month</span>
                <span className="font-semibold text-primary">+{recentJoins}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Activation Rate</span>
                <span className="font-semibold">
                  {totalDownline > 0 ? ((activeMembers / totalDownline) * 100).toFixed(0) : 0}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Table */}
      {directReferrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Direct Referrals</CardTitle>
            <CardDescription>Complete list of your direct team members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Rep #</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {directReferrals.map((referral) => (
                    <TableRow key={referral.id}>
                      <TableCell className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(referral.first_name, referral.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {referral.first_name} {referral.last_name}
                        </span>
                      </TableCell>
                      <TableCell>{referral.rep_number || 'N/A'}</TableCell>
                      <TableCell>{referral.matrix_depth}</TableCell>
                      <TableCell>
                        <Badge variant={referral.licensing_status === 'licensed' ? 'default' : 'secondary'}>
                          {referral.licensing_status === 'licensed' ? 'Licensed' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(referral.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
