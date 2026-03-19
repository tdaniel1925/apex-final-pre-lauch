// =============================================
// Test Integration Connection API
// POST: Test connection to external platform
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// POST /api/admin/integrations/[id]/test-connection
export async function POST(request: NextRequest, { params }: RouteParams) {
  await params; // Await params even though we don't use the id in this route
  try {
    // Verify admin authentication
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.api_endpoint || !body.api_key) {
      return NextResponse.json(
        { error: 'Missing required fields: api_endpoint, api_key' },
        { status: 400 }
      );
    }

    // Test connection to external platform
    // This is a generic test - actual implementation will vary by platform
    try {
      // Try to make a basic request to the API endpoint
      // Most APIs have a /health, /ping, or /status endpoint
      const testEndpoints = [
        `${body.api_endpoint}/health`,
        `${body.api_endpoint}/ping`,
        `${body.api_endpoint}/status`,
        `${body.api_endpoint}/api/health`,
        body.api_endpoint, // Try base endpoint
      ];

      let lastError: Error | null = null;
      let connected = false;

      // Try each endpoint
      for (const endpoint of testEndpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${body.api_key}`,
              'Content-Type': 'application/json',
              'User-Agent': 'Apex-Affinity-Group/1.0',
            },
            signal: AbortSignal.timeout(5000), // 5 second timeout
          });

          // Consider 200, 401, 403 as "connected" (API is responding)
          // 401/403 means auth might be wrong, but API is reachable
          if (response.status === 200) {
            return NextResponse.json({
              success: true,
              message: 'Connection successful! API is reachable and responding.',
              details: {
                endpoint,
                status: response.status,
                statusText: response.statusText,
              },
            });
          } else if (response.status === 401 || response.status === 403) {
            return NextResponse.json({
              success: true,
              message:
                'API is reachable but authentication may need verification. This is normal - the API key will be validated during actual operations.',
              details: {
                endpoint,
                status: response.status,
                statusText: response.statusText,
              },
            });
          } else if (response.status < 500) {
            // Client error but API is responding
            connected = true;
            break;
          }
        } catch (err) {
          lastError = err as Error;
          continue; // Try next endpoint
        }
      }

      if (connected) {
        return NextResponse.json({
          success: true,
          message:
            'API is reachable. Note: Some authentication details could not be fully verified without making actual requests.',
        });
      }

      // All endpoints failed
      return NextResponse.json(
        {
          success: false,
          error: 'Could not connect to API',
          message: `Unable to reach ${body.api_endpoint}. Please verify the endpoint URL is correct and the API is accessible.`,
          details: lastError?.message,
        },
        { status: 200 } // Return 200 so the client can display the error message
      );
    } catch (error: any) {
      console.error('Connection test error:', error);

      let errorMessage = 'Connection test failed';

      if (error.name === 'AbortError') {
        errorMessage = 'Connection timeout - API did not respond within 5 seconds';
      } else if (error.code === 'ENOTFOUND') {
        errorMessage = 'DNS lookup failed - endpoint URL may be invalid';
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Connection refused - API may be down or unreachable';
      } else {
        errorMessage = error.message || 'Unknown connection error';
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          message: `Failed to connect to ${body.api_endpoint}. ${errorMessage}`,
        },
        { status: 200 } // Return 200 so the client can display the error message
      );
    }
  } catch (error) {
    console.error('Error in POST /api/admin/integrations/[id]/test-connection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
