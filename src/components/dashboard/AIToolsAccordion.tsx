'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { AI_COPILOT_TOOLS, type ToolCategory, type Topic } from '@/lib/ai-copilot/tools-reference';

interface AIToolsAccordionProps {
  onTopicClick: (topic: Topic) => void;
}

export default function AIToolsAccordion({ onTopicClick }: AIToolsAccordionProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['business']));

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleTopicClick = (topic: Topic) => {
    onTopicClick(topic);
  };

  return (
    <div className="w-64 border-l border-slate-200 bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 flex-shrink-0">
        <h3 className="text-sm font-semibold text-slate-900">Topics</h3>
        <p className="text-xs text-slate-600 mt-0.5">Click to start a conversation</p>
      </div>

      {/* Scrollable Categories */}
      <div className="flex-1 overflow-y-auto">
        {AI_COPILOT_TOOLS.map((category) => {
          const isExpanded = expandedCategories.has(category.id);

          return (
            <div key={category.id} className="border-b border-slate-100">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{category.icon}</span>
                  <div className="text-left">
                    <div className="text-sm font-medium text-slate-900">{category.name}</div>
                    <div className="text-xs text-slate-600">{category.description}</div>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-slate-600 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
                )}
              </button>

              {/* Topics (expanded) */}
              {isExpanded && (
                <div className="bg-slate-50">
                  {category.topics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicClick(topic)}
                      className="w-full px-4 py-2.5 pl-10 text-left hover:bg-slate-100 transition-colors border-t border-slate-200"
                    >
                      <div className="text-sm text-slate-900 font-medium">{topic.label}</div>
                      <div className="text-xs text-slate-600 mt-0.5">{topic.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex-shrink-0">
        <p className="text-xs text-slate-600 text-center">
          {AI_COPILOT_TOOLS.reduce((sum, cat) => sum + cat.topics.length, 0)} topics available
        </p>
      </div>
    </div>
  );
}
