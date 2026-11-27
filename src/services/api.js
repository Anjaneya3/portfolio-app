// Every request goes to the same server, so the sign-in cookie is sent automatically.
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const STATUS_MESSAGES = {
  401: "Sign in to continue.",
  403: "You don't have permission to do that.",
  404: "That item no longer exists.",
  413: "That file is too large.",
  429: "Too many requests. Wait a moment and try again.",
};

async function request(path, { method = "GET", json, file } = {}) {
  const options = { method, credentials: "same-origin", cache: "no-store", headers: {} };

  if (file) {
    options.headers["Content-Type"] = file.type || "application/octet-stream";
    options.body = file;
  } else if (json !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(json);
  }

  const response = await fetch(path, options);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      data?.error || STATUS_MESSAGES[response.status] || "Something went wrong. Try again.",
      response.status
    );
  }
  return data;
}

export const fetchContent = () => request("/api/content");
export const fetchMe = () => request("/api/auth/me").then((data) => data.user).catch(() => null);
export const login = (email, password) => request("/api/auth/login", { method: "POST", json: { email, password } });
export const logout = () => request("/api/auth/logout", { method: "POST", json: {} });
export const saveProfile = (profile) => request("/api/profile", { method: "PUT", json: profile });
export const createItem = (collection, data) =>
  request(`/api/${collection}`, { method: "POST", json: data }).then((result) => result.item);
export const updateItem = (collection, id, data) =>
  request(`/api/${collection}/${id}`, { method: "PUT", json: data }).then((result) => result.item);
export const deleteItem = (collection, id) => request(`/api/${collection}/${id}`, { method: "DELETE" });
export const reorderItems = (collection, ids) =>
  request(`/api/${collection}/reorder`, { method: "POST", json: { ids } });
export const uploadFile = (kind, file) =>
  request(`/api/uploads/${kind}`, { method: "PUT", file }).then((result) => result.url);
export const sendMessage = (message) => request("/api/messages", { method: "POST", json: message });
export const fetchMessages = () => request("/api/messages").then((result) => result.messages);
export const deleteMessage = (id) => request(`/api/messages/${id}`, { method: "DELETE" });
