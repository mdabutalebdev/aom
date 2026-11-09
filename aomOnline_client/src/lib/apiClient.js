import API_BASE_URL from "@/config/api";
import { authHeaders } from "@/config/auth";

// Shared fetch wrapper — cuts the loading/error/JSON boilerplate that used to
// be hand-rolled in every manager component. Mirrors the existing app-wide
// conventions (authHeaders() spread, defensive JSON parse, "Could not
// connect to server." on network failure) so nothing that already works
// changes behavior — this just centralizes it for new/rewritten code.

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

const request = async (path, { method = "GET", body, headers, ...rest } = {}) => {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        ...(body !== undefined && !isFormData
          ? { "Content-Type": "application/json" }
          : {}),
        ...authHeaders(),
        ...headers,
      },
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
      ...rest,
    });
  } catch {
    throw new ApiError("Could not connect to server.", 0, null);
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok || data.success === false) {
    throw new ApiError(
      data.message || "Something went wrong. Please try again.",
      res.status,
      data,
    );
  }

  return data;
};

const apiClient = {
  get: (path, opts) => request(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
  patch: (path, body, opts) => request(path, { ...opts, method: "PATCH", body }),
  delete: (path, opts) => request(path, { ...opts, method: "DELETE" }),
};

export default apiClient;
