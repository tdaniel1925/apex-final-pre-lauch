'use client';

import { useState } from 'react';
import type { Distributor } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Network,
  Users,
  TrendingUp,
  ChevronUp,
  UserPlus,
  Award,
  Target
} from 'lucide-react';

interface MatrixV4ClientProps {
  data: {
    distributor: Distributor;
    matrixParent: {
      name: string;
      repNumber: number | null;
      level: number;
    } | null;
    sponsor: string;
    matrixChildren: Distributor[];
  };
}

export default function MatrixV4Client({ data }: MatrixV4ClientProps) {
  const { distributor, matrixParent, sponsor, matrixChildren } = data;
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const positions = [1, 2, 3, 4, 5];
  const filledPositions = matrixChildren.length;
  const availablePositions = 5 - filledPositions;
  const capacityPercentage = (filledPositions / 5) * 100;

  const getChildAtPosition = (position: number) => {
    return matrixChildren.find((child) => child.matrix_position === position);
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Matrix View</h1>
        <p className="text-muted-foreground">
          Your position in the 5×7 forced matrix structure
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rep Number</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{distributor.rep_number || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Level {distributor.matrix_depth}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Direct Downline</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filledPositions}</div>
            <p className="text-xs text-muted-foreground">of 5 positions filled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacity</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{capacityPercentage.toFixed(0)}%</div>
            <Progress value={capacityPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Slots</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availablePositions}</div>
            <p className="text-xs text-muted-foreground">Open positions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Matrix Visualization */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Matrix Structure</CardTitle>
              <CardDescription>
                Your position and direct downline in the forced matrix
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Matrix Parent */}
              {matrixParent && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ChevronUp className="h-4 w-4" />
                    <span>Matrix Parent</span>
                  </div>
                  <div className="flex justify-center">
                    <div className="bg-accent rounded-lg p-4 w-48 border-2 border-primary/20">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {matrixParent.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{matrixParent.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Rep #{matrixParent.repNumber} • Level {matrixParent.level}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-px h-8 bg-border"></div>
                  </div>
                </div>
              )}

              {/* You */}
              <div className="flex justify-center">
                <div className="bg-primary/10 rounded-lg p-4 w-56 border-2 border-primary">
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
                      <p className="text-xs text-muted-foreground">
                        YOU • Rep #{distributor.rep_number}
                      </p>
                      <Badge variant="outline" className="mt-1">
                        Level {distributor.matrix_depth}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Direct Downline */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Network className="h-4 w-4" />
                    <span>Direct Downline ({filledPositions}/5)</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {availablePositions} slots available
                  </Badge>
                </div>

                <div className="grid grid-cols-5 gap-3">
                  {positions.map((position) => {
                    const child = getChildAtPosition(position);
                    const isSelected = selectedPosition === position;

                    return (
                      <div
                        key={position}
                        onClick={() => setSelectedPosition(isSelected ? null : position)}
                        className={`
                          rounded-lg p-3 cursor-pointer transition-all
                          ${child
                            ? 'bg-accent hover:bg-accent/80 border-2 border-border hover:border-primary/50'
                            : 'bg-muted/30 border-2 border-dashed border-muted-foreground/20 hover:border-muted-foreground/40'
                          }
                          ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
                        `}
                      >
                        <div className="text-center space-y-2">
                          <div className="text-xs font-medium text-muted-foreground">
                            Position {position}
                          </div>
                          {child ? (
                            <>
                              <Avatar className="h-10 w-10 mx-auto">
                                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                  {getInitials(child.first_name, child.last_name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-xs font-medium truncate">
                                  {child.first_name}
                                </p>
                                <p className="text-xs font-medium truncate">
                                  {child.last_name}
                                </p>
                              </div>
                              <Badge
                                variant={child.licensing_status === 'licensed' ? 'default' : 'secondary'}
                                className="text-xs px-1 py-0"
                              >
                                {child.licensing_status === 'licensed' ? '✓' : '○'}
                              </Badge>
                            </>
                          ) : (
                            <>
                              <div className="h-10 w-10 mx-auto rounded-full bg-muted flex items-center justify-center">
                                <UserPlus className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <p className="text-xs text-muted-foreground">Empty</p>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Placement Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Placement Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Matrix Parent</p>
                <p className="font-medium">
                  {matrixParent ? matrixParent.name : 'Master'}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Sponsor</p>
                <p className="font-medium">{sponsor}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Your Position</p>
                <p className="font-medium">
                  {distributor.matrix_position ? `Position ${distributor.matrix_position}` : 'Root'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Selected Member Detail */}
          {selectedPosition !== null && getChildAtPosition(selectedPosition) && (
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle className="text-lg">Member Details</CardTitle>
                <CardDescription>Position {selectedPosition}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {(() => {
                  const child = getChildAtPosition(selectedPosition)!;
                  return (
                    <>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(child.first_name, child.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">
                            {child.first_name} {child.last_name}
                          </p>
                          <Badge variant={child.licensing_status === 'licensed' ? 'default' : 'secondary'}>
                            {child.licensing_status === 'licensed' ? 'Licensed' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Level</span>
                          <span className="font-medium">{child.matrix_depth}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Joined</span>
                          <span className="font-medium">
                            {new Date(child.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Licensed Members</span>
                <Badge variant="default">
                  {matrixChildren.filter(c => c.licensing_status === 'licensed').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending Members</span>
                <Badge variant="secondary">
                  {matrixChildren.filter(c => c.licensing_status !== 'licensed').length}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Fill Rate</span>
                <span className="font-semibold">{capacityPercentage.toFixed(0)}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
