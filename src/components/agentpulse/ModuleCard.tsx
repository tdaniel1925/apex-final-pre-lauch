// =============================================
// Module Card Component
// Displays individual AgentPulse module info
// =============================================

import Link from 'next/link';

interface ModuleCardProps {
  icon: string;
  title: string;
  tagline: string;
  description: string;
  href: string;
  gradient: string;
}

export default function ModuleCard({
  icon,
  title,
  tagline,
  description,
  href,
  gradient,
}: ModuleCardProps) {
  return (
    <Link
      href={href}
      className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-200 hover:border-[#2B4C7E]"
    >
      <div className={`h-2 ${gradient}`}></div>
      <div className="p-6">
        <div className="text-4xl mb-3">{icon}</div>
        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-[#2B4C7E] transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-600 font-medium mb-3">{tagline}</p>
        <p className="text-sm text-gray-700 leading-relaxed mb-4">{description}</p>

        <div className="flex items-center text-[#2B4C7E] font-semibold text-sm group-hover:translate-x-1 transition-transform">
          Preview Module
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
