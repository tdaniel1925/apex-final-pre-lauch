import InviteForm from '@/components/invites/InviteForm';

export const metadata = {
  title: 'Send VIP Invites — Apex Affinity Group',
};

export default function InvitesPage() {
  return (
    <>
      <link href="/optive/css/all.min.css" rel="stylesheet" />
      <InviteForm />
    </>
  );
}
