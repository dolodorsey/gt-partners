import PartnerRoleForm from '../../components/PartnerRoleForm';

export const metadata = {
  title: 'Become a Good Times Curator',
  description: 'Apply to join the Good Times city curator network.',
};

export default function CuratorPage() {
  return <PartnerRoleForm roleType="curator" />;
}
