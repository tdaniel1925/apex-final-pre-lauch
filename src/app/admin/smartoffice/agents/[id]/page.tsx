/**
 * SmartOffice Agent Detail Page
 * Displays comprehensive agent information, policies, and commissions
 */

import { requireAdmin } from '@/lib/auth/admin';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AgentDetailClient from '@/components/admin/smartoffice/AgentDetailClient';

export const metadata: Metadata = {
  title: 'Agent Details | SmartOffice | Apex Back Office',
  description: 'View detailed SmartOffice agent information',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: { id: string };
}

export default async function AgentDetailPage({ params }: PageProps) {
  await requireAdmin();

  // Fetch agent data
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/smartoffice/agents/${params.id}`,
    { cache: 'no-store' }
  );

  if (!response.ok) {
    notFound();
  }

  const agentData = await response.json();

  return (
    <div className="p-8">
      <AgentDetailClient agentData={agentData} />
    </div>
  );
}
