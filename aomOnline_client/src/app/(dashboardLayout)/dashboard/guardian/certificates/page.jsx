import React from "react";
import GuardianCertificates from "@/components/Guardian/GuardianCertificates";

export const metadata = {
  title: "Certificates | Guardian Dashboard - AOM Online Madrasa",
  description: "View and download certificates for your student.",
};

export default function GuardianCertificatesPage() {
  return (
    <div className="min-h-full">
      <GuardianCertificates />
    </div>
  );
}
