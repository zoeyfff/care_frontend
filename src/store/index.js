import { createStore } from "vuex";
import request from "@/utils/request";

const TOKEN_KEY = "staff_token";
const USER_KEY = "staff_user";
const PORTAL_KEY = "staff_portal";
const PERMISSIONS_KEY = "staff_permissions";
const ROLE_CODES_KEY = "staff_role_codes";

function normalizeRoleCodes(roleCodes, permissions = []) {
  if (Array.isArray(roleCodes) && roleCodes.length) return roleCodes;
  // 兼容旧数据：从 permissions 中检测角色
  if (permissions.some((p) => String(p).toUpperCase().includes("NURSE"))) {
    return ["NURSE"];
  }
  if (permissions.some((p) => String(p).toUpperCase().includes("FAMILY"))) {
    return ["FAMILY"];
  }
  return ["ADMIN"];
}

function resolveHomePath(roleCodes = [], permissions = []) {
  const roles = normalizeRoleCodes(roleCodes, permissions).map((r) =>
    String(r).toUpperCase()
  );
  if (roles.includes("NURSE")) return "/nurse/dashboard";
  if (roles.includes("FAMILY")) return "/family/dashboard";
  return "/staff/dashboard";
}

function resolvePortalByHomePath(path) {
  const p = String(path || "").toLowerCase();
  if (p.startsWith("/nurse")) return "nurse";
  if (p.startsWith("/family")) return "family";
  return "staff";
}

export default createStore({
  state: {
    sidebarCollapse: false,
    user: null,
    permissions: [],
    roleCodes: [],
    portal: "staff", // staff | nurse（演示：登录选择）
  },
  getters: {
    displayName: (s) => s.user?.real_name || s.user?.username || "工作人员",
    portal: (s) => s.portal,
    permissions: (s) => s.permissions,
    roleCodes: (s) => s.roleCodes,
    homePath: (s) => resolveHomePath(s.roleCodes, s.permissions),
  },
  mutations: {
    SET_SIDEBAR(state, v) {
      state.sidebarCollapse = v;
    },
    TOGGLE_SIDEBAR(state) {
      state.sidebarCollapse = !state.sidebarCollapse;
    },
    SET_USER(state, user) {
      state.user = user;
    },
    SET_PERMISSIONS(state, permissions) {
      state.permissions = Array.isArray(permissions) ? permissions : [];
    },
    SET_ROLE_CODES(state, roleCodes) {
      state.roleCodes = Array.isArray(roleCodes) ? roleCodes : [];
    },
    SET_PORTAL(state, portal) {
      state.portal = portal || "staff";
    },
    CLEAR_USER(state) {
      state.user = null;
      state.permissions = [];
      state.roleCodes = [];
    },
  },
  actions: {
    async login({ commit }, { username, password }) {
      const res = await request.post("/auth/login", {
        username,
        password,
      });
      const token = res?.data?.token;
      const user = res?.data?.user;
      if (!token || !user) {
        throw new Error("登录响应缺少 token 或 user");
      }
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.setItem(PERMISSIONS_KEY, JSON.stringify([]));
      localStorage.setItem(ROLE_CODES_KEY, JSON.stringify([]));

      commit("SET_USER", user);
      commit("SET_PERMISSIONS", []);
      commit("SET_ROLE_CODES", []);

      // 可选拉取权限，失败不影响已登录态
      try {
        const me = await request.get("/auth/me");
        const meUser = me?.data?.user;
        const permissions = me?.data?.permissions || [];
        const roleCodes = normalizeRoleCodes(me?.data?.roleCodes, permissions);
        if (meUser) {
          localStorage.setItem(USER_KEY, JSON.stringify(meUser));
          commit("SET_USER", meUser);
        }
        localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions));
        localStorage.setItem(ROLE_CODES_KEY, JSON.stringify(roleCodes));
        const homePath = resolveHomePath(roleCodes, permissions);
        localStorage.setItem(PORTAL_KEY, resolvePortalByHomePath(homePath));
        commit("SET_PERMISSIONS", permissions);
        commit("SET_ROLE_CODES", roleCodes);
        commit("SET_PORTAL", resolvePortalByHomePath(homePath));
      } catch (e) {
        const roleCodes = normalizeRoleCodes([], []);
        localStorage.setItem(ROLE_CODES_KEY, JSON.stringify(roleCodes));
        localStorage.setItem(PORTAL_KEY, "staff");
        commit("SET_ROLE_CODES", roleCodes);
        commit("SET_PORTAL", "staff");
      }
    },

    async restoreSession({ commit }) {
      const token = localStorage.getItem(TOKEN_KEY);
      const portal = localStorage.getItem(PORTAL_KEY) || "staff";
      commit("SET_PORTAL", portal);
      if (!token) {
        commit("CLEAR_USER");
        return;
      }

      const rawUser = localStorage.getItem(USER_KEY);
      const rawPermissions = localStorage.getItem(PERMISSIONS_KEY);
      const rawRoleCodes = localStorage.getItem(ROLE_CODES_KEY);
      if (rawUser) {
        try {
          commit("SET_USER", JSON.parse(rawUser));
        } catch (e) {
          commit("SET_USER", null);
        }
      }
      if (rawPermissions) {
        try {
          commit("SET_PERMISSIONS", JSON.parse(rawPermissions));
        } catch (e) {
          commit("SET_PERMISSIONS", []);
        }
      }
      if (rawRoleCodes) {
        try {
          commit("SET_ROLE_CODES", JSON.parse(rawRoleCodes));
        } catch (e) {
          commit("SET_ROLE_CODES", []);
        }
      }

      // 启动时校验并刷新当前用户
      try {
        const me = await request.get("/auth/me");
        const meUser = me?.data?.user;
        const permissions = me?.data?.permissions || [];
        const roleCodes = normalizeRoleCodes(me?.data?.roleCodes, permissions);
        if (meUser) {
          localStorage.setItem(USER_KEY, JSON.stringify(meUser));
          commit("SET_USER", meUser);
        }
        localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions));
        localStorage.setItem(ROLE_CODES_KEY, JSON.stringify(roleCodes));
        const homePath = resolveHomePath(roleCodes, permissions);
        localStorage.setItem(PORTAL_KEY, resolvePortalByHomePath(homePath));
        commit("SET_PERMISSIONS", permissions);
        commit("SET_ROLE_CODES", roleCodes);
        commit("SET_PORTAL", resolvePortalByHomePath(homePath));
      } catch (e) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(PERMISSIONS_KEY);
        localStorage.removeItem(ROLE_CODES_KEY);
        commit("CLEAR_USER");
      }
    },

    async logout({ commit }) {
      try {
        await request.post("/auth/logout");
      } catch (e) {
        // ignore
      }
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(PORTAL_KEY);
      localStorage.removeItem(PERMISSIONS_KEY);
      localStorage.removeItem(ROLE_CODES_KEY);
      commit("CLEAR_USER");
    },
  },
  modules: {},
});
