import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { VimeoEmbed } from '@/components/business-center/VimeoEmbed';
import { CheckCircle } from 'lucide-react';

export default async function BusinessCenterSuccessPage({
  searchParams
}: {
  searchParams: { session_id?: string }
}) {
  const supabase = await createClient();

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get distributor
  const { data: distributor } = await supabase
    .from('distributors')
    .select('id, first_name, last_name')
    .eq('user_id', user.id)
    .single();

  if (!distributor) redirect('/dashboard');

  // Get Business Center access
  const { data: bcProduct } = await supabase
    .from('products')
    .select('id, name, price')
    .eq('slug', 'businesscenter')
    .single();

  const { data: access } = await supabase
    .from('service_access')
    .select('*')
    .eq('distributor_id', distributor.id)
    .eq('product_id', bcProduct?.id)
    .eq('status', 'active')
    .single();

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Success Hero */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Welcome to Business Center!</h1>
        <p className="text-slate-600">Your subscription is now active</p>
      </div>

      {/* Vimeo Video */}
      <div className="mb-8">
        <VimeoEmbed
          videoId="PLACEHOLDER_VIMEO_ID"
          title="Getting Started with Business Center"
        />
      </div>

      {/* Subscription Details */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Subscription Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-600">Plan</p>
            <p className="font-semibold">{bcProduct?.name}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Price</p>
            <p className="font-semibold">${bcProduct?.price}/month</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Status</p>
            <p className="font-semibold text-green-600">Active</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Started</p>
            <p className="font-semibold">{access?.starts_at ? new Date(access.starts_at).toLocaleDateString() : 'Today'}</p>
          </div>
        </div>
      </div>

      {/* What's Next */}
      <div className="bg-blue-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">What's Next?</h2>
        <ul className="space-y-3">
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">✓</span>
            <span>Watch the video above to learn about Business Center features</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">✓</span>
            <span>Explore your dashboard and AI tools</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">✓</span>
            <span>Set up your replicated website</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">✓</span>
            <span>Access marketing materials and training</span>
          </li>
        </ul>
      </div>

      {/* CTA Buttons */}
      <div className="flex gap-4 justify-center">
        <a
          href="/dashboard"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          Go to Dashboard
        </a>
        <a
          href="/dashboard/business-center"
          className="border border-slate-300 px-6 py-3 rounded-lg font-semibold hover:bg-slate-50"
        >
          Learn More
        </a>
      </div>
    </div>
  );
}
