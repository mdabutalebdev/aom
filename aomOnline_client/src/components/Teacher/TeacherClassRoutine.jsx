"use client";

import React, { useCallback, useEffect, useState } from "react";
import { FiInbox } from "react-icons/fi";

import apiClient from "@/lib/apiClient";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import RoutineWeekGrid from "@/components/shared/RoutineWeekGrid";

/**
 * TeacherClassRoutine — the logged-in teacher's full weekly routine (Sun–Sat),
 * every recurring class with the student it belongs to.
 */
const TeacherClassRoutine = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRoutine = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get("/schedules/my-week");
      setSlots(res.data?.data || []);
    } catch (err) {
      setError(err.message || "Failed to load your class routine.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRoutine();
  }, [fetchRoutine]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Spinner size="lg" />
        <p className="animate-pulse text-primary-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-danger/30 bg-red-50 px-4 py-8 text-center text-danger">
        <p>{error}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={fetchRoutine}>
          Try again
        </Button>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-[var(--radius-lg)] border border-primary-100 bg-surface px-4 py-16 text-center text-primary-500">
        <FiInbox className="text-3xl text-primary-300" />
        <p>No classes are scheduled yet.</p>
        <p className="text-sm text-primary-400">
          Your weekly routine will appear here once the madrasa sets your classes.
        </p>
      </div>
    );
  }

  return <RoutineWeekGrid slots={slots} />;
};

export default TeacherClassRoutine;
