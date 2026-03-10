'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Distributor } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  TrendingUp,
  Award,
  Target,
  Link2,
  Copy,
  Check,
  UserPlus,
  Network,
  ChevronRight
} from 'lucide-react';

interface DashboardV4ClientProps {
  data: {
    distributor: Distributor;
    stats: {
      repNumber: number;
      level: number;
      personalEnrollees: number;
      organizationEnrollees: number;
      matrixChildren: number;
      directReferrals: number;
    };
    placement: {
      matrixParent: string;
      sponsor: string;
    };
    referralLink: string;
    recentMembers: Array<{ first_name: string; last_name: string; created_at: string }>;
    recruits: Distributor[];
    matrixChildren: Distributor[];
  };
}

export default function DashboardV4Client({ data }: DashboardV4ClientProps) {
  const [copied, setCopied] = useState(false);
  const { distributor, stats, placement, referralLink, recentMembers, recruits, matrixChildren } = data;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const matrixProgress = (stats.matrixChildren / 5) * 100;

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* Welcome Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {distributor.first_name}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your business today
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Rep Number Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rep Number</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{stats.repNumber}</div>
            <p className="text-xs text-muted-foreground">
              Level {stats.level} • {placement.matrixParent}
            </p>
          </CardContent>
        </Card>

        {/* Personal Enrollees Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personal Enrollees</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.personalEnrollees}</div>
            <p className="text-xs text-muted-foreground">
              Direct referrals you've made
            </p>
          </CardContent>
        </Card>

        {/* Organization Total Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organization Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.organizationEnrollees}</div>
            <p className="text-xs text-muted-foreground">
              Total team members
            </p>
          </CardContent>
        </Card>

        {/* Matrix Position Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matrix Position</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.matrixChildren}/5</div>
            <Progress value={matrixProgress} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Main Content - Left Side */}
        <div className="lg:col-span-4 space-y-6">
          {/* Referral Link Card */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Your Referral Link
              </CardTitle>
              <CardDescription>
                Share this link to grow your network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-md border bg-background px-3 py-2 text-sm font-mono">
                  {referralLink}
                </div>
                <button
                  onClick={copyReferralLink}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Team Overview Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Team Overview</CardTitle>
              <CardDescription>
                View your direct referrals and matrix team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="referrals" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="referrals">
                    Direct Referrals ({stats.directReferrals})
                  </TabsTrigger>
                  <TabsTrigger value="matrix">
                    Matrix Team ({stats.matrixChildren})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="referrals" className="space-y-4">
                  {recruits.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Level</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recruits.slice(0, 5).map((recruit) => (
                            <TableRow key={recruit.id}>
                              <TableCell className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs">
                                    {getInitials(recruit.first_name, recruit.last_name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">
                                  {recruit.first_name} {recruit.last_name}
                                </span>
                              </TableCell>
                              <TableCell>{recruit.matrix_depth}</TableCell>
                              <TableCell>
                                <Badge variant={recruit.licensing_status === 'licensed' ? 'default' : 'secondary'}>
                                  {recruit.licensing_status === 'licensed' ? 'Licensed' : 'Pending'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {new Date(recruit.created_at).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="mx-auto h-12 w-12 mb-2 opacity-50" />
                      <p className="text-sm">No direct referrals yet</p>
                      <p className="text-xs mt-1">Share your referral link to get started</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="matrix" className="space-y-4">
                  {matrixChildren.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {matrixChildren.map((child) => (
                            <TableRow key={child.id}>
                              <TableCell className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs">
                                    {getInitials(child.first_name, child.last_name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">
                                  {child.first_name} {child.last_name}
                                </span>
                              </TableCell>
                              <TableCell>#{child.matrix_position}</TableCell>
                              <TableCell>
                                <Badge variant={child.licensing_status === 'licensed' ? 'default' : 'secondary'}>
                                  {child.licensing_status === 'licensed' ? 'Licensed' : 'Pending'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {new Date(child.created_at).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Network className="mx-auto h-12 w-12 mb-2 opacity-50" />
                      <p className="text-sm">No matrix team members yet</p>
                      <p className="text-xs mt-1">Your first 5 will appear here</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Right Side */}
        <div className="lg:col-span-3 space-y-6">
          {/* Placement Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Placement Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Matrix Parent</p>
                <p className="font-medium">{placement.matrixParent}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Sponsor</p>
                <p className="font-medium">{placement.sponsor}</p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>
                Latest team member joins
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentMembers.length > 0 ? (
                <div className="space-y-3">
                  {recentMembers.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-xs">
                          {getInitials(member.first_name, member.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-0.5">
                        <p className="text-sm font-medium">
                          {member.first_name} {member.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Joined {new Date(member.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href="/matrix"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                    <Network className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium text-sm">View Matrix</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/genealogy"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium text-sm">View Genealogy</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/profile"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium text-sm">Edit Profile</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
