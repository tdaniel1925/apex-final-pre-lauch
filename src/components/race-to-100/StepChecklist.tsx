'use client';

interface JourneyStep {
  id: string;
  distributor_id: string;
  step_number: number;
  step_name: string;
  points_earned: number;
  completed_at: string | null;
  is_completed: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface StepChecklistProps {
  steps: JourneyStep[];
  currentStep: number;
}

export default function StepChecklist({ steps, currentStep }: StepChecklistProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStepState = (step: JourneyStep): 'completed' | 'current' | 'locked' => {
    if (step.is_completed) return 'completed';
    if (step.step_number === currentStep) return 'current';
    return 'locked';
  };

  return (
    <>
      {/* Scrollable Steps List */}
      <div className="flex-1 overflow-y-auto p-3.5">
        <style>{`
          .step-scroll::-webkit-scrollbar { width: 4px; }
          .step-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
        `}</style>
        <div className="space-y-2 step-scroll">
          {steps.map((step) => {
            const state = getStepState(step);
            return (
              <div
                key={step.id}
                className={`
                  p-3 rounded-lg border cursor-default
                  ${state === 'completed' ? 'bg-[#EAF3DE] border-[#C0DD97]' : ''}
                  ${state === 'current' ? 'bg-[#E6F1FB] border-[#85B7EB] border-[1.5px]' : ''}
                  ${state === 'locked' ? 'bg-slate-50 border-slate-200 opacity-60' : ''}
                `}
              >
                {/* Step Top */}
                <div className="flex items-center gap-2 mb-1">
                  {/* Icon */}
                  <div
                    className={`
                      w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[11px]
                      ${state === 'completed' ? 'bg-[#639922] text-white' : ''}
                      ${state === 'current' ? 'bg-[#2B4C7E] text-white' : ''}
                      ${state === 'locked' ? 'bg-slate-300 text-slate-500' : ''}
                    `}
                  >
                    {state === 'completed' ? '✓' : state === 'current' ? '▶' : '🔒'}
                  </div>

                  {/* Step Name */}
                  <div className={`flex-1 text-[13px] font-medium ${state === 'locked' ? 'text-slate-400' : 'text-slate-900'}`}>
                    Step {step.step_number}: {step.step_name}
                  </div>

                  {/* Badge */}
                  {state === 'completed' && (
                    <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-[#C0DD97] text-[#27500A]">
                      done
                    </span>
                  )}
                  {state === 'current' && (
                    <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-[#B5D4F4] text-[#0C447C]">
                      in progress
                    </span>
                  )}
                  {state === 'locked' && (
                    <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-slate-200 text-slate-500">
                      locked
                    </span>
                  )}
                </div>

                {/* Step Meta */}
                <div className="flex justify-between text-[11px] text-slate-600 mt-0.5">
                  {state === 'completed' && (
                    <>
                      <span className="text-[#3B6D11] font-medium">+{step.points_earned} pts</span>
                      <span>{formatDate(step.completed_at!)}</span>
                    </>
                  )}
                  {state === 'current' && (
                    <>
                      <span className="text-[#185FA5] font-medium">{step.points_earned} pts</span>
                      <span>started</span>
                    </>
                  )}
                  {state === 'locked' && (
                    <>
                      <span>{step.points_earned} pts</span>
                      <span>locked</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Progress */}
      <div className="px-3.5 py-3 border-t border-slate-200">
        {/* Step Dots Grid */}
        <div className="grid grid-cols-10 gap-0.5 mb-1.5">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`h-2 rounded-sm ${step.is_completed ? 'bg-[#2B4C7E]' : 'bg-slate-300'}`}
            />
          ))}
        </div>
        {/* Step Count */}
        <div className="text-[11px] text-slate-600">
          {steps.filter(s => s.is_completed).length}/{steps.length} complete
        </div>
      </div>
    </>
  );
}
