// =============================================
// FAQ Item Component
// Collapsible FAQ accordion item
// =============================================

'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
}

export default function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
      >
        <h3 className="text-lg font-semibold text-slate-900 pr-4">{question}</h3>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-slate-600 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-600 flex-shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="px-6 pb-6">
          <p className="text-slate-700 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}
