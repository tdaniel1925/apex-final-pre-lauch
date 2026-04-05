'use client';

import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface HelpSectionProps {
  title: string;
  description: string;
  steps?: string[];
  tips?: string[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export default function HelpSection({
  title,
  description,
  steps,
  tips,
  collapsible = false,
  defaultExpanded = true,
}: HelpSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const content = (
    <div className="space-y-4">
      <p className="text-slate-600 leading-relaxed">{description}</p>

      {steps && steps.length > 0 && (
        <div>
          <h4 className="font-semibold text-slate-900 mb-2">How to use:</h4>
          <ol className="list-decimal list-inside space-y-2 text-slate-600">
            {steps.map((step, index) => (
              <li key={index} className="leading-relaxed">
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {tips && tips.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Tips for best results:
          </h4>
          <ul className="list-disc list-inside space-y-1 text-blue-800 text-sm">
            {tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  if (!collapsible) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-3 mb-4">
          <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        </div>
        {content}
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg mb-8 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Info className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>
      {isExpanded && <div className="px-6 pb-6 pt-2">{content}</div>}
    </div>
  );
}
