import PartnerRoleForm from '../../components/PartnerRoleForm';

export const metadata = {
  title: 'Become a Good Times Ambassador',
  description: 'Apply to join the Good Times ambassador network for Atlanta.',
};

export default function AmbassadorPage() {
  return <PartnerRoleForm roleType="ambassador" />;
}
