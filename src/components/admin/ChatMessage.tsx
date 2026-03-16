// =============================================
// Chat Message Component
// Displays user and assistant messages with appropriate styling
// =============================================

'use client';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  success?: boolean;
  error?: string;
  data?: any;
}

export default function ChatMessage({ role, content, success, error, data }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-blue-600 text-white'
            : error
            ? 'bg-red-50 border border-red-200 text-red-900'
            : success
            ? 'bg-green-50 border border-green-200 text-green-900'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        {/* Message content */}
        <div className="text-sm whitespace-pre-wrap">{content}</div>

        {/* Success/Error indicator */}
        {!isUser && (success !== undefined) && (
          <div className="mt-2 flex items-center gap-2">
            {success ? (
              <>
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs font-medium text-green-700">Completed</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-xs font-medium text-red-700">Failed</span>
              </>
            )}
          </div>
        )}

        {/* Display data if present (for search results, etc.) */}
        {!isUser && data && data.results && (
          <div className="mt-3 space-y-2">
            {data.results.slice(0, 5).map((result: any, index: number) => (
              <div key={index} className="text-xs bg-white rounded p-2 border border-gray-200">
                <div className="font-medium">
                  {result.first_name} {result.last_name}
                </div>
                <div className="text-gray-600">
                  Rep #{result.rep_number} • {result.email}
                </div>
                <div className="text-gray-500">
                  Status: <span className="capitalize">{result.status}</span>
                  {result.state && ` • ${result.state}`}
                </div>
              </div>
            ))}
            {data.results.length > 5 && (
              <div className="text-xs text-gray-600 italic">
                ...and {data.results.length - 5} more
              </div>
            )}
          </div>
        )}

        {/* Display distributor info if present */}
        {!isUser && data && data.distributor && !data.results && (
          <div className="mt-3 text-xs bg-white rounded p-3 border border-gray-200">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium text-gray-700">Name:</span>{' '}
                {data.distributor.first_name} {data.distributor.last_name}
              </div>
              <div>
                <span className="font-medium text-gray-700">Rep #:</span> {data.distributor.rep_number}
              </div>
              <div>
                <span className="font-medium text-gray-700">Email:</span> {data.distributor.email}
              </div>
              <div>
                <span className="font-medium text-gray-700">Status:</span>{' '}
                <span className="capitalize">{data.distributor.status}</span>
              </div>
              {data.distributor.phone && (
                <div>
                  <span className="font-medium text-gray-700">Phone:</span> {data.distributor.phone}
                </div>
              )}
              {data.distributor.state && (
                <div>
                  <span className="font-medium text-gray-700">State:</span> {data.distributor.state}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
