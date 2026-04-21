import { createStore } from "vuex";
import request from "@/utils/request";

const TOKEN_KEY = "staff_token";
const USER_KEY = "staff_user";
const PORTAL_KEY = "staff_portal";
const PERMISSIONS_KEY = "staff_permissions";

export default createStore({
  state: {
    sidebarCollapse: false,
    user: null,
    permissions: [],
    portal: "staff", // staff | nurse（演示：登录选择）
  },
  getters: {
    displayName: (s) => s.user?.real_name || s.user?.username || "工作人员",
    portal: (s) => s.portal,
    permissions: (s) => s.permissions,
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
    SET_PORTAL(state, portal) {
      state.portal = portal || "staff";
    },
    CLEAR_USER(state) {
      state.user = null;
      state.permissions = [];
    },
  },
  actions: {
    async login({ commit }, { username, password, portal }) {
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
      localStorage.setItem(PORTAL_KEY, portal || "staff");
      localStorage.setItem(PERMISSIONS_KEY, JSON.stringify([]));

      commit("SET_PORTAL", portal || "staff");
      commit("SET_USER", user);
      commit("SET_PERMISSIONS", []);

      // 可选拉取权限，失败不影响已登录态
      try {
        const me = await request.get("/auth/me");
        const meUser = me?.data?.user;
        const permissions = me?.data?.permissions || [];
        if (meUser) {
          localStorage.setItem(USER_KEY, JSON.stringify(meUser));
          commit("SET_USER", meUser);
        }
        localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions));
        commit("SET_PERMISSIONS", permissions);
      } catch (e) {
        // ignore
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

      // 启动时校验并刷新当前用户
      try {
        const me = await request.get("/auth/me");
        const meUser = me?.data?.user;
        const permissions = me?.data?.permissions || [];
        if (meUser) {
          localStorage.setItem(USER_KEY, JSON.stringify(meUser));
          commit("SET_USER", meUser);
        }
        localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions));
        commit("SET_PERMISSIONS", permissions);
      } catch (e) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(PERMISSIONS_KEY);
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
      commit("CLEAR_USER");
    },
  },
  modules: {},
});
