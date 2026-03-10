// =============================================
// Winflex SSO API
// Generates SSO XML for Winflex authentication
// =============================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function GET() {
  try {
    const supabase = await createClient();

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get distributor data
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select('id, email, first_name, last_name, phone, address_line1, address_line2, city, state, zip, is_licensed_agent')
      .eq('auth_user_id', user.id)
      .single();

    if (distError || !distributor) {
      return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });
    }

    // Check if user is a licensed agent
    if (!distributor.is_licensed_agent) {
      return NextResponse.json({ error: 'Licensed agents only' }, { status: 403 });
    }

    // Build the return URL (back to quotes page)
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_SITE_URL || 'localhost:3000';
    const returnURL = `${protocol}://${host}/dashboard/licensed-agent/quotes`;

    // Generate Winflex SSO XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<LifeLink xmlns="urn:lifelink-schema">
  <LL LoginType="WF_AGENCY">
    <UserName>${escapeXml(distributor.email)}</UserName>
    <WFCompanyCode>APEX</WFCompanyCode>
    <WFCompanyPassword>3Markagents</WFCompanyPassword>
    <InterfaceType>GUI</InterfaceType>
    <OutputType>URL</OutputType>
    <Tool>
      <Name>WinFlex</Name>
    </Tool>
  </LL>
  <WinFlex>
    <ReturnURL>${escapeXml(returnURL)}</ReturnURL>
    <Captive>False</Captive>
    <Profile AutoCreate="true" AutoEmail="false">
      <FirstName>${escapeXml(distributor.first_name || '')}</FirstName>
      <LastName>${escapeXml(distributor.last_name || '')}</LastName>
      <CompanyName>Apex Affinity Group</CompanyName>
      ${distributor.address_line1 ? `<Address1>${escapeXml(distributor.address_line1)}</Address1>` : ''}
      ${distributor.address_line2 ? `<Address2>${escapeXml(distributor.address_line2)}</Address2>` : ''}
      ${distributor.city ? `<City>${escapeXml(distributor.city)}</City>` : ''}
      ${distributor.state ? `<State>${escapeXml(distributor.state)}</State>` : ''}
      ${distributor.zip ? `<Zip>${escapeXml(distributor.zip)}</Zip>` : ''}
      ${distributor.phone ? `<Phone>${escapeXml(distributor.phone)}</Phone>` : ''}
      <Email>${escapeXml(distributor.email)}</Email>
    </Profile>
  </WinFlex>
</LifeLink>`;

    // Return the XML for the client to POST to Winflex
    return NextResponse.json({
      xml: xml,
      winflexUrl: 'https://www.winflexweb.com/wfw_sso_login.aspx',
    });

  } catch (error) {
    console.error('Winflex SSO error:', error);
    return NextResponse.json(
      { error: 'Failed to generate SSO credentials' },
      { status: 500 }
    );
  }
}

// Helper function to escape XML special characters
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
