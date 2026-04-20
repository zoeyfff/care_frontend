import { createRouter, createWebHashHistory } from "vue-router";
import store from "../store";

const routes = [
  {
    path: "/login",
    name: "login",
    component: () => import("../views/auth/LoginStaff.vue"),
    meta: { public: true, title: "登录" },
  },
  {
    path: "/",
    redirect: "/staff/dashboard",
  },
  {
    path: "/staff",
    component: () => import("../layouts/StaffLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "dashboard",
        name: "staff-dashboard",
        component: () => import("../views/staff/DashboardStaff.vue"),
        meta: { title: "工作台" },
      },
      {
        path: "elders",
        name: "staff-elders",
        component: () => import("../views/staff/ElderManage.vue"),
        meta: { title: "长者管理" },
      },
      {
        path: "care-tasks",
        name: "staff-care-tasks",
        component: () => import("../views/staff/CareTaskManage.vue"),
        meta: { title: "护理任务" },
      },
      {
        path: "rooms",
        name: "staff-rooms",
        component: () => import("../views/staff/RoomManage.vue"),
        meta: { title: "房间资源" },
      },
      {
        path: "health",
        name: "staff-health",
        component: () => import("../views/staff/HealthMonitor.vue"),
        meta: { title: "健康监测" },
      },
      {
        path: "checkin-bill",
        name: "staff-checkin-bill",
        component: () => import("../views/staff/CheckinBill.vue"),
        meta: { title: "入住与费用" },
      },
      {
        path: "feedback",
        name: "staff-feedback",
        component: () => import("../views/staff/FeedbackStaff.vue"),
        meta: { title: "家属反馈" },
      },
      {
        path: "notice-activity",
        name: "staff-notice-activity",
        component: () => import("../views/staff/NoticeActivity.vue"),
        meta: { title: "公告与活动" },
      },
      {
        path: "files",
        name: "staff-files",
        component: () => import("../views/staff/FileCenter.vue"),
        meta: { title: "文件中心" },
      },
      {
        path: "data-io",
        name: "staff-data-io",
        component: () => import("../views/staff/DataImportExport.vue"),
        meta: { title: "数据导入导出" },
      },
      {
        path: "system-rbac",
        name: "staff-system-rbac",
        component: () => import("../views/staff/SystemRbac.vue"),
        meta: { title: "权限与用户" },
      },
    ],
  },
  {
    path: "/nurse",
    component: () => import("../layouts/NurseLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "dashboard",
        name: "nurse-dashboard",
        component: () => import("../views/nurse/NurseDashboard.vue"),
        meta: { title: "我的工作台" },
      },
      {
        path: "tasks",
        name: "nurse-tasks",
        component: () => import("../views/nurse/NurseTasks.vue"),
        meta: { title: "我的任务" },
      },
      {
        path: "vitals",
        name: "nurse-vitals",
        component: () => import("../views/nurse/NurseVitals.vue"),
        meta: { title: "体征录入" },
      },
      {
        path: "medications",
        name: "nurse-medications",
        component: () => import("../views/nurse/NurseMedications.vue"),
        meta: { title: "用药执行" },
      },
      {
        path: "handover",
        name: "nurse-handover",
        component: () => import("../views/nurse/NurseHandover.vue"),
        meta: { title: "交接班" },
      },
      {
        path: "incidents",
        name: "nurse-incidents",
        component: () => import("../views/nurse/NurseIncidents.vue"),
        meta: { title: "事件上报" },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("staff_token");
  if (to.meta.public) {
    if (token && to.path === "/login") {
      next({ path: "/staff/dashboard" });
      return;
    }
    next();
    return;
  }
  if (!token) {
    next({ path: "/login", query: { redirect: to.fullPath } });
    return;
  }
  if (!store.state.user) {
    store.dispatch("restoreSession");
  }
  next();
});

export default router;
