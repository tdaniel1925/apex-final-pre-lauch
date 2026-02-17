'use client';

// =============================================
// LicensingStatusBadge Component
// Visual badge displaying licensing status
// =============================================

import type { LicensingStatus } from '@/lib/features/access-control';

export interface LicensingStatusBadgeProps {
  /** The licensing status to display */
  status: LicensingStatus;

  /** Whether the license has been verified by admin */
  verified?: boolean;

  /** Badge size */
  size?: 'sm' | 'md' | 'lg';

  /** Show verification badge inline */
  showVerified?: boolean;

  /** Optional click handler */
  onClick?: () => void;
}

/**
 * LicensingStatusBadge - Displays licensing status with optional verification indicator
 *
 * @example
 * <LicensingStatusBadge status="licensed" verified={true} />
 * <LicensingStatusBadge status="non_licensed" size="sm" />
 */
export default function LicensingStatusBadge({
  status,
  verified = false,
  size = 'md',
  showVerified = true,
  onClick,
}: LicensingStatusBadgeProps) {
  const isLicensed = status === 'licensed';

  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  // Status styles
  const statusStyle = isLicensed
    ? 'bg-blue-100 text-blue-800 border border-blue-200'
    : 'bg-gray-100 text-gray-700 border border-gray-200';

  const verifiedStyle = 'bg-green-100 text-green-800 border border-green-200';

  return (
    <div className="inline-flex items-center gap-1.5">
      {/* Main Status Badge */}
      <button
        onClick={onClick}
        disabled={!onClick}
        className={`
          inline-flex items-center gap-1.5 font-semibold rounded-full
          ${sizeClasses[size]}
          ${statusStyle}
          ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : 'cursor-default'}
        `}
        type="button"
      >
        {/* Icon */}
        {isLicensed ? (
          // License icon for licensed
          <svg
            className={iconSizes[size]}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          // User icon for non-licensed
          <svg
            className={iconSizes[size]}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        )}

        {/* Label */}
        <span>
          {isLicensed ? 'Licensed Agent' : 'Non-Licensed'}
        </span>
      </button>

      {/* Verification Badge (only for licensed and verified) */}
      {isLicensed && verified && showVerified && (
        <span
          className={`
            inline-flex items-center gap-1 font-semibold rounded-full
            ${sizeClasses[size]}
            ${verifiedStyle}
          `}
          title="License verified by administrator"
        >
          {/* Checkmark Icon */}
          <svg
            className={iconSizes[size]}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>Verified</span>
        </span>
      )}
    </div>
  );
}

/**
 * Simple version - just the icon and status
 */
export function LicensingStatusIcon({
  status,
  className = 'w-5 h-5',
}: {
  status: LicensingStatus;
  className?: string;
}) {
  const isLicensed = status === 'licensed';

  if (isLicensed) {
    return (
      <svg
        className={`${className} text-blue-600`}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-label="Licensed Insurance Agent"
      >
        <path
          fillRule="evenodd"
          d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  return (
    <svg
      className={`${className} text-gray-500`}
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-label="Non-Licensed Distributor"
    >
      <path
        fillRule="evenodd"
        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
        clipRule="evenodd"
      />
    </svg>
  );
}
