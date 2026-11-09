"use client";

import React, { useCallback, useEffect, useState } from "react";
import { FiAward, FiAlertCircle, FiDownload } from "react-icons/fi";
import { toast } from "sonner";
import { motion } from "framer-motion";

import apiClient from "@/lib/apiClient";
import { downloadCertificatePdf } from "@/lib/certificatePdf";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import CertificateCard from "@/components/shared/CertificateCard";

const GuardianCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownload = async (cert) => {
    setDownloadingId(cert._id);
    try {
      const name = cert.certificateNumber || "certificate";
      if (cert.imageUrl) {
        // Uploaded certificate — download the original image exactly as-is.
        try {
          const res = await fetch(cert.imageUrl);
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          const ext = (cert.imageUrl.split("?")[0].split(".").pop() || "png").toLowerCase();
          a.download = `${name}.${ext}`;
          a.click();
          URL.revokeObjectURL(url);
        } catch {
          window.open(cert.imageUrl, "_blank", "noopener");
        }
      } else {
        const node = document.getElementById(`cert-card-${cert._id}`);
        await downloadCertificatePdf(node, name);
      }
    } catch (err) {
      toast.error(err.message || "Could not download the certificate.");
    } finally {
      setDownloadingId(null);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // First, get the student ID from the dashboard
      const dashRes = await apiClient.get("/students/me/dashboard");
      const student = dashRes.data?.student;

      if (!student || !student._id) {
        throw new Error("No linked student found.");
      }

      // Then fetch certificates for this student.
      // apiClient returns the full response body, so the array is certRes.data
      // (not certRes.data.data).
      const certRes = await apiClient.get(`/certificates/student/${student._id}`);
      setCertificates(certRes.data || []);
    } catch (err) {
      setError(err.message || "Failed to load certificates.");
      toast.error(err.message || "Failed to load certificates.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-4 text-primary-500">Loading certificates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <FiAlertCircle className="mx-auto mb-3 text-4xl text-danger" />
        <p className="text-danger">{error}</p>
        <Button variant="outline" className="mt-5" onClick={fetchData}>
          Retry
        </Button>
      </div>
    );
  }

  if (!certificates.length) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[var(--radius-2xl)] border border-dashed border-primary-200 bg-surface px-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-400">
          <FiAward className="text-3xl" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-primary-900">No Certificates Yet</h3>
        <p className="mt-2 text-sm text-primary-500">
          Certificates will appear here once the student successfully completes a class or achieves a milestone.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-primary-900">Student Certificates</h2>
        <p className="mt-1 text-sm text-primary-500">View and download your achievements and course completions.</p>
      </div>

      <div className="space-y-12">
        {certificates.map((cert, i) => (
          <motion.div
            key={cert._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="mx-auto max-w-[640px]"
          >
            {/* Captured node — only the certificate itself goes into the PDF */}
            <div id={`cert-card-${cert._id}`}>
              <CertificateCard cert={cert} />
            </div>

            <div className="mt-4 flex justify-center">
              <Button
                variant="primary"
                onClick={() => handleDownload(cert)}
                isLoading={downloadingId === cert._id}
                disabled={downloadingId === cert._id}
                className="gap-2"
              >
                <FiDownload />
                {downloadingId === cert._id ? "Preparing…" : cert.imageUrl ? "Download Image" : "Download PDF"}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GuardianCertificates;
