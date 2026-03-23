'use client';

// =============================================
// Button Grid Component
// Grid of action buttons (2 cols mobile, 3-4 desktop)
// Each button: icon + label, tap → triggers AI action
// =============================================

interface GridButton {
  id: string;
  icon: string;
  label: string;
  description?: string;
}

interface ButtonGridProps {
  buttons: GridButton[];
  onButtonClick: (buttonId: string) => void;
  columns?: 2 | 3 | 4;
}

export default function ButtonGrid({
  buttons,
  onButtonClick,
  columns = 3,
}: ButtonGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-3`}>
      {buttons.map((button) => (
        <button
          key={button.id}
          onClick={() => onButtonClick(button.id)}
          className="group p-4 rounded-xl border border-gray-200 bg-white hover:bg-gradient-to-br hover:from-[#e3f2fd] hover:to-white hover:border-[#2c5aa0]/30 transition-all shadow-sm hover:shadow-md min-h-[80px] flex flex-col items-center justify-center gap-2 text-center"
        >
          <span className="text-3xl group-hover:scale-110 transition-transform">
            {button.icon}
          </span>
          <span className="text-sm font-semibold text-gray-700 group-hover:text-[#2c5aa0]">
            {button.label}
          </span>
          {button.description && (
            <span className="text-xs text-gray-500 group-hover:text-[#1a4075]">
              {button.description}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
