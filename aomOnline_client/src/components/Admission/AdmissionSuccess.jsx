"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";

import Button from "@/components/ui/Button";
import Card, { CardBody } from "@/components/ui/Card";

/**
 * AdmissionSuccess — confirmation screen after a successful application submission.
 * Shows a "Submit Another Application" button when onReset is provided.
 */
const AdmissionSuccess = ({ studentName, message, onReset }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card>
        <CardBody className="px-6 py-10 text-center sm:px-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary-50 text-secondary-600">
            <FaCheckCircle className="text-3xl" />
          </div>

          <h2 className="mt-6 text-2xl font-bold text-primary-900">
            Application Submitted Successfully
          </h2>

          <p className="mx-auto mt-3 max-w-md text-primary-600">
            {message ||
              "Your admission application has been submitted. Our admin will review it and get in touch with you."}
          </p>

          {studentName && (
            <p className="mt-2 text-sm text-primary-500">
              Student&apos;s Name:{" "}
              <span className="font-medium text-primary-700">{studentName}</span>
            </p>
          )}

          {onReset && (
            <div className="mt-8">
              <Button variant="outline" onClick={onReset}>
                Submit Another Application
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default AdmissionSuccess;
