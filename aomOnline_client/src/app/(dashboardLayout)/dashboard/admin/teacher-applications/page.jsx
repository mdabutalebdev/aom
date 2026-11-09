"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { 
  FiFileText, 
  FiPlayCircle, 
  FiCheckCircle, 
  FiXCircle, 
  FiClock,
  FiRefreshCw,
  FiEye,
  FiDownload,
  FiExternalLink,
  FiTrash2
} from "react-icons/fi";

import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import Modal from "@/components/ui/Modal";
import ManagementDeleteModal from "@/components/Admin/ManagementDeleteModal";
import { API_ORIGIN } from "@/config/api";

export default function TeacherApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_ORIGIN}/api/teacher-applications`);
      setApplications(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
      toast.error("Failed to load teacher applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setActionLoading(true);
    try {
      await axios.patch(`${API_ORIGIN}/api/teacher-applications/${id}/status`, {
        status: newStatus,
      });
      toast.success(`Application marked as ${newStatus}`);
      fetchApplications();
      if (selectedApp && selectedApp._id === id) {
        setSelectedApp({ ...selectedApp, status: newStatus });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const doDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await axios.delete(`${API_ORIGIN}/api/teacher-applications/${deleteTarget._id}`);
      toast.success("Application deleted successfully");
      setDeleteTarget(null);
      fetchApplications();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete application");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge variant="warning"><FiClock className="mr-1" /> Pending</Badge>;
      case "reviewed":
        return <Badge variant="primary"><FiCheckCircle className="mr-1" /> Reviewed</Badge>;
      case "accepted":
        return <Badge variant="success"><FiCheckCircle className="mr-1" /> Accepted</Badge>;
      case "rejected":
        return <Badge variant="danger"><FiXCircle className="mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="neutral">Unknown</Badge>;
    }
  };

  const isVideo = (url) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i) || url.includes('video') || !url.match(/\.(mp3|wav|ogg|m4a|aac)$/i);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header and Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Teacher Applications</h1>
          <p className="mt-1 text-sm text-primary-500">
            Review and manage incoming teacher applications.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchApplications}
            disabled={loading}
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            <span className="ml-1.5">Refresh</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <Spinner size="lg" />
          <p className="animate-pulse text-primary-500">Loading applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface px-4 py-16 text-center text-primary-500">
          No applications found.
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden overflow-x-auto rounded-[var(--radius-lg)] border border-primary-100 md:block">
            <table className="w-full min-w-[800px] border-collapse text-left text-sm bg-surface">
              <thead>
                <tr className="border-b border-primary-100 bg-primary-50/50 text-primary-600">
                  <th className="px-4 py-3 font-medium">Applicant Details</th>
                  <th className="px-4 py-3 font-medium">Contact Info</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr
                    key={app._id}
                    className="border-b border-primary-50 last:border-0 hover:bg-primary-50/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-primary-900">{app.name}</span>
                        <span className="text-xs text-primary-500 mt-0.5">
                          Applied: {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-primary-800">{app.email}</span>
                        <span className="text-sm text-primary-500 mt-0.5">{app.phone}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedApp(app)}
                        >
                          <FiEye className="mr-1" /> View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-danger/40 text-danger hover:bg-red-50"
                          onClick={() => setDeleteTarget(app)}
                        >
                          <FiTrash2 />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="space-y-3 md:hidden">
            {applications.map((app) => (
              <div
                key={app._id}
                className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface p-4 shadow-soft"
              >
                <div className="flex items-start justify-between gap-2 border-b border-primary-50 pb-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-primary-900">{app.name}</p>
                    <p className="text-xs text-primary-400 mt-0.5">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>{getStatusBadge(app.status)}</div>
                </div>
                <div className="mt-3 space-y-1.5 text-sm text-primary-700">
                  <p><span className="font-medium text-primary-500">Email:</span> {app.email}</p>
                  <p><span className="font-medium text-primary-500">Phone:</span> {app.phone}</p>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedApp(app)}>
                    <FiEye className="mr-1" /> View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-danger/40 text-danger hover:bg-red-50"
                    onClick={() => setDeleteTarget(app)}
                  >
                    <FiTrash2 />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Details Modal */}
      <Modal
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        title="Application Details"
        size="xl"
        footer={
          selectedApp ? (
            <div className="flex w-full flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-primary-600">Update Status:</span>
                {selectedApp.status === "pending" && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleStatusChange(selectedApp._id, "reviewed")}
                  >
                    Mark Reviewed
                  </Button>
                )}
                {(selectedApp.status === "pending" || selectedApp.status === "reviewed") && (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 ring-green-200"
                      disabled={actionLoading}
                      onClick={() => handleStatusChange(selectedApp._id, "accepted")}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-danger text-danger hover:bg-red-50"
                      disabled={actionLoading}
                      onClick={() => handleStatusChange(selectedApp._id, "rejected")}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </div>
              <Button variant="ghost" onClick={() => setSelectedApp(null)}>
                Close
              </Button>
            </div>
          ) : null
        }
      >
        {selectedApp && (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-primary-50 p-4">
              <div>
                <h3 className="text-lg font-bold text-primary-900">{selectedApp.name}</h3>
                <p className="text-sm text-primary-600">{selectedApp.email} • {selectedApp.phone}</p>
              </div>
              <div>{getStatusBadge(selectedApp.status)}</div>
            </div>

            {/* Cover Letter */}
            <div>
              <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary-500">
                Cover Letter
              </h4>
              <div className="rounded-lg border border-primary-100 bg-surface p-4 text-sm text-primary-800 whitespace-pre-wrap">
                {selectedApp.coverLetter || <span className="italic text-primary-400">No cover letter provided.</span>}
              </div>
            </div>

            {/* Files Section */}
            <div className="grid gap-6 sm:grid-cols-2">
              {/* CV Document */}
              <div>
                <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary-500">
                  Curriculum Vitae (CV)
                </h4>
                <div className="flex items-center justify-between rounded-lg border border-primary-100 p-4">
                  <div className="flex items-center gap-3">
                    <FiFileText className="text-2xl text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-primary-900">Applicant CV</p>
                      <p className="text-xs text-primary-500">PDF Document</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const url = selectedApp.cvUrl || selectedApp.cv;
                      if (url) window.open(url, "_blank");
                      else toast.error("CV not found");
                    }}
                  >
                    <FiExternalLink className="mr-1" /> Open
                  </Button>
                </div>
              </div>

              {/* Media File */}
              <div>
                <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary-500">
                  Recitation (Tilawat)
                </h4>
                <div className="flex flex-col gap-3 rounded-lg border border-primary-100 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FiPlayCircle className="text-2xl text-purple-500" />
                      <div>
                        <p className="text-sm font-medium text-primary-900">Media File</p>
                        <p className="text-xs text-primary-500">Audio / Video</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Embedded Player */}
                  <div className="mt-2 w-full overflow-hidden rounded-md bg-black/5">
                    {isVideo(selectedApp.mediaUrl || selectedApp.media) ? (
                      <video 
                        src={selectedApp.mediaUrl || selectedApp.media} 
                        controls 
                        className="h-auto w-full max-h-48 rounded-md bg-black object-contain"
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <audio 
                        src={selectedApp.mediaUrl || selectedApp.media} 
                        controls 
                        className="w-full"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ManagementDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={doDelete}
        title="Delete Application"
        name={deleteTarget?.name || "this application"}
        loading={actionLoading}
      />
    </div>
  );
}
