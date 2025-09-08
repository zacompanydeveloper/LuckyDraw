// src/utils/auth.js
export function getUserToken() {
  return localStorage.getItem("userToken");
}

export function getAdminToken() {
  return localStorage.getItem("adminToken");
}

export function isUserAuthenticated() {
  return !!getUserToken();
}

export function isAdminAuthenticated() {
  return !!getAdminToken();
}

export function logoutUser() {
  localStorage.removeItem("userToken");
}

export function logoutAdmin() {
  localStorage.removeItem("adminToken");
}
