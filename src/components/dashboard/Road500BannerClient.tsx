'use client';

// ============================================================
// Road500BannerClient — animated progress bar toward 500 agents
// Receives server-fetched counts, renders colorful thermometer
// ============================================================

interface Props {
  totalAgents:    number;
  personalRecruit: number;
  goal:           number;
}

const MILESTONES = [
  { value: 0,   label: 'Start' },
  { value: 100, label: 'Phase 1' },
  { value: 250, label: 'Halfway' },
  { value: 500, label: '🏆 Goal' },
];

export default function Road500BannerClient({ totalAgents, personalRecruit, goal }: Props) {
  const pct         = Math.min((totalAgents / goal) * 100, 100);
  const remaining   = Math.max(goal - totalAgents, 0);
  const youPct      = Math.min((personalRecruit / goal) * 100, 100);

  // Phase label
  let phase = 'Just Getting Started';
  if (totalAgents >= 500) phase = '🏆 Goal Reached!';
  else if (totalAgents >= 250) phase = 'Halfway There!';
  else if (totalAgents >= 100) phase = 'Phase 1 Complete';
  else if (totalAgents >= 50)  phase = 'Building Momentum';

  return (
    <>
      <style>{`
        @keyframes stripe-move {
          0%   { background-position: 0 0; }
          100% { background-position: 56px 0; }
        }
        .road500-bar-fill {
          background: repeating-linear-gradient(
            -55deg,
            #f59e0b 0px,
            #f59e0b 10px,
            #ea580c 10px,
            #ea580c 20px,
            #f97316 20px,
            #f97316 30px,
            #fbbf24 30px,
            #fbbf24 40px
          );
          background-size: 56px 56px;
          animation: stripe-move 0.8s linear infinite;
          transition: width 1.2s cubic-bezier(.4,0,.2,1);
        }
      `}</style>

      <div style={{
        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
        border: '1.5px solid #fde68a',
        borderRadius: '16px',
        padding: '20px 24px 16px',
        marginBottom: '0',
      }}>

        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>⚡</span>
              <span style={{ fontWeight: 800, fontSize: '17px', color: '#92400e' }}>Road to 500</span>
            </div>
            <div style={{ fontSize: '12px', color: '#b45309', marginTop: '2px' }}>
              Building the Apex Movement Together
            </div>
          </div>

          {/* Status badge */}
          <div style={{
            background: '#fef9c3',
            border: '1.5px solid #fde047',
            borderRadius: '999px',
            padding: '4px 14px',
            fontSize: '12px',
            fontWeight: 700,
            color: '#713f12',
          }}>
            {phase}
          </div>
        </div>

        {/* Numbers row */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <span style={{ fontSize: '36px', fontWeight: 900, color: '#92400e', lineHeight: 1 }}>{totalAgents}</span>
            <span style={{ fontSize: '13px', color: '#b45309', marginLeft: '6px' }}>total agents in Apex</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '14px', color: '#b45309' }}>
              of <strong style={{ color: '#78350f' }}>{goal}</strong> · <strong style={{ color: '#78350f' }}>{pct.toFixed(1)}%</strong> complete
            </span>
          </div>
        </div>

        {/* Progress bar track */}
        <div style={{
          position: 'relative',
          height: '28px',
          background: '#e5e7eb',
          borderRadius: '999px',
          overflow: 'visible',
          marginBottom: '8px',
        }}>
          {/* Filled portion */}
          <div
            className="road500-bar-fill"
            style={{
              position: 'absolute',
              left: 0, top: 0, bottom: 0,
              width: `${pct}%`,
              borderRadius: '999px',
              minWidth: pct > 0 ? '28px' : '0',
            }}
          />

          {/* YOU marker (personal recruits) */}
          {personalRecruit > 0 && youPct > 0 && (
            <div style={{
              position: 'absolute',
              left: `calc(${youPct}% - 1px)`,
              top: '-6px',
              bottom: '-6px',
              width: '3px',
              background: '#7c3aed',
              borderRadius: '4px',
              zIndex: 10,
            }}>
              <div style={{
                position: 'absolute',
                bottom: '110%',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#7c3aed',
                color: '#fff',
                fontSize: '9px',
                fontWeight: 800,
                borderRadius: '6px',
                padding: '2px 6px',
                whiteSpace: 'nowrap',
              }}>
                YOU · {personalRecruit}
              </div>
            </div>
          )}

          {/* Milestone tick marks */}
          {MILESTONES.filter(m => m.value > 0 && m.value < goal).map(m => (
            <div
              key={m.value}
              style={{
                position: 'absolute',
                left: `${(m.value / goal) * 100}%`,
                top: 0, bottom: 0,
                width: '2px',
                background: 'rgba(255,255,255,0.5)',
                zIndex: 5,
              }}
            />
          ))}
        </div>

        {/* Milestone labels */}
        <div style={{ position: 'relative', height: '28px' }}>
          {MILESTONES.map(m => (
            <div
              key={m.value}
              style={{
                position: 'absolute',
                left: `${(m.value / goal) * 100}%`,
                transform: m.value === 0 ? 'translateX(0)' : m.value === goal ? 'translateX(-100%)' : 'translateX(-50%)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#92400e' }}>{m.value}</div>
              <div style={{ fontSize: '9px', color: '#b45309' }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Bottom stats */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginTop: '10px',
          paddingTop: '10px',
          borderTop: '1px solid #fde68a',
          flexWrap: 'wrap',
        }}>
          <div style={{ fontSize: '12px', color: '#92400e' }}>
            <strong>{remaining}</strong> agents until we hit 500
          </div>
          <div style={{ fontSize: '12px', color: '#7c3aed' }}>
            <strong style={{ color: '#7c3aed' }}>■</strong> You've personally brought in <strong>{personalRecruit}</strong> agent{personalRecruit !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </>
  );
}
