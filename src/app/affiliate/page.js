import PartnerRoleForm from '../../components/PartnerRoleForm';

export const metadata = {
  title: 'Become a Good Times Affiliate',
  description: 'Apply to join approved Good Times affiliate opportunities.',
};

export default function AffiliatePage() {
  return <PartnerRoleForm roleType="affiliate" />;
}
