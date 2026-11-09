"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  FiSearch,
  FiRefreshCw,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiBookOpen,
  FiCreditCard,
  FiLayers,
} from "react-icons/fi";

import apiClient from "@/lib/apiClient";
import API_BASE_URL from "@/config/api";
import { authHeaders } from "@/config/auth";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/shadcn/dialog";
import ManagementDeleteModal from "./ManagementDeleteModal";
import GroupFormModal from "./GroupFormModal";
import GroupStudentFormModal from "./GroupStudentFormModal";
import {
  formatTaka,
  STUDENT_STATUS_META,
  STUDENT_STATUS_FILTERS,
} from "./managementConstants";

const scheduleText = (g) => {
  if (!g) return "—";
  const days = (g.scheduleDays || []).join(", ");
  const time = [g.startTime, g.endTime].filter(Boolean).join(" - ");
  return [days, time].filter(Boolean).join(" ") || "—";
};

const GroupStudentsManager = () => {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [groups, setGroups] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [manageOpen, setManageOpen] = useState(false);
  const [groupFormOpen, setGroupFormOpen] = useState(false);
  const [groupEditTarget, setGroupEditTarget] = useState(null);
  const [studentFormOpen, setStudentFormOpen] = useState(false);
  const [studentEditTarget, setStudentEditTarget] = useState(null);
  const [deleteStudent, setDeleteStudent] = useState(null);
  const [busy, setBusy] = useState(false);

  const fetchRefs = useCallback(async () => {
    try {
      const [g, c, t] = await Promise.all([
        apiClient.get("/groups"),
        fetch(`${API_BASE_URL}/classes`, { headers: { ...authHeaders() } }).then((r) => r.json()),
        fetch(`${API_BASE_URL}/teachers?limit=100`, { headers: { ...authHeaders() } }).then((r) => r.json()),
      ]);
      const groupList = Array.isArray(g.data) ? g.data : [];
      setGroups(groupList);
      const clsList = Array.isArray(c) ? c : Array.isArray(c.data) ? c.data : [];
      clsList.sort((a, b) => (a.order || 0) - (b.order || 0));
      setClasses(clsList);
      setTeachers(Array.isArray(t.data) ? t.data : []);
      return groupList;
    } catch {
      // list still works without ref data
      return null;
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ type: "group", limit: "200" });
      if (search) params.set("search", search);
      if (teacherFilter) params.set("teacher", teacherFilter);
      if (classFilter) params.set("class", classFilter);
      if (statusFilter) params.set("status", statusFilter);
      const res = await apiClient.get(`/students?${params.toString()}`);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.message || "Failed to load group students.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [search, teacherFilter, classFilter, statusFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRefs();
  }, [fetchRefs]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStudents();
  }, [fetchStudents]);

  const refreshAll = () => {
    fetchRefs();
    fetchStudents();
  };

  const applySearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const doDeleteStudent = async () => {
    if (!deleteStudent) return;
    setBusy(true);
    try {
      await apiClient.delete(`/students/${deleteStudent._id}`);
      toast.success("Student deleted.");
      setDeleteStudent(null);
      refreshAll();
    } catch (err) {
      toast.error(err.message || "Deletion failed.");
    } finally {
      setBusy(false);
    }
  };

  const deleteGroup = async (g) => {
    if (!window.confirm(`Delete group "${g.name}"? Its students must be moved first.`)) return;
    try {
      await apiClient.delete(`/groups/${g._id}`);
      toast.success("Group deleted.");
      fetchRefs();
    } catch (err) {
      toast.error(err.message || "Could not delete the group.");
    }
  };

  const stats = useMemo(() => {
    const active = items.filter((s) => s.status === "active").length;
    const totalFee = items.reduce((sum, s) => sum + (s.monthlyFee || 0), 0);
    return {
      total: items.length,
      active,
      inactive: items.length - active,
      groups: groups.length,
      totalFee,
    };
  }, [items, groups]);

  const classFilterOptions = [
    { value: "", label: "All Classes" },
    ...classes.map((c) => ({ value: c._id, label: c.nameEn || c.name })),
  ];
  const teacherFilterOptions = [
    { value: "", label: "All Teachers" },
    ...teachers.map((t) => ({ value: t._id, label: t.userRef?.name || t.teacherId || "—" })),
  ];

  const statCards = [
    { label: "Total Students", value: stats.total, sub: "Group class", icon: FiUsers, tone: "bg-primary-50 text-primary-600" },
    { label: "Active", value: stats.active, sub: "This month", icon: FiCheckCircle, tone: "bg-secondary-50 text-secondary-600" },
    { label: "Inactive", value: stats.inactive, sub: "This month", icon: FiClock, tone: "bg-red-50 text-danger" },
    { label: "Total Groups", value: stats.groups, sub: "Running", icon: FiBookOpen, tone: "bg-accent-50 text-accent-600" },
    { label: "Total Monthly Fee", value: formatTaka(stats.totalFee), sub: "This month", icon: FiCreditCard, tone: "bg-primary-50 text-primary-600", money: true },
  ];

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 rounded-[var(--radius-lg)] border border-primary-100 bg-surface p-3.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <form onSubmit={applySearch} className="relative min-w-[200px] flex-1">
            <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-400" />
            <Input
              placeholder="Search by name or ID"
              className="pl-10"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </form>
          <Select placeholder="" options={classFilterOptions} value={classFilter} onChange={(e) => setClassFilter(e.target.value)} containerClassName="w-40" />
          <Select placeholder="" options={teacherFilterOptions} value={teacherFilter} onChange={(e) => setTeacherFilter(e.target.value)} containerClassName="w-44" />
          <Select placeholder="" options={STUDENT_STATUS_FILTERS} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} containerClassName="w-36" />
          <Button variant="outline" onClick={refreshAll} disabled={loading}>
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            <span className="ml-1.5">Refresh</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              fetchRefs(); // pull the latest groups so the list is never stale
              setManageOpen(true);
            }}
            className="gap-1.5"
          >
            <FiLayers /> Manage Groups
          </Button>
          <Button
            variant="primary"
            onClick={async () => {
              // Refresh groups first so a group deleted elsewhere can't linger
              // in the dropdown and cause a "Group not found" on submit.
              const fresh = await fetchRefs();
              const list = Array.isArray(fresh) ? fresh : groups;
              if (!list.length) {
                toast.info("Create a group first, then add students to it.");
                setManageOpen(true);
                return;
              }
              setStudentEditTarget(null);
              setStudentFormOpen(true);
            }}
            className="gap-1"
          >
            <FiPlus /> Add Group Class Student
          </Button>
        </div>
      </div>

      {!loading && !error && (
        <p className="mb-2.5 text-xs text-primary-500">Total {stats.total} students</p>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <Spinner size="lg" />
          <p className="animate-pulse text-primary-500">Loading...</p>
        </div>
      ) : error ? (
        <div className="rounded-[var(--radius-lg)] border border-danger/30 bg-red-50 px-4 py-8 text-center text-danger">
          <p>{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={fetchStudents}>Try again</Button>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface px-4 py-16 text-center text-primary-500">
          No group students yet. Create a group, then add students to it.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-primary-100">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-primary-100 bg-primary-50/50 text-primary-600">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Batch</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Class</th>
                <th className="px-4 py-3 font-medium">Teacher</th>
                <th className="px-4 py-3 font-medium">Schedule</th>
                <th className="px-4 py-3 font-medium">Monthly Fee</th>
                <th className="px-4 py-3 font-medium">Guardian</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => {
                const sm = STUDENT_STATUS_META[s.status] || { label: s.status || "—", variant: "neutral" };
                return (
                  <tr key={s._id} className="border-b border-primary-50 last:border-0 hover:bg-primary-50/30">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-primary-700">{s.studentId || "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant="primary">{s.groupRef?.name || "—"}</Badge>
                    </td>
                    <td className="px-4 py-3 font-medium text-primary-900">{s.name || "—"}</td>
                    <td className="px-4 py-3 text-primary-700">{s.classRef?.nameEn || s.classRef?.name || "—"}</td>
                    <td className="px-4 py-3 text-primary-700">{s.teacherRef?.userRef?.name || "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-primary-600">{scheduleText(s.groupRef)}</td>
                    <td className="px-4 py-3 text-primary-700">{formatTaka(s.monthlyFee)}</td>
                    <td className="px-4 py-3 text-primary-700">{s.guardianName || "—"}</td>
                    <td className="px-4 py-3"><Badge variant={sm.variant}>{sm.label}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => { setStudentEditTarget(s); setStudentFormOpen(true); }}>
                          <FiEdit2 />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-danger hover:bg-red-50" onClick={() => setDeleteStudent(s)}>
                          <FiTrash2 />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-[var(--radius-2xl)] border border-primary-100/60 bg-surface p-4 shadow-soft">
              <div className="flex items-center gap-3">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${c.tone}`}>
                  <Icon className="text-lg" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-lg font-bold text-primary-900">{c.value}</p>
                  <p className="truncate text-xs text-primary-500">{c.label}</p>
                  <p className="truncate text-[11px] text-primary-400">{c.sub}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Manage Groups modal */}
      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Manage Groups</DialogTitle>
          </DialogHeader>
          <div className="mb-3 flex justify-end">
            <Button variant="primary" size="sm" className="gap-1" onClick={() => { setGroupEditTarget(null); setGroupFormOpen(true); }}>
              <FiPlus /> Create Group
            </Button>
          </div>
          {groups.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface px-4 py-12 text-center text-primary-500">
              No groups yet. Create your first group.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-primary-100">
              <table className="w-full min-w-[620px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-primary-100 bg-primary-50/50 text-primary-600">
                    <th className="px-3 py-2.5 font-medium">Group</th>
                    <th className="px-3 py-2.5 font-medium">Teacher</th>
                    <th className="px-3 py-2.5 font-medium">Schedule</th>
                    <th className="px-3 py-2.5 font-medium">Fee</th>
                    <th className="px-3 py-2.5 font-medium">Students</th>
                    <th className="px-3 py-2.5 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((g) => (
                    <tr key={g._id} className="border-b border-primary-50 last:border-0">
                      <td className="px-3 py-2.5 font-medium text-primary-900">{g.name}</td>
                      <td className="px-3 py-2.5 text-primary-700">{g.teacherRef?.userRef?.name || "—"}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-primary-600">{scheduleText(g)}</td>
                      <td className="px-3 py-2.5 text-primary-700">{formatTaka(g.monthlyFee)}</td>
                      <td className="px-3 py-2.5 text-primary-700">{g.studentCount ?? 0}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => { setGroupEditTarget(g); setGroupFormOpen(true); }}>
                            <FiEdit2 />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-danger hover:bg-red-50" onClick={() => deleteGroup(g)}>
                            <FiTrash2 />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setManageOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <GroupFormModal
        open={groupFormOpen}
        onClose={() => setGroupFormOpen(false)}
        onSaved={fetchRefs}
        initial={groupEditTarget}
        classes={classes}
        teachers={teachers}
      />

      <GroupStudentFormModal
        open={studentFormOpen}
        onClose={() => setStudentFormOpen(false)}
        onSaved={refreshAll}
        initial={studentEditTarget}
        groups={groups}
      />

      <ManagementDeleteModal
        isOpen={!!deleteStudent}
        onClose={() => setDeleteStudent(null)}
        onConfirm={doDeleteStudent}
        title="Delete Student"
        name={deleteStudent?.name || "this student"}
        loading={busy}
      />
    </div>
  );
};

export default GroupStudentsManager;
