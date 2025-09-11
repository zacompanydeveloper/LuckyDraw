export function checkPermission(permission) {
  const userPermissions = localStorage.getItem("userPermissions") || "[]";

  return userPermissions.includes(permission);
}
