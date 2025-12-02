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
    path: "/admin-panel/pre-print-code",
    name: "admin-panel-pre-print-code",
    component: () => import("@/pages/PrePrintCode.vue"),
    meta: {
      requiresAdminAuth: true,
      permissions: ["view-preprint"],
    }, // protected route
  },
  {
    path: "/admin-login",
    name: "admin-login",
    component: () => import("@/pages/AdminLogin.vue"),
    meta: {
      guest: true,
      role: "admin",
    }, // guest-only route
  },
  {
    path: "/admin-panel/products/:id",
    name: "admin-panel-product-details",
    component: () => import("@/pages/ProductDetails.vue"),
    meta: {
      requiresAdminAuth: true,
      permissions: ["view-product-details"],
    }, // protected route
  },
  {
    path: "/admin-panel/code-registration",
    name: "admin-panel-code-registration",
    component: () => import("@/pages/CodeRegistration.vue"),
    meta: {
      requiresAdminAuth: true,
      permissions: ["activate-lucky-draw"],
    }, // protected route
  },
  {
    path: "/admin-panel/sms-records",
    name: "admin-panel-sms-records",
    component: () => import("@/pages/SmsRecords.vue"),
    meta: {
      requiresAdminAuth: true,
      permissions: ["view-sms"],
    }, // protected route
  },
  {
    path: "/admin-panel/lucky-draw",
    name: "admin-panel-lucky-draw",
    component: () => import("@/pages/LuckyDrawRecords.vue"),
    meta: {
      requiresAdminAuth: true,
      permissions: ["view-lucky-draw"],
    }, // protected route
  },
  {
    path: "/admin-panel/lucky-draw/:id",
    name: "admin-panel-lucky-draw-details",
    component: () => import("@/pages/LuckyDrawDetails.vue"),
    meta: {
      requiresAdminAuth: true,
      permissions: ["manage-lucky-draw"],
    }, // protected route
  },
  {
    path: "/admin-panel/prizes",
    name: "admin-panel-prizes",
    component: () => import("@/pages/Prizes.vue"),
    meta: {
      requiresAdminAuth: true,
      permissions: ["manage-prize"],
    }, // protected route
  },
  {
    path: "/admin-panel/403",
    name: "forbidden",
    component: () => import("@/views/Forbidden.vue"),
  },
  {
    path: "/admin-panel/playground",
    name: "admin-panel-playground",
    component: () => import("@/pages/Playground.vue"),
    meta: {
      requiresAdminAuth: true,
      permissions: ["view-playground"],
    }, // protected route
  },
  {
    path: "/admin-panel/spin-luck-draw",
    name: "admin-panel-spin-luck-draw",
    component: () => import("@/pages/SpinLuckDraw.vue"),
    meta: {
      requiresAdminAuth: true,
      // permissions: ["manage-spin-luck-draw"],
    }, // protected route
  },
  {
    path: "/admin-panel/ticket-winner",
    name: "admin-panel-ticket-winner",
    component: () => import("@/pages/TicketWinner.vue"),
    meta: {
      requiresAdminAuth: true,
      // permissions: ["manage-ticket-winner"],
    }, // protected route
  },
  {
    path: "/admin-panel/spin-luck-employee-draw",
    name: "admin-panel-spin-luck-employee-draw",
    component: () => import("@/pages/SpinLuckEmployeeDraw.vue"),
    meta: {
      requiresAdminAuth: true,
      permissions: ["manage-employee-lucky-draw"],
    }, // protected route
  },
  {
    path: "/admin-panel/reward",
    name: "admin-panel-reward",
    component: () => import("@/pages/Reward.vue"),
    meta: {
      requiresAdminAuth: true,
      permissions: ["manage-employee-reward"],
    }, // protected route
  },
  {
    path: "/admin-panel/winner-employees",
    name: "admin-panel-winner-employees",
    component: () => import("@/pages/WinnerEmployee.vue"),
    meta: {
      requiresAdminAuth: true,
      permissions: ["manage-employee-lucky-draw"],
    }, // protected route
  },
];

export default routes;
