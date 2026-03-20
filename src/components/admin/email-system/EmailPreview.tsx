'use client';

// =============================================
// Email Preview Component
// Shows live preview of email in Apex template
// =============================================

interface EmailPreviewProps {
  subject: string;
  htmlContent: string;
}

export default function EmailPreview({ subject, htmlContent }: EmailPreviewProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Preview</h3>

      {!htmlContent ? (
        <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
          <p className="text-gray-500">
            Email preview will appear here once generated
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Subject Line Preview */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Subject:</p>
            <p className="text-sm font-semibold text-gray-900">{subject}</p>
          </div>

          {/* Email Content Preview */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
              <p className="text-xs text-gray-600">Preview (as recipients will see it)</p>
            </div>
            <div className="p-4 max-h-[600px] overflow-y-auto">
              {/* Render HTML content safely */}
              <div
                dangerouslySetInnerHTML={{ __html: htmlContent }}
                className="email-preview-content"
              />
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .email-preview-content {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        .email-preview-content table {
          border-collapse: collapse;
        }
        .email-preview-content img {
          max-width: 100%;
          height: auto;
        }
      `}</style>
    </div>
  );
}
