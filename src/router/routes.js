export const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("@/pages/Home.vue"),
  },
  {
    path: "/lucky-draw/:signature/:tracking_code",
    name: "lucky-draw",
    component: () => import("@/pages/LuckyDraw.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFound.vue"),
  },
  {
    path: "/admin-panel",
    name: "admin-panel",
    component: () => import("@/pages/AdminPanel.vue"),
    meta: { requiresAdminAuth: true }, // protected route
  },
  {
    path: "/admin-login",
    name: "admin-login",
    component: () => import("@/pages/AdminLogin.vue"),
    meta: { guest: true, role: "admin" }, // guest-only route
  },
];

export default routes;
