'use client';

// =============================================
// Rep Attribution Wrapper
// Client component that sets rep attribution cookie on mount
// =============================================

import { useEffect } from 'react';
import { setRepAttribution } from './actions';

interface Props {
  slug: string;
  children: React.ReactNode;
}

export default function RepAttributionWrapper({ slug, children }: Props) {
  useEffect(() => {
    // Set rep attribution cookie when component mounts
    setRepAttribution(slug);
  }, [slug]);

  return <>{children}</>;
}
