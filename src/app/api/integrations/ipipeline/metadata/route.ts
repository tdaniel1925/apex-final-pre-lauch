import { NextResponse } from "next/server";
import { iPipelineSAMLClient } from "@/lib/integrations/ipipeline/saml";

/**
 * GET /api/integrations/ipipeline/metadata
 *
 * Returns the IdP metadata XML for sending to iPipeline
 */
export async function GET() {
  try {
    if (!iPipelineSAMLClient.isConfigured()) {
      return new NextResponse(
        "iPipeline SAML is not configured. Please set IPIPELINE_SAML_PRIVATE_KEY and IPIPELINE_SAML_CERTIFICATE environment variables.",
        { status: 500, headers: { "Content-Type": "text/plain" } }
      );
    }

    const metadata = iPipelineSAMLClient.generateIdPMetadata();

    return new NextResponse(metadata, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Content-Disposition": 'attachment; filename="ipipeline-metadata.xml"',
      },
    });
  } catch (error: unknown) {
    console.error("Error generating metadata:", error);
    const message = error instanceof Error ? error.message : "Failed to generate metadata";
    return new NextResponse(message, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
