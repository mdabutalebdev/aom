"use client";

import React from "react";

import PendingPaymentsManager from "./PendingPaymentsManager";

/**
 * PaymentsManager — guardian-submitted payment claims awaiting review.
 * Per-teacher salary + student payment toggles live on each teacher's own
 * profile page (Teachers -> View Details), not here.
 */
const PaymentsManager = () => {
  return (
    <div>
      <h2 className="mb-4 text-base font-semibold text-primary-900">
        Guardian Payments
      </h2>
      <PendingPaymentsManager />
    </div>
  );
};

export default PaymentsManager;
