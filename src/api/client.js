import { API_BASE } from "../config";
import { getToken } from "../auth/storage";
import { withTimeout, STARTUP_TIMEOUT_MS } from "../logic/appSafety.mjs";
import { readPack, writePack } from "../services/offline";

function toUrl(path) {
  if (/^https?:\/\//i.test(String(path || ""))) return path;
  return `${API_BASE}${String(path || "").startsWith("/") ? "" : "/"}${path || ""}`;
}

export async function request(path, options = {}) {
  const token = await withTimeout(getToken(), STARTUP_TIMEOUT_MS, "");
  const isForm = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers = { Accept: "application/json", ...(options.headers || {}) };
  if (token && !headers.Authorization) headers.Authorization = `Bearer ${token}`;
  let body = options.body;
  if (body != null && !isForm && typeof body !== "string") {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
    body = JSON.stringify(body);
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  let res, text;
  try {
    res = await fetch(toUrl(path), { ...options, headers, body, signal: options.signal || controller.signal });
    text = await res.text();
  } catch (e) {
    if (e?.name === "AbortError") throw new Error("Request timed out. Please retry.");
    throw e;
  } finally { clearTimeout(timeout); }
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (res.ok && String(options.method || "GET").toUpperCase() !== "GET") invalidateCachedData();
  if (!res.ok) {
    const err = new Error(data?.message || data?.error || (typeof data === "string" && data) || `Request failed (${res.status})`);
    err.status = res.status; err.data = data; throw err;
  }
  return data;
}

// Read-only cache shared between native screens. Mutations always reach the server.
const cache = new Map();
const inFlight = new Map();
const TTL_MS = 2 * 60 * 1000;
export async function cachedGet(path, ttl = TTL_MS) {
  const now = Date.now();
  const hit = cache.get(path);
  if (hit && now - hit.time < ttl) return hit.data;
  if (inFlight.has(path)) return inFlight.get(path);
  // The disk snapshot opens instantly; the network refresh updates the next render.
  const stored = await withTimeout(readPack('public_' + path), 4000, null);
  if (stored != null) {
    cache.set(path, {data:stored,time:now - ttl});
    const refresh=request(path).then(async data=>{cache.set(path,{data,time:Date.now()});await writePack('public_'+path,data);return data;}).catch(()=>stored).finally(()=>inFlight.delete(path));
    inFlight.set(path,refresh);
    return stored;
  }
  const pending = request(path).then(data => {
    cache.set(path, { data, time: Date.now() });
    writePack('public_'+path,data).catch(()=>{});
    if (cache.size > 24) cache.delete(cache.keys().next().value);
    return data;
  }).finally(() => inFlight.delete(path));
  inFlight.set(path, pending);
  return pending;
}
export function invalidateCachedData(prefix = "") {
  for (const key of cache.keys()) if (!prefix || key.startsWith(prefix)) cache.delete(key);
}

export const api = {
  adminList: name => request(`/api/admin/${encodeURIComponent(name)}`),
  adminCreate: (name,data) => request(`/api/admin/${encodeURIComponent(name)}`,{method:'POST',body:data}),
  adminEdit: (name,id,data) => request(`/api/admin/${encodeURIComponent(name)}/${encodeURIComponent(id)}`,{method:'PATCH',body:data}),
  adminRemove: (name,id) => request(`/api/admin/${encodeURIComponent(name)}/${encodeURIComponent(id)}`,{method:'DELETE'}),
  adminReviewDelete: (kind,id) => request(`/api/admin/reviews/${encodeURIComponent(kind)}/${encodeURIComponent(id)}`,{method:'DELETE'}),
  adminModerateContent: (kind,id,action) => request(`/api/admin/${encodeURIComponent(kind)}/${encodeURIComponent(id)}/${encodeURIComponent(action)}`,{method:'PATCH',body:{}}),
  adminSuggestionAction: (id,action,reason) => request(`/api/admin/update-suggestions/${encodeURIComponent(id)}/${encodeURIComponent(action)}`,{method:'PATCH',body:{reason,admin_reason:reason}}),

  deleteAccountRequest: () => request('/api/auth/account/deletion-request',{method:'POST'}),
  uploadProfileImage: (kind, asset) => {const fd=new FormData();fd.append(kind,{uri:asset.uri,name:`${kind}.jpg`,type:asset.mimeType||'image/jpeg'});return request('/api/profile/me',{method:'POST',body:fd})},
  googleMobile: (idToken) => request("/api/auth/oauth/google/mobile", { method: "POST", body: { id_token: idToken } }),
  forgotPassword: email => request("/api/auth/forgot-password",{method:"POST",body:{email}}),
  deleteListing: id => request(`/api/listings/${encodeURIComponent(id)}`,{method:"DELETE"}),
  deleteCommunityItem: (type,id) => request(`/api/community/${encodeURIComponent(type)}/${encodeURIComponent(id)}`,{method:"DELETE"}),
  editPost: (id,content,category='general') => request(`/api/posts/${encodeURIComponent(id)}`,{method:"PATCH",body:{content,category}}),
  deletePost: id => request(`/api/posts/${encodeURIComponent(id)}`,{method:"DELETE"}),
  deleteComment: id => request(`/api/comments/${encodeURIComponent(id)}`,{method:"DELETE"}),
  deleteListingReview: id => request(`/api/listings/${encodeURIComponent(id)}/reviews/me`,{method:"DELETE"}),
  deleteCommunityReview: (type,id) => request(`/api/community/${encodeURIComponent(type)}/${encodeURIComponent(id)}/reviews/me`,{method:"DELETE"}),
  removeFavorite: (collectionId,itemType,itemId) => request('/api/favorites/items',{method:'DELETE',body:{collection_id:collectionId,item_type:itemType,item_id:String(itemId)}}),
  renameFavoriteCollection: (id,name) => request(`/api/favorites/collections/${encodeURIComponent(id)}`,{method:'PATCH',body:{name}}),
  deleteFavoriteCollection: id => request(`/api/favorites/collections/${encodeURIComponent(id)}`,{method:'DELETE'}),
  markNotification: id => request(`/api/notifications/${encodeURIComponent(id)}`,{method:'PATCH'}),
  markAllNotifications: () => request('/api/notifications/read-all',{method:'POST'}),
  deleteNotification: id => request(`/api/notifications/${encodeURIComponent(id)}`,{method:'DELETE'}),
  createThread: userId => request('/api/chat/threads',{method:'POST',body:{user_id:userId}}),
  markThreadRead: id => request(`/api/chat/threads/${encodeURIComponent(id)}/read`,{method:'POST'}),
  adminUpdateUser: (id,action,payload) => request(`/api/admin/users/${encodeURIComponent(id)}/${encodeURIComponent(action)}`,{method:'PATCH',body:payload}),
  adminDeleteUser: id => request(`/api/admin/users/${encodeURIComponent(id)}`,{method:'DELETE'}),
  adminPosts: () => request("/api/admin/posts"),
  adminDeletePost: id => request(`/api/admin/posts/${encodeURIComponent(id)}`,{method:'DELETE'}),
  login: (email, password) => request("/api/auth/login", { method: "POST", body: { email, password } }),
  register: (username, email, password) => request("/api/auth/register", { method: "POST", body: { username, email, password } }),
  me: () => request("/api/auth/me"),
  changePassword: (currentPassword,newPassword,confirmPassword) => request('/api/auth/change-password',{method:'POST',body:{currentPassword,newPassword,confirmPassword}}),
  publishedContent: key => {
    if(!/^[a-z0-9-]+$/.test(String(key)))throw new Error('Invalid editorial content key');
    return cachedGet(`/api/content/static/${key}`,5*60*1000);
  },
  civicsBanks: () => cachedGet('/api/content/static/citizenship-civics',5*60*1000),
  citizenshipGuide: () => cachedGet('/api/content/static/citizenship-guide',5*60*1000),
  searchSynonyms: () => cachedGet('/api/content/static/search-synonyms',5*60*1000),
  citizenshipAnswers: () => request('/api/citizenship/answers'),
  citizenshipProgress: () => request('/api/citizenship/progress'),
  setCitizenshipProgress: progress => request('/api/citizenship/progress',{method:'PUT',body:{progress}}),
  survivalEnglish: () => request('/api/survival-english'),
  survivalProgress: () => request('/api/survival-english/progress'),
  setSurvivalProgress: mastered => request('/api/survival-english/progress',{method:'PUT',body:{mastered}}),
  adminUsers: () => request('/api/admin/users'),
  notifications: () => request("/api/notifications"),
  roadmapContent: () => cachedGet("/api/content/roadmap-v2", 5 * 60 * 1000),
  journey: () => request("/api/journey/me"),
  setStep: (stepId, status) => request(`/api/journey/progress/${encodeURIComponent(stepId)}`, { method: "PATCH", body: { status } }),
  setChecklist: (stepId, itemId, done) => request(`/api/journey/checklist/${encodeURIComponent(stepId)}/${encodeURIComponent(itemId)}`, { method: "PATCH", body: { done } }),
  addCustom: (stepId, title) => request("/api/journey/custom-items", { method: "POST", body: { step_id: stepId, title } }),
  posts: () => request("/api/posts?limit=50"),
  createPost: (content, category = "general") => request("/api/posts", { method: "POST", body: { content, category } }),
  comments: (postId) => request(`/api/posts/${postId}/comments`),
  addComment: (postId, comment) => request(`/api/posts/${postId}/comments`, { method: "POST", body: { comment } }),
  likePost: (id) => request(`/api/posts/${id}/like`, { method: "POST" }),
  places: () => cachedGet("/api/community/places"),
  placesPage: (page=1,{q='',state='',city=''}={}) => cachedGet(`/api/community/places?paged=1&compact=1&page=${Math.max(1,Number(page)||1)}&limit=24&q=${encodeURIComponent(q)}&state=${encodeURIComponent(state)}&city=${encodeURIComponent(city)}`),
  groups: (q="") => cachedGet(`/api/community/groups?q=${encodeURIComponent(q)}`),
  listings: (type = "services",q="") => cachedGet(`/api/listings?type=${encodeURIComponent(type)}&limit=50&q=${encodeURIComponent(q)}`),
  listing: (id) => request(`/api/listings/${id}`),
  listingReviews: (id) => request(`/api/listings/${id}/reviews`),
  addListingReview: (id, rating, comment) => request(`/api/listings/${id}/reviews`, { method: "POST", body: { rating, comment } }),
  glossary: () => cachedGet("/api/glossary"),
  learn: () => cachedGet("/api/content/learn", 5 * 60 * 1000),
  health: () => request("/api/health"),
  threads: () => request("/api/chat/threads"),
  messages: (threadId) => request(`/api/chat/threads/${threadId}/messages`),
  sendMessage: (threadId, body) => request(`/api/chat/threads/${threadId}/messages`, { method: "POST", body: { body } }),
  cvs: () => request("/api/cvs"),
  createCv: (name, data) => request("/api/cvs", { method: "POST", body: { cv_name: name, cv_data: data } }),
  updateCv: (id,name,data) => request(`/api/cv/${encodeURIComponent(id)}`,{method:'PATCH',body:{cv_name:name,cv_data:data}}),
  deleteCv: id => request(`/api/cv/${encodeURIComponent(id)}`,{method:'DELETE'}),
  updateProfile: (data) => request("/api/profile/me", { method: "PATCH", body: data }),
  favoriteCollections: () => request("/api/favorites/collections"),
  favoriteItems: (collectionId = "") => request(`/api/favorites/items${collectionId ? `?collection_id=${encodeURIComponent(collectionId)}` : ""}`),
  createFavoriteCollection: (name) => request("/api/favorites/collections", { method: "POST", body: { name } }),
  saveFavorite: (collectionId, item) => request("/api/favorites/items", { method: "POST", body: { collection_id: collectionId, item_type: item.item_type || "listing", item_id: String(item.item_id || item.id), title: item.title || item.name || "", image_url: item.image_url || item.image || "", meta: item.meta || {} } }),
  adminListings: () => request("/api/admin/listings"),
  adminListingChanges: () => request("/api/admin/listing-changes"),
  moderateListing: (id,action,reason) => request(`/api/admin/listings/${encodeURIComponent(id)}/${encodeURIComponent(action)}`, {method:"PATCH",body:{reason}}),
  moderateChange: (id,action,reason) => request(`/api/admin/listing-changes/${encodeURIComponent(id)}/${encodeURIComponent(action)}`, {method:"PATCH",body:{reason}}),
  myRequests: (status="all", page=1) => request(`/api/me/requests?status=${encodeURIComponent(status)}&page=${Number(page)||1}&limit=15`),
  updateListing: (id, payload) => request(`/api/listings/${encodeURIComponent(id)}`, {method:"PATCH",body:payload}),
  updateCommunityItem: (type,id,payload) => request(`/api/community/${encodeURIComponent(type)}/${encodeURIComponent(id)}`, {method:"PATCH",body:payload}),
  resubmitChange: (id,payload) => request(`/api/me/listing-changes/${encodeURIComponent(id)}/resubmit`, {method:"PATCH",body:payload}),
  verificationStatus: () => request("/api/verifications/status"),
  verificationRequest: (formData) => request("/api/verification/request", { method: "POST", body: formData }),
  resources: (category, stateCode = "", limit = 100) => cachedGet(`/api/resources?category=${encodeURIComponent(category)}&limit=${limit}${stateCode ? `&state=${encodeURIComponent(stateCode)}` : ""}`),
  resourceReviews: (id) => request(`/api/resources/${id}/reviews`),
  voteResource: (id, vote) => request(`/api/resources/${id}/vote`, { method: "PUT", body: { vote } }),
  reviewResource: (id, payload) => request(`/api/resources/${id}/review`, { method: "PUT", body: payload }),
  deleteResourceReview: (id) => request(`/api/resources/${id}/review`, { method: "DELETE" }),
  suggestResource: (payload) => request("/api/resources/suggestions", { method: "POST", body: payload }),
  glossarySuggest: (payload) => request("/api/glossary/suggestions", { method: "POST", body: payload }),
  createCommunityPlace: (payload) => request("/api/community/places", { method: "POST", body: payload }),
  createCommunityGroup: (payload) => request("/api/community/groups", { method: "POST", body: payload }),
  createListing: (payload) => request("/api/listings", { method: "POST", body: payload }),
  communityItem: (type, id) => request(`/api/community/${encodeURIComponent(type)}/${encodeURIComponent(id)}`),
  communityReviews: (type, id) => request(`/api/community/${encodeURIComponent(type)}/${encodeURIComponent(id)}/reviews`),
  addCommunityReview: (type, id, rating, comment) => request(`/api/community/${encodeURIComponent(type)}/${encodeURIComponent(id)}/reviews`, { method: "POST", body: { stars: rating, rating, score: rating, text: comment, comment, body: comment, kind: type } }),
  favoriteStatus: (itemType, itemId) => request(`/api/favorites/status?item_type=${encodeURIComponent(itemType)}&item_id=${encodeURIComponent(itemId)}`),
  stateResource: (stateCode) => request(`/api/state-resources/${encodeURIComponent(stateCode)}`)
};

export function rows(data, keys = []) {
  if (Array.isArray(data)) return data;
  for (const k of keys) if (Array.isArray(data?.[k])) return data[k];
  for (const k of ["items", "data", "results"]) if (Array.isArray(data?.[k])) return data[k];
  return [];
}
