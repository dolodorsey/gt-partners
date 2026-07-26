"use client";

import AdminDashboard from "../../components/AdminDashboard";
import SecureAdminGate from "../../components/SecureAdminGate";

export default function Admin() {
  return (
    <SecureAdminGate>
      <AdminDashboard />
    </SecureAdminGate>
  );
}
