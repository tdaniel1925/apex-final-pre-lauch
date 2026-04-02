// =============================================
// Video Training Card Component
// Coming Soon placeholder for Trent Daniel training
// =============================================

'use client';

import { Video, Clock } from 'lucide-react';

export default function VideoTrainingCard() {
  return (
    <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6 h-48 flex flex-col">
      {/* Header Icon */}
      <div className="flex justify-center mb-4">
        <div className="p-3 bg-slate-100 rounded-full">
          <Video className="w-8 h-8 text-slate-700" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <h3 className="text-base font-bold text-slate-900 mb-2">
          Video Training
        </h3>
        <p className="text-sm text-slate-600 mb-3">
          Trent Daniel's Sales Training
        </p>

        {/* Coming Soon Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
          <Clock className="w-4 h-4 text-slate-600" />
          <span className="text-sm font-semibold text-slate-700">
            Coming Soon
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto text-center">
        <p className="text-xs text-slate-500">
          Learn how to sell products effectively
        </p>
      </div>
    </div>
  );
}
