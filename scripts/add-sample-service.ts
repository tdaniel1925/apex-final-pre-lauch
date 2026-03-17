// Script to add a sample service product for testing
import { createServiceClient } from '../src/lib/supabase/service';

const serviceClient = createServiceClient();

async function addSampleService() {
  console.log('Adding sample service product...\n');

  // First, get or create AgentPulse category
  let { data: category } = await serviceClient
    .from('product_categories')
    .select('id')
    .eq('slug', 'agentpulse')
    .single();

  if (!category) {
    console.log('Creating AgentPulse category...');
    const { data: newCategory, error: catError } = await serviceClient
      .from('product_categories')
      .insert({
        name: 'AgentPulse Suite',
        slug: 'agentpulse',
        description: 'AI-powered tools for insurance agents',
        display_order: 1,
        is_active: true,
      })
      .select()
      .single();

    if (catError) {
      console.error('Error creating category:', catError);
      return;
    }
    category = newCategory;
  }

  console.log('Category ready:', category.id);

  // Add AgentPulse Pro service
  const { data: product, error: productError } = await serviceClient
    .from('products')
    .insert({
      category_id: category.id,
      name: 'AgentPulse Pro',
      slug: 'agentpulse-pro',
      description: 'AI-powered CRM and automation tools for insurance agents. Includes lead tracking, policy management, and automated follow-ups.',
      long_description: 'Transform your insurance business with AgentPulse Pro. Get access to intelligent lead tracking, automated client communications, policy renewal reminders, and powerful analytics. Perfect for agents looking to scale their business.',

      // Pricing
      retail_price_cents: 9900, // $99/month retail
      wholesale_price_cents: 7900, // $79/month for reps
      bv: 79, // 79 credits

      // Subscription
      is_subscription: true,
      subscription_interval: 'monthly',
      subscription_interval_count: 1,

      // Service fields
      service_type: 'software',
      access_url: 'https://agentpulse.example.com/login',
      setup_instructions: 'After subscribing, you will receive login credentials via email. Sign in at the access URL to get started.',
      trial_days: 7, // 7-day free trial

      // Product type
      is_digital: true,
      stock_status: 'in_stock',

      // Status
      is_active: true,
      is_featured: true,
      display_order: 1,

      // Features
      features: JSON.stringify([
        'AI-powered lead scoring',
        'Automated follow-up sequences',
        'Policy renewal tracking',
        'Client communication hub',
        'Performance analytics dashboard',
        'Mobile app access'
      ]),
    })
    .select()
    .single();

  if (productError) {
    console.error('Error creating product:', productError);
    return;
  }

  console.log('\n✅ Sample service created successfully!\n');
  console.log('Product Details:');
  console.log('- Name:', product.name);
  console.log('- Price: $' + (product.wholesale_price_cents / 100) + '/month');
  console.log('- Credits:', product.bv);
  console.log('- Trial:', product.trial_days + ' days');
  console.log('- Access URL:', product.access_url);
  console.log('\nGo to /dashboard/store to see it!');
}

addSampleService().catch(console.error);
