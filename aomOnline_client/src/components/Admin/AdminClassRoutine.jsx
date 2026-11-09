"use client";

import React, { useCallback, useEffect, useState } from "react";
import { FiInbox, FiUsers } from "react-icons/fi";

import apiClient from "@/lib/apiClient";
import Spinner from "@/components/ui/Spinner";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import RoutineWeekGrid from "@/components/shared/RoutineWeekGrid";

/**
 * AdminClassRoutine — admin picks a teacher and sees that teacher's full
 * weekly class routine (Sun–Sat), every recurring class with its student.
 */
const AdminClassRoutine = () => {
  const [teachers, setTeachers] = useState([]);
  const [teachersLoading, setTeachersLoading] = useState(true);
  const [teacherId, setTeacherId] = useState("");

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTeachers = useCallback(async () => {
    setTeachersLoading(true);
    try {
      const res = await apiClient.get("/schedules/teachers");
      setTeachers(Array.isArray(res.data) ? res.data : []);
    } catch {
      setTeachers([]);
    } finally {
      setTeachersLoading(false);
    }
  }, []);

  const fetchRoutine = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get(`/schedules/week/${id}`);
      setSlots(res.data?.data || []);
    } catch (err) {
      setError(err.message || "Failed to load the class routine.");
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTeachers();
  }, [fetchTeachers]);

  useEffect(() => {
    if (teacherId) fetchRoutine(teacherId);
  }, [teacherId, fetchRoutine]);

  return (
    <div>
      <div className="mb-5 max-w-sm">
        <Select
          id="teacher"
          label="Select a teacher"
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
          options={teachers.map((t) => ({
            value: t._id,
            label: `${t.name || "Unnamed"}${t.teacherId ? ` (${t.teacherId})` : ""}`,
          }))}
          placeholder={teachersLoading ? "Loading teachers…" : "Choose a teacher…"}
        />
      </div>

      {!teacherId ? (
        <div className="flex flex-col items-center gap-2 rounded-[var(--radius-lg)] border border-primary-100 bg-surface px-4 py-16 text-center text-primary-500">
          <FiUsers className="text-3xl text-primary-300" />
          <p>Select a teacher to view their weekly class routine.</p>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <Spinner size="lg" />
          <p className="animate-pulse text-primary-500">Loading...</p>
        </div>
      ) : error ? (
        <div className="rounded-[var(--radius-lg)] border border-danger/30 bg-red-50 px-4 py-8 text-center text-danger">
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => fetchRoutine(teacherId)}
          >
            Try again
          </Button>
        </div>
      ) : slots.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-[var(--radius-lg)] border border-primary-100 bg-surface px-4 py-16 text-center text-primary-500">
          <FiInbox className="text-3xl text-primary-300" />
          <p>No classes are scheduled for this teacher yet.</p>
        </div>
      ) : (
        <RoutineWeekGrid slots={slots} />
      )}
    </div>
  );
};

export default AdminClassRoutine;
