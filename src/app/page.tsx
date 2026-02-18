import OptiveReplicatedSite from '@/components/optive/OptiveReplicatedSite';
import type { Distributor } from '@/lib/types';

export default function Home() {
  // Generic distributor data for homepage
  const genericDistributor: Distributor = {
    id: '00000000-0000-0000-0000-000000000000',
    auth_user_id: null,
    email: 'info@theapexway.net',
    first_name: 'Your',
    last_name: 'Success',
    slug: 'apex',
    phone: '281-600-4000',
    company_name: 'Apex Affinity Group',
    bio: 'Join our team of successful insurance professionals. Build your business with proven systems, unlimited earning potential, and comprehensive support. No experience required - we provide complete training and resources.',
    profile_photo_url: null,
    social_links: null,
    address_line1: null,
    address_line2: null,
    city: null,
    state: null,
    zip: null,
    licensing_status: 'non_licensed',
    licensing_status_set_at: null,
    licensing_verified: false,
    licensing_verified_at: null,
    licensing_verified_by: null,
    status: 'active',
    admin_role: null,
    suspended_at: null,
    suspended_by: null,
    suspension_reason: null,
    deleted_at: null,
    deleted_by: null,
    onboarding_completed: true,
    onboarding_step: 5,
    onboarding_completed_at: null,
    is_master: false,
    profile_complete: true,
    sponsor_id: null,
    matrix_position: null,
    matrix_parent_id: null,
    matrix_depth: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return <OptiveReplicatedSite distributor={genericDistributor} />;
}
