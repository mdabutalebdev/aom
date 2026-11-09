import React from "react";
import CertificatesManager from "@/components/Admin/CertificatesManager";

export const metadata = {
  title: "Certificates Management | Admin - AOM Online Madrasa",
  description: "Manage student certificates.",
};

export default function AdminCertificatesPage() {
  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold text-primary-900">Certificates Management</h1>
        <p className="mt-1 text-sm text-primary-500">
          View, issue, edit and delete student certificates.
        </p>
      </div>

      <CertificatesManager />
    </div>
  );
}
