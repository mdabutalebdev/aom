import React from "react";
import GuardianSidebarShell from "@/components/Guardian/GuardianSidebarShell";

// Guardian portal integrated shell — sidebar + topbar for all guardian pages.
export default function GuardianLayout({ children }) {
  return <GuardianSidebarShell>{children}</GuardianSidebarShell>;
}
